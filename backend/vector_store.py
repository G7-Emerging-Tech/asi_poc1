"""
RAG chunk storage and hybrid retrieval, backed by Postgres + pgvector.

Kept separate from Prisma: prisma-client-py can't read/write pgvector's
`vector` column type, so this module talks to Postgres directly via asyncpg
for the RAG tables. All other tables stay on Prisma.
"""
import json
import os
from typing import Optional

import asyncpg

EMBEDDING_DIM = 2000  # truncated qwen3-embedding:8b output (see embeddings.py)

_pool: Optional[asyncpg.Pool] = None

CREATE_TABLE_SQL = f"""
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rag_chunk (
    id                  SERIAL PRIMARY KEY,
    doc_id              TEXT NOT NULL REFERENCES ingested_document(doc_id) ON DELETE CASCADE,
    chunk_index         INTEGER NOT NULL DEFAULT 0,
    structured_content  TEXT NOT NULL,
    raw_metadata        JSONB,
    part_number         TEXT,
    ata_chapter         TEXT,
    file_type           TEXT,
    embedding           VECTOR({EMBEDDING_DIM}),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rag_chunk_embedding_hnsw
    ON rag_chunk USING hnsw (embedding vector_cosine_ops);

CREATE INDEX IF NOT EXISTS rag_chunk_fts_gin
    ON rag_chunk USING gin (to_tsvector('english', structured_content));

CREATE INDEX IF NOT EXISTS rag_chunk_part_number_idx ON rag_chunk (part_number);
"""


def _asyncpg_dsn() -> str:
    # Prisma's DATABASE_URL carries a "?schema=public" query param that
    # asyncpg doesn't understand (it's not a real libpq connection option).
    return os.environ["DATABASE_URL"].split("?", 1)[0]


async def connect():
    global _pool
    _pool = await asyncpg.create_pool(dsn=_asyncpg_dsn())
    async with _pool.acquire() as conn:
        await conn.execute(CREATE_TABLE_SQL)


async def disconnect():
    if _pool is not None:
        await _pool.close()


def _to_vector_literal(embedding: list) -> str:
    return "[" + ",".join(str(x) for x in embedding) + "]"


async def insert_chunk(
    doc_id: str,
    chunk_index: int,
    structured_content: str,
    raw_metadata: dict,
    part_number: Optional[str],
    ata_chapter: Optional[str],
    file_type: str,
    embedding: list,
) -> int:
    async with _pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO rag_chunk
                (doc_id, chunk_index, structured_content, raw_metadata, part_number, ata_chapter, file_type, embedding)
            VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8::vector)
            RETURNING id
            """,
            doc_id, chunk_index, structured_content, json.dumps(raw_metadata),
            part_number, ata_chapter, file_type, _to_vector_literal(embedding),
        )
        return row["id"]


async def hybrid_search(query_text: str, query_embedding: list, top_k: int = 50) -> list:
    """Reciprocal Rank Fusion of pgvector cosine similarity and Postgres full-text search."""
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            """
            WITH vector_hits AS (
                SELECT id, ROW_NUMBER() OVER (ORDER BY embedding <=> $1::vector) AS rank
                FROM rag_chunk
            ),
            fts_hits AS (
                SELECT id, ROW_NUMBER() OVER (
                    ORDER BY ts_rank(to_tsvector('english', structured_content), plainto_tsquery('english', $2)) DESC
                ) AS rank
                FROM rag_chunk
                WHERE to_tsvector('english', structured_content) @@ plainto_tsquery('english', $2)
            ),
            fused AS (
                SELECT id, SUM(1.0 / (60 + rank)) AS combined_score
                FROM (
                    SELECT id, rank FROM vector_hits
                    UNION ALL
                    SELECT id, rank FROM fts_hits
                ) all_hits
                GROUP BY id
            )
            SELECT c.id, c.doc_id, c.chunk_index, c.structured_content, c.part_number, c.ata_chapter,
                   f.combined_score
            FROM fused f
            JOIN rag_chunk c ON c.id = f.id
            ORDER BY f.combined_score DESC
            LIMIT $3
            """,
            _to_vector_literal(query_embedding), query_text, top_k,
        )
        return [dict(r) for r in rows]


async def delete_chunk(chunk_id: int) -> None:
    async with _pool.acquire() as conn:
        await conn.execute("DELETE FROM rag_chunk WHERE id = $1", chunk_id)
