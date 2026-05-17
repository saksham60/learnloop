from __future__ import annotations

import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.demo.catalog import (
    DEMO_CLASSES,
    DEMO_CLASS_STUDENTS,
    DEMO_FOCUS_AREAS,
    DEMO_GROWTH_ACTIVITIES,
    DEMO_HOMEWORK,
    DEMO_HOMEWORK_QUESTIONS,
    DEMO_LEARNING_EVENTS,
    DEMO_NOW,
    DEMO_PARENT_STUDENT_RELATIONS,
    DEMO_SCHOOLS,
    DEMO_STUDENT_ATTEMPTS,
    DEMO_SUBJECTS,
    DEMO_TEACHER_STUDENT_RELATIONS,
    DEMO_USERS,
)
from app.db.models.class_model import ClassRoom, ClassStudent
from app.db.models.focus_area import FocusArea
from app.db.models.growth import GrowthActivity
from app.db.models.homework import Homework, HomeworkQuestion, StudentAttempt
from app.db.models.learning_event import LearningEvent
from app.db.models.relations import ParentStudentRelation, TeacherStudentRelation
from app.db.models.school import School
from app.db.models.subject import Subject
from app.db.models.user import UserProfile


logger = logging.getLogger(__name__)


async def _upsert_school(session: AsyncSession) -> None:
    for seed in DEMO_SCHOOLS:
        school = await session.get(School, seed.id)
        if school is None:
            school = School(id=seed.id)
            session.add(school)
        school.name = seed.name
        school.slug = seed.slug
        school.code = seed.code
        school.city = seed.city
        school.state = seed.state
        school.country = seed.country
        school.contact_email = seed.contact_email
        school.status = seed.status
        school.metadata_json = {"demo_mode": True}


async def _upsert_users(session: AsyncSession) -> None:
    for seed in DEMO_USERS:
        result = await session.execute(
            select(UserProfile).where(UserProfile.supabase_user_id == seed.supabase_user_id),
        )
        user = result.scalar_one_or_none()
        if user is None:
            user = UserProfile(
                id=seed.id,
                supabase_user_id=seed.supabase_user_id,
                email=seed.email,
                full_name=seed.full_name,
                role=seed.role,
                approval_status=seed.approval_status,
                school_id=seed.school_id,
                grade_level=seed.grade_level,
                approval_reason=seed.approval_reason,
                approval_metadata=seed.approval_metadata,
                preferences={"demo_mode": True},
            )
            session.add(user)
            continue

        user.email = seed.email
        user.full_name = seed.full_name
        user.role = seed.role
        user.approval_status = seed.approval_status
        user.school_id = seed.school_id
        user.grade_level = seed.grade_level
        user.approval_reason = seed.approval_reason
        user.approval_metadata = seed.approval_metadata
        user.preferences = {"demo_mode": True}


async def _upsert_subjects(session: AsyncSession) -> None:
    for seed in DEMO_SUBJECTS:
        subject = await session.get(Subject, seed.id)
        if subject is None:
            subject = Subject(id=seed.id)
            session.add(subject)
        subject.school_id = seed.school_id
        subject.name = seed.name
        subject.code = seed.code


async def _upsert_classes(session: AsyncSession) -> None:
    for seed in DEMO_CLASSES:
        classroom = await session.get(ClassRoom, seed.id)
        if classroom is None:
            classroom = ClassRoom(id=seed.id)
            session.add(classroom)
        classroom.school_id = seed.school_id
        classroom.subject_id = seed.subject_id
        classroom.teacher_id = seed.teacher_id
        classroom.name = seed.name
        classroom.code = seed.code
        classroom.grade_level = seed.grade_level


async def _ensure_class_students(session: AsyncSession) -> None:
    for class_id, student_id in DEMO_CLASS_STUDENTS:
        result = await session.execute(
            select(ClassStudent).where(
                ClassStudent.class_id == class_id,
                ClassStudent.student_id == student_id,
            ),
        )
        membership = result.scalar_one_or_none()
        if membership is None:
            session.add(ClassStudent(class_id=class_id, student_id=student_id))


async def _ensure_teacher_student_relations(session: AsyncSession) -> None:
    for school_id, teacher_id, student_id, class_id, subject_id in DEMO_TEACHER_STUDENT_RELATIONS:
        result = await session.execute(
            select(TeacherStudentRelation).where(
                TeacherStudentRelation.teacher_id == teacher_id,
                TeacherStudentRelation.student_id == student_id,
                TeacherStudentRelation.class_id == class_id,
                TeacherStudentRelation.subject_id == subject_id,
            ),
        )
        relation = result.scalar_one_or_none()
        if relation is None:
            session.add(
                TeacherStudentRelation(
                    school_id=school_id,
                    teacher_id=teacher_id,
                    student_id=student_id,
                    class_id=class_id,
                    subject_id=subject_id,
                )
            )


