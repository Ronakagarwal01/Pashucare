import re
import numpy as np
import faiss
import logging
from pathlib import Path
from openai import OpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.config import settings

logger = logging.getLogger(__name__)

_index: faiss.IndexFlatL2 | None = None
_chunks: list[str] = []
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536


def _get_client() -> OpenAI:
    if not settings.openai_api_key:
        raise ValueError("OpenAI API key not configured.")
    return OpenAI(api_key=settings.openai_api_key)


def _load_documents() -> str:
    knowledge_dir = Path(__file__).resolve().parent.parent.parent / "data" / "knowledge"
    if not knowledge_dir.exists():
        logger.warning(f"Knowledge directory not found: {knowledge_dir}")
        return ""
    text = ""
    for f in knowledge_dir.glob("*.txt"):
        text += f.read_text(encoding="utf-8") + "\n\n"
    return text


def _split_text(text: str) -> list[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n\n", "\n", ". ", " "],
    )
    return splitter.split_text(text)


def _embed_texts(texts: list[str]) -> np.ndarray:
    client = _get_client()
    embeddings = []
    batch_size = 50
    for i in range(0, len(texts), batch_size):
        batch = texts[i : i + batch_size]
        response = client.embeddings.create(model=EMBEDDING_MODEL, input=batch)
        for item in response.data:
            embeddings.append(item.embedding)
    return np.array(embeddings, dtype=np.float32)


def initialize():
    global _index, _chunks
    logger.info("Initializing RAG pipeline...")

    text = _load_documents()
    if not text.strip():
        logger.warning("No knowledge documents found. RAG will return empty context.")
        _index = None
        _chunks = []
        return

    _chunks = _split_text(text)
    if not _chunks:
        logger.warning("No chunks created from documents.")
        _index = None
        return

    logger.info(f"Loaded {len(_chunks)} chunks from knowledge base.")

    if settings.openai_api_key:
        try:
            vectors = _embed_texts(_chunks)
            _index = faiss.IndexFlatL2(EMBEDDING_DIM)
            _index.add(vectors)
            logger.info(f"FAISS vector index built with {_index.ntotal} vectors.")
        except Exception as e:
            logger.error(f"Failed to build FAISS index via OpenAI embeddings: {e}")
            _index = None
    else:
        logger.info("OpenAI API key not configured — RAG using keyword-ranked knowledge retrieval.")


def _keyword_retrieve(query: str, top_k: int = 4) -> str:
    if not _chunks:
        return ""
    tokens = [t.lower() for t in re.findall(r"\w+", query) if len(t) > 2]
    if not tokens:
        return "\n\n---\n\n".join(_chunks[:top_k])

    scored = []
    for chunk in _chunks:
        c_lower = chunk.lower()
        score = sum(c_lower.count(token) * 2 for token in tokens)
        if score > 0:
            scored.append((score, chunk))

    scored.sort(key=lambda x: x[0], reverse=True)
    selected = [chunk for _, chunk in scored[:top_k]]
    if not selected:
        selected = _chunks[:top_k]
    return "\n\n---\n\n".join(selected)


def retrieve(query: str, top_k: int = 4) -> str:
    if not _chunks:
        initialize()

    # Try FAISS vector search if index and key are active
    if _index is not None and settings.openai_api_key:
        try:
            client = _get_client()
            response = client.embeddings.create(model=EMBEDDING_MODEL, input=[query])
            query_vec = np.array([response.data[0].embedding], dtype=np.float32)
            distances, indices = _index.search(query_vec, min(top_k, len(_chunks)))
            results = []
            for idx in indices[0]:
                if 0 <= idx < len(_chunks):
                    results.append(_chunks[idx])
            return "\n\n---\n\n".join(results)
        except Exception as e:
            logger.warning(f"FAISS embedding search failed ({e}); falling back to text search.")

    return _keyword_retrieve(query, top_k)
