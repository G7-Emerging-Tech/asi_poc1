"""
Cross-encoder reranking via Qwen3-Reranker-8B, served locally by Ollama.

Qwen3-Reranker is trained as a binary yes/no relevance judge, not a
free-form scorer — asking it to output a numeric score directly is
unreliable. Instead we ask for exactly one token and read the log-
probabilities Ollama's native /api/generate endpoint returns for it
(with raw=True to skip the chat template, which otherwise makes this
GGUF's thinking mode emit "<think>" as the first token instead of an
answer), extract the "yes" vs "no" logprobs, and softmax them into a
P(yes) relevance score. This matches how the model was actually trained
to judge relevance. (Ollama's OpenAI-compatible /v1/completions endpoint
does not return logprobs, hence using the native API instead.)
"""
import math
from typing import List, Dict

import httpx

MODEL = "dengcao/Qwen3-Reranker-8B:q8_0"
OLLAMA_GENERATE_URL = "http://localhost:11434/api/generate"

INSTRUCTION = "Given a search query and an engineering document, judge whether the document is relevant to the query."

PROMPT_TEMPLATE = (
    "<Instruct>: {instruction}\n<Query>: {query}\n<Document>: {document}\n"
    "Answer strictly with 'yes' or 'no'.\n"
)


def _score_candidate(client: httpx.Client, query: str, document: str) -> float:
    prompt = PROMPT_TEMPLATE.format(instruction=INSTRUCTION, query=query, document=document)
    resp = client.post(
        OLLAMA_GENERATE_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "raw": True,
            "stream": False,
            "options": {"num_predict": 1, "temperature": 0},
            "logprobs": True,
            "top_logprobs": 20,
        },
        timeout=60,
    )
    resp.raise_for_status()
    top_logprobs = resp.json()["logprobs"][0]["top_logprobs"]

    yes_lp = next((t["logprob"] for t in top_logprobs if t["token"].strip().lower() == "yes"), None)
    no_lp = next((t["logprob"] for t in top_logprobs if t["token"].strip().lower() == "no"), None)
    if yes_lp is None and no_lp is None:
        return 0.0
    yes_lp = yes_lp if yes_lp is not None else -100.0
    no_lp = no_lp if no_lp is not None else -100.0
    yes_p = math.exp(yes_lp)
    no_p = math.exp(no_lp)
    return yes_p / (yes_p + no_p) if (yes_p + no_p) > 0 else 0.0


def rerank(query: str, candidates: List[Dict], top_k: int = 5) -> List[Dict]:
    if not candidates:
        return []
    with httpx.Client() as client:
        scored = []
        for c in candidates:
            score = _score_candidate(client, query, c["structured_content"])
            scored.append({**c, "rerank_score": score})
    scored.sort(key=lambda c: c["rerank_score"], reverse=True)
    return scored[:top_k]
