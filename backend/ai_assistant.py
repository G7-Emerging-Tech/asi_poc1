"""
AI Assistant chat: local Ollama (gpt-oss:20b) grounded in ASI system data.

Context comes from two sources: (1) RAG search over rag_chunk, populated by
the Document Intelligence page's /api/rag/ingest, and (2) a live snapshot of
the structured tables (aircraft registry, fatigue, defects, corrosion, SLEP)
that back every other page in the app.
"""
from typing import List, Optional

import ollama

CHAT_MODEL = "gpt-oss:20b"

SYSTEM_PROMPT = (
    "You the AI Assistant for an F/A-18D Aircraft Structural Integrity (ASI) system. "
    "Answer the user's question using ONLY the CONTEXT below — fleet data and excerpts from "
    "uploaded engineering documents. If the context doesn't contain the answer, say so plainly "
    "instead of guessing. Be concise and cite aircraft tail IDs / document names when relevant."
)


async def build_fleet_context(prisma, tail_id: Optional[str] = None) -> str:
    aircraft = await prisma.aircraftregistry.find_many()
    if tail_id:
        aircraft = [a for a in aircraft if a.tailId == tail_id]
        if not aircraft:
            return f"No aircraft found with tail ID {tail_id}."

    tail_ids = {a.tailId for a in aircraft}
    fatigue = await prisma.fatiguelifeindex.find_many()
    defects = await prisma.defectncrd.find_many()
    corrosion = await prisma.corrosionfinding.find_many()
    slep = await prisma.sleprecord.find_many()

    if tail_id:
        fatigue = [f for f in fatigue if f.aircraftId in tail_ids]
        defects = [d for d in defects if d.aircraftId in tail_ids]
        corrosion = [c for c in corrosion if c.aircraftId in tail_ids]
        slep = [s for s in slep if s.aircraftId in tail_ids]

    flei_by_ac = {}
    for f in fatigue:
        if f.wrFleiCurrent and f.wrFleiCurrent > flei_by_ac.get(f.aircraftId, 0):
            flei_by_ac[f.aircraftId] = f.wrFleiCurrent

    lines = [f"FLEET SUMMARY{' (scoped to ' + tail_id + ')' if tail_id else ''}:"]
    for a in aircraft:
        lines.append(
            f"- {a.tailId} (BuNo {a.buno}): status={a.status}, totalAFH={a.totalAfh}, "
            f"lifeConsumed={a.lifePercentConsumed}%, WR-FLEI={flei_by_ac.get(a.tailId, 'n/a')}, "
            f"defectsCum={a.totalDefectsCum}, corrosionsLatestCycle={a.corrosionsLatestCycle}, "
            f"nextPMI2={a.nextServicingPmi2}"
        )

    black_line = [d for d in defects if d.isBlackLineEntry]
    lines.append(f"\nDEFECTS: {len(defects)} total, {len(black_line)} black-line entries.")
    for d in black_line[:15]:
        lines.append(f"- {d.ncrdRef} on {d.aircraftId}: {d.title or d.description} (status={d.status})")

    lines.append(f"\nCORROSION FINDINGS: {len(corrosion)} total.")
    for c in corrosion[:15]:
        lines.append(f"- {c.corrosionId} on {c.aircraftId}: {c.location}, {c.grade}")

    if slep:
        lines.append(f"\nSLEP RECORDS: {len(slep)} total.")
        for s in slep[:10]:
            lines.append(f"- {s.slepRef} on {s.aircraftId}: {s.originalLimit} -> {s.extendedLimit} AFH ({s.status})")

    return "\n".join(lines)


async def build_suggestions(prisma, tail_id: Optional[str] = None) -> List[str]:
    """Suggested questions naming real tail IDs, so every suggestion is answerable from current data."""
    aircraft = await prisma.aircraftregistry.find_many()
    if not aircraft:
        return ["What data is currently in the system?"]

    if tail_id:
        selected = next((a for a in aircraft if a.tailId == tail_id), None)
        if not selected:
            return [f"No aircraft found with tail ID {tail_id}."]
        return [
            f"What is the current status and total AFH of {selected.tailId}?",
            f"What is the corrosion status of {selected.tailId}?",
            f"What is the WR-FLEI and fatigue trend for {selected.tailId}?",
            f"How many black line entries are active on {selected.tailId}?",
            f"When is the next LPM12Y induction scheduled for {selected.tailId}?",
        ]

    highest_afh = max(aircraft, key=lambda a: a.totalAfh or 0)
    corroded = next((a for a in aircraft if a.corrosionsLatestCycle), aircraft[0])
    defected = max(aircraft, key=lambda a: a.totalDefectsCum or 0)

    return [
        "What is the current highest WR FLEI in the fleet?",
        "How many black line entries are active?",
        f"What is the corrosion status of {corroded.tailId}?",
        f"When is the next LPM12Y induction scheduled for {highest_afh.tailId}?",
        f"What is the total AFH and defect history for {defected.tailId}?",
    ]


async def build_document_context(query: str, top_k: int = 5) -> List[dict]:
    import embeddings as embeddings_module
    import reranker as reranker_module
    import vector_store

    query_embedding = embeddings_module.embed_text(query)
    candidates = await vector_store.hybrid_search(query, query_embedding, top_k=50)
    return reranker_module.rerank(query, candidates, top_k=top_k)


async def answer(prisma, message: str, tail_id: Optional[str] = None) -> dict:
    fleet_context = await build_fleet_context(prisma, tail_id)
    doc_chunks = await build_document_context(message)

    doc_context = "\n\n".join(
        f"[Document chunk from {c['doc_id']}]\n{c['structured_content']}" for c in doc_chunks
    )

    context = fleet_context
    if doc_context:
        context += "\n\nRELEVANT DOCUMENT EXCERPTS:\n" + doc_context

    response = ollama.chat(
        model=CHAT_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"CONTEXT:\n{context}\n\nQUESTION: {message}"},
        ],
    )

    return {
        "response": response["message"]["content"],
        "sources": sorted({c["doc_id"] for c in doc_chunks}),
    }