async def _ensure_parent_student_relations(session: AsyncSession) -> None:
    for school_id, parent_id, student_id, relationship_type in DEMO_PARENT_STUDENT_RELATIONS:
        result = await session.execute(
            select(ParentStudentRelation).where(
                ParentStudentRelation.parent_id == parent_id,
                ParentStudentRelation.student_id == student_id,
            ),
        )
        relation = result.scalar_one_or_none()
        if relation is None:
            session.add(
                ParentStudentRelation(
                    school_id=school_id,
                    parent_id=parent_id,
                    student_id=student_id,
                    relationship_type=relationship_type,
                )
            )
            continue
        relation.relationship_type = relationship_type


async def _upsert_homework(session: AsyncSession) -> None:
    for seed in DEMO_HOMEWORK:
        item = await session.get(Homework, seed.id)
        if item is None:
            item = Homework(id=seed.id)
            session.add(item)
        item.school_id = seed.school_id
        item.class_id = seed.class_id
        item.subject_id = seed.subject_id
        item.teacher_id = seed.teacher_id
        item.title = seed.title
        item.description = seed.description
        item.due_at = seed.due_at
        item.status = seed.status
        item.metadata_json = {"demo_mode": True}


async def _upsert_homework_questions(session: AsyncSession) -> None:
    for seed in DEMO_HOMEWORK_QUESTIONS:
        question = await session.get(HomeworkQuestion, seed.id)
        if question is None:
            question = HomeworkQuestion(id=seed.id)
            session.add(question)
        question.homework_id = seed.homework_id
        question.prompt = seed.prompt
        question.order_index = seed.order_index
        question.metadata_json = {"demo_mode": True}


async def _upsert_student_attempts(session: AsyncSession) -> None:
    for seed in DEMO_STUDENT_ATTEMPTS:
        attempt = await session.get(StudentAttempt, seed.id)
        if attempt is None:
            attempt = StudentAttempt(id=seed.id)
            session.add(attempt)
        attempt.homework_id = seed.homework_id
        attempt.student_id = seed.student_id
        attempt.question_id = seed.question_id
        attempt.answer_text = seed.answer_text
        attempt.attempt_number = seed.attempt_number
        attempt.hints_used = seed.hints_used
        attempt.is_correct = seed.is_correct
        attempt.score = seed.score
        attempt.feedback_payload = {"demo_mode": True}
        attempt.submitted_at = seed.submitted_at


async def _upsert_focus_areas(session: AsyncSession) -> None:
    for seed in DEMO_FOCUS_AREAS:
        area = await session.get(FocusArea, seed.id)
        if area is None:
            area = FocusArea(id=seed.id)
            session.add(area)
        area.school_id = seed.school_id
        area.student_id = seed.student_id
        area.title = seed.title
        area.description = seed.description
        area.score = seed.score
        area.status = seed.status
        area.recommended_action = seed.recommended_action
        area.rationale = {"demo_mode": True}
        area.last_evaluated_at = DEMO_NOW


async def _upsert_growth_activities(session: AsyncSession) -> None:
    for seed in DEMO_GROWTH_ACTIVITIES:
        activity = await session.get(GrowthActivity, seed.id)
        if activity is None:
            activity = GrowthActivity(id=seed.id)
            session.add(activity)
        activity.school_id = seed.school_id
        activity.student_id = seed.student_id
        activity.activity_type = seed.activity_type
        activity.title = seed.title
        activity.description = seed.description
        activity.status = seed.status
        activity.metadata_json = {"demo_mode": True}


async def _upsert_learning_events(session: AsyncSession) -> None:
    for seed in DEMO_LEARNING_EVENTS:
        event = await session.get(LearningEvent, seed.id)
        if event is None:
            event = LearningEvent(id=seed.id)
            session.add(event)
        event.school_id = seed.school_id
        event.student_id = seed.student_id
        event.event_type = seed.event_type
        event.payload = seed.payload
        event.created_at = seed.created_at
        event.homework_id = seed.homework_id
        event.subject_id = seed.subject_id
        event.topic_id = seed.topic_id


async def seed_demo_data(session: AsyncSession) -> None:
    await _upsert_school(session)
    await _upsert_users(session)
    await _upsert_subjects(session)
    await _upsert_classes(session)
    await _ensure_class_students(session)
    await _ensure_teacher_student_relations(session)
    await _ensure_parent_student_relations(session)
    await _upsert_homework(session)
    await _upsert_homework_questions(session)
    await _upsert_student_attempts(session)
    await _upsert_focus_areas(session)
    await _upsert_growth_activities(session)
    await _upsert_learning_events(session)
    await session.commit()


async def ensure_demo_seeded(session: AsyncSession) -> None:
    await seed_demo_data(session)
    logger.info("Demo mode dataset ensured.")
