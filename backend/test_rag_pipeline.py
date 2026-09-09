"""
Smallest end-to-end check of the RAG pipeline: chunk a tiny CSV, embed it via
Ollama (qwen3-embedding:8b), store it in rag_chunk, hybrid-search for it,
rerank via Ollama (dengcao/Qwen3-Reranker-8B), confirm it survives to the
top result, then clean up. Run with: python test_rag_pipeline.py

Requires a running local Ollama server with both models pulled.
"""
import asyncio
from dotenv import load_dotenv

load_dotenv()

from prisma import Prisma
import vector_store
import rag_chunking
import embeddings
import reranker


async def main():
    prisma = Prisma()
    await prisma.connect()
    await vector_store.connect()

    doc_id = "test-rag-doc"
    await prisma.ingesteddocument.delete_many(where={"docId": doc_id})  # clean up any leftover from a prior failed run
    await prisma.ingesteddocument.create(
        data={"docId": doc_id, "filename": "test.csv", "fileType": "csv"}
    )

    headers = ["Part Number", "Aircraft Model", "ATA Chapter", "Description"]
    rows = [["BACB30LU6K4", "F/A-18D", "57", "Wing fold hinge bolt"]]
    chunks = rag_chunking.chunk_tabular(headers, rows, "test.csv")
    assert len(chunks) == 1

    chunk_ids = []
    for i, chunk in enumerate(chunks):
        embedding = embeddings.embed_text(chunk)
        assert len(embedding) == vector_store.EMBEDDING_DIM
        metadata = rag_chunking.extract_row_metadata(chunk)
        chunk_id = await vector_store.insert_chunk(
            doc_id=doc_id, chunk_index=i, structured_content=chunk,
            raw_metadata=metadata, part_number=metadata["part_number"],
            ata_chapter=metadata["ata_chapter"], file_type="csv", embedding=embedding,
        )
        chunk_ids.append(chunk_id)

    query = "wing fold hinge bolt part number BACB30LU6K4"
    query_embedding = embeddings.embed_text(query)
    candidates = await vector_store.hybrid_search(query, query_embedding, top_k=50)
    assert any(c["id"] == chunk_ids[0] for c in candidates), "expected chunk in hybrid search results"

    reranked = reranker.rerank(query, candidates, top_k=5)
    assert reranked and reranked[0]["id"] == chunk_ids[0], "expected chunk to rank first after reranking"

    for cid in chunk_ids:
        await vector_store.delete_chunk(cid)
    await prisma.ingesteddocument.delete(where={"docId": doc_id})

    await vector_store.disconnect()
    await prisma.disconnect()
    print("OK: RAG pipeline (chunk -> embed -> hybrid search -> rerank) round-trip passed")


if __name__ == "__main__":
    asyncio.run(main())
