from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.constants import ContentProcessingStatus
from app.db.models.content import ContentChunk, ContentUpload


class ContentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def create_upload(self, upload: ContentUpload) -> ContentUpload:
        self._session.add(upload)
        await self._session.flush()
        return upload

    async def list_uploads(self, *, limit: int = 50, offset: int = 0) -> list[ContentUpload]:
        result = await self._session.execute(
            select(ContentUpload).order_by(ContentUpload.created_at.desc()).offset(offset).limit(limit)
        )
        return list(result.scalars().all())

    async def get_upload(self, content_id) -> ContentUpload | None:
        result = await self._session.execute(
            select(ContentUpload)
            .where(ContentUpload.id == content_id)
            .options(selectinload(ContentUpload.chunks))
        )
        return result.scalar_one_or_none()

    async def mark_status(self, upload: ContentUpload, status: ContentProcessingStatus) -> ContentUpload:
        upload.status = status
        await self._session.flush()
        return upload

    async def add_chunks(self, chunks: list[ContentChunk]) -> list[ContentChunk]:
        for chunk in chunks:
            self._session.add(chunk)
        await self._session.flush()
        return chunks

