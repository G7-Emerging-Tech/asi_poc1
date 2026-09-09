"""
Chunking and lightweight metadata extraction for the RAG ingestion pipeline.

Tabular data (Excel/CSV) is chunked one row at a time, with every value
flattened alongside its column header, so a number is never separated from
what it means. Free text (PDF/Word/plain text) has no such column structure,
so it's chunked by paragraph instead.
"""
import re
from typing import List, Dict, Optional

import pypdf
import docx

# Tight, known-good pattern from ingestion.py's entity extractor (G7GA/F-18-style part numbers).
PART_NUMBER_STRICT_RE = re.compile(r'74A\d{2}-\d{2}-\d{4}')
# Broader fallback for other aircraft part-number formats (e.g. BACB30LU6K4-style).
PART_NUMBER_FALLBACK_RE = re.compile(r'\b[A-Z]{2,6}\d{2,}[A-Z0-9-]{2,}\b')
ATA_CHAPTER_RE = re.compile(r'\bATA\s?-?\d{2,4}\b|\b\d{2}-\d{2}-\d{2}\b', re.IGNORECASE)

PARAGRAPH_CHUNK_WORDS = 800
PARAGRAPH_OVERLAP = 1


def chunk_tabular(headers: List[str], rows: List[List[str]], source_label: str) -> List[str]:
    chunks = []
    for row in rows:
        pairs = [f"{h}: {v}" for h, v in zip(headers, row) if h and v not in (None, "", "None")]
        if not pairs:
            continue
        chunks.append(f"{source_label} | " + " | ".join(pairs))
    return chunks


def chunk_text(raw_text: str) -> List[str]:
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', raw_text) if p.strip()]
    if not paragraphs:
        return []

    chunks = []
    current: List[str] = []
    current_words = 0
    i = 0
    while i < len(paragraphs):
        para = paragraphs[i]
        para_words = len(para.split())
        if current_words + para_words > PARAGRAPH_CHUNK_WORDS and current:
            chunks.append("\n\n".join(current))
            current = current[-PARAGRAPH_OVERLAP:]
            current_words = sum(len(p.split()) for p in current)
        current.append(para)
        current_words += para_words
        i += 1
    if current:
        chunks.append("\n\n".join(current))
    return chunks


def extract_pdf_text(file_path: str) -> str:
    reader = pypdf.PdfReader(file_path)
    return "\n\n".join(page.extract_text() or "" for page in reader.pages)


def extract_docx_text(file_path: str) -> str:
    document = docx.Document(file_path)
    return "\n\n".join(p.text for p in document.paragraphs if p.text.strip())


def extract_row_metadata(text: str) -> Dict[str, Optional[str]]:
    part_match = PART_NUMBER_STRICT_RE.search(text) or PART_NUMBER_FALLBACK_RE.search(text)
    ata_match = ATA_CHAPTER_RE.search(text)
    return {
        "part_number": part_match.group(0) if part_match else None,
        "ata_chapter": ata_match.group(0) if ata_match else None,
    }
