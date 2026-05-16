from __future__ import annotations


class ContentChunker:
    def chunk(self, text: str, *, chunk_size: int = 500) -> list[str]:
        normalized = text.strip()
        if not normalized:
            return []
        return [normalized[index : index + chunk_size] for index in range(0, len(normalized), chunk_size)]

