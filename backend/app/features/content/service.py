from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import CurrentUser
from app.core.constants import ContentProcessingStatus, EventType
from app.core.exceptions import NotFoundError
from app.db.models.content import ContentChunk, ContentUpload
from app.db.repositories.content_repository import ContentRepository
from app.db.repositories.event_repository import EventRepository
from app.features.content.chunker import ContentChunker
from app.features.content.extractor import ContentExtractor


class ContentService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._content = ContentRepository(session)
        self._events = EventRepository(session)
        self._extractor = ContentExtractor()
        self._chunker = ContentChunker()

    async def upload(
        self,
        *,
        current_user: CurrentUser,
        filename: str,
        content_type: str,
        storage_path: str,
    ) -> dict:
        upload = await self._content.create_upload(
            ContentUpload(
                school_id=current_user.school_id,
                uploaded_by=current_user.user_id,
                subject_id=None,
                class_id=None,
                filename=filename,
                storage_path=storage_path,
                mime_type=content_type,
                status=ContentProcessingStatus.UPLOADED,
                metadata_json={},
            )
        )
        await self._events.create_event(
            student_id=current_user.user_id,
            school_id=current_user.school_id,
            event_type=EventType.CONTENT_UPLOADED,
            payload={"content_id": str(upload.id), "filename": filename},
        )
        await self._session.commit()
        return {"id": str(upload.id), "status": upload.status.value, "filename": upload.filename}

    async def list_uploads(self, *, limit: int, offset: int) -> list[dict]:
        uploads = await self._content.list_uploads(limit=limit, offset=offset)
        return [
            {"id": str(upload.id), "filename": upload.filename, "status": upload.status.value}
            for upload in uploads
        ]

    async def process(self, content_id, *, raw_bytes: bytes = b"") -> dict:
        upload = await self._content.get_upload(content_id)
        if upload is None:
            raise NotFoundError("Content upload not found.")

        await self._content.mark_status(upload, ContentProcessingStatus.PROCESSING)
        text = self._extractor.extract_text(upload.filename, raw_bytes)
        chunks = [
            ContentChunk(
                content_upload_id=upload.id,
                topic_id=None,
                chunk_index=index,
                chunk_text=chunk_text,
                metadata_json={},
            )
            for index, chunk_text in enumerate(self._chunker.chunk(text))
        ]
        if chunks:
            await self._content.add_chunks(chunks)
        await self._content.mark_status(upload, ContentProcessingStatus.READY)
        await self._session.commit()
        return {"id": str(upload.id), "chunk_count": len(chunks), "status": upload.status.value}

    async def chunks(self, content_id) -> list[dict]:
        upload = await self._content.get_upload(content_id)
        if upload is None:
            raise NotFoundError("Content upload not found.")
        return [
            {"id": str(chunk.id), "chunk_index": chunk.chunk_index, "chunk_text": chunk.chunk_text}
            for chunk in upload.chunks
        ]

