from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import TokenSubject
from app.db.repositories.request_repository import RequestRepository
from app.db.repositories.school_repository import SchoolRepository


class SchoolService:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._schools = SchoolRepository(session)
        self._requests = RequestRepository(session)

    @staticmethod
    def _serialize_school(school) -> dict:
        return {
            "id": str(school.id),
            "name": school.name,
            "code": school.code,
            "city": school.city,
            "state": school.state,
            "country": school.country,
            "status": school.status.value,
        }

    async def list_schools(self, *, search: str | None = None) -> list[dict]:
        schools = await self._schools.list_schools(search=search)
        return [self._serialize_school(school) for school in schools]

    async def register_school_request(
        self,
        subject: TokenSubject,
        *,
        school_name: str,
        school_code: str | None = None,
        city: str | None = None,
        state: str | None = None,
        country: str | None = None,
        contact_email: str,
        contact_person_name: str,
        contact_phone: str | None = None,
        message: str | None = None,
    ) -> dict:
        request = await self._requests.create_school_registration_request(
            requester_supabase_user_id=subject.subject,
            requester_email=subject.email or f"{subject.subject}@example.local",
            school_name=school_name,
            school_code=school_code,
            city=city,
            state=state,
            country=country,
            contact_email=contact_email,
            contact_person_name=contact_person_name,
            contact_phone=contact_phone,
            message=message,
        )
        await self._session.commit()
        return {
            "id": str(request.id),
            "school_name": request.school_name,
            "contact_email": request.contact_email,
            "contact_person_name": request.contact_person_name,
            "status": request.status,
            "created_at": request.created_at.isoformat(),
        }
