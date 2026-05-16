from __future__ import annotations


class ContentExtractor:
    def extract_text(self, filename: str, raw_bytes: bytes) -> str:
        return raw_bytes.decode("utf-8", errors="ignore")

