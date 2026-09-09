"""
Embedding generation via the local Ollama server (qwen3-embedding:8b).

qwen3-embedding:8b natively outputs 4096-dim vectors, but pgvector's HNSW/
ivfflat indexes cap at 2000 dims. Qwen3-Embedding is trained with Matryoshka
Representation Learning (MRL), which means a truncated prefix of the full
vector is still a valid embedding on its own — it just needs to be
L2-renormalized afterward so cosine similarity (dot product of unit vectors)
stays mathematically correct.
"""
from typing import List

import numpy as np
import ollama

MODEL = "qwen3-embedding:8b"
TRUNCATED_DIM = 2000


def _truncate_and_normalize(vector: List[float]) -> List[float]:
    v = np.array(vector[:TRUNCATED_DIM], dtype=np.float32)
    norm = np.linalg.norm(v)
    if norm > 0:
        v = v / norm
    return v.tolist()


def embed_text(text: str) -> List[float]:
    response = ollama.embed(model=MODEL, input=text)
    return _truncate_and_normalize(response["embeddings"][0])


def embed_batch(texts: List[str]) -> List[List[float]]:
    return [embed_text(t) for t in texts]
