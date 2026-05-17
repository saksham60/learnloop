from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from uuid import UUID

from app.core.constants import ApprovalStatus, EventType, FocusAreaStatus, GrowthActivityStatus, HomeworkStatus, Role, SchoolStatus


@dataclass(frozen=True)
class DemoSchoolSeed:
    id: UUID
    name: str
    slug: str
    code: str
    city: str
    state: str
    country: str
    contact_email: str
    status: SchoolStatus = SchoolStatus.ACTIVE


@dataclass(frozen=True)
class DemoUserSeed:
    id: UUID
    supabase_user_id: str
    email: str
    full_name: str
    role: Role
    approval_status: ApprovalStatus
    school_id: UUID | None = None
    grade_level: str | None = None
    approval_reason: str | None = None
    approval_metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class DemoSubjectSeed:
    id: UUID
    school_id: UUID
    name: str
    code: str


@dataclass(frozen=True)
class DemoClassSeed:
    id: UUID
    school_id: UUID
    name: str
    code: str
    grade_level: str
    teacher_id: UUID | None = None
    subject_id: UUID | None = None


@dataclass(frozen=True)
class DemoHomeworkSeed:
    id: UUID
    school_id: UUID
    class_id: UUID
    subject_id: UUID | None
    teacher_id: UUID
    title: str
    description: str
    due_at: datetime
    status: HomeworkStatus = HomeworkStatus.ASSIGNED


@dataclass(frozen=True)
class DemoHomeworkQuestionSeed:
    id: UUID
    homework_id: UUID
    prompt: str
    order_index: int


@dataclass(frozen=True)
class DemoStudentAttemptSeed:
    id: UUID
    homework_id: UUID
    student_id: UUID
    question_id: UUID | None
    answer_text: str
    attempt_number: int
    hints_used: int
    is_correct: bool | None
    score: float | None
    submitted_at: datetime


@dataclass(frozen=True)
class DemoFocusAreaSeed:
    id: UUID
    school_id: UUID
    student_id: UUID
    title: str
    description: str
    score: float
    recommended_action: str
    status: FocusAreaStatus = FocusAreaStatus.ACTIVE


@dataclass(frozen=True)
class DemoGrowthActivitySeed:
    id: UUID
    school_id: UUID
    student_id: UUID
    activity_type: str
    title: str
    description: str
    status: GrowthActivityStatus = GrowthActivityStatus.SUGGESTED


@dataclass(frozen=True)
class DemoLearningEventSeed:
    id: UUID
    school_id: UUID
    student_id: UUID
    event_type: EventType
    payload: dict[str, Any]
    created_at: datetime
    homework_id: UUID | None = None
    subject_id: UUID | None = None
    topic_id: UUID | None = None


@dataclass(frozen=True)
class DemoTokenSeed:
    token: str
    subject: str
    email: str
    full_name: str


DEMO_NOW = datetime(2026, 5, 17, 9, 0, 0)
DEMO_YESTERDAY = datetime(2026, 5, 16, 10, 30, 0)
DEMO_TWO_DAYS_AGO = datetime(2026, 5, 15, 12, 0, 0)

GREEN_VALLEY_SCHOOL_ID = UUID("11111111-1111-1111-1111-111111111111")
SUNRISE_SCHOOL_ID = UUID("22222222-2222-2222-2222-222222222222")
LEARNLOOP_DEMO_SCHOOL_ID = UUID("33333333-3333-3333-3333-333333333333")

STUDENT_AARAV_ID = UUID("44444444-1111-1111-1111-111111111111")
STUDENT_MEERA_ID = UUID("44444444-2222-2222-2222-222222222222")
STUDENT_KABIR_ID = UUID("44444444-3333-3333-3333-333333333333")
STUDENT_ANAYA_ID = UUID("44444444-4444-4444-4444-444444444444")
TEACHER_PRIYA_ID = UUID("55555555-1111-1111-1111-111111111111")
TEACHER_RAHUL_ID = UUID("55555555-2222-2222-2222-222222222222")
TEACHER_NEHA_ID = UUID("55555555-3333-3333-3333-333333333333")
TEACHER_ARJUN_ID = UUID("55555555-4444-4444-4444-444444444444")
PARENT_ROHAN_ID = UUID("66666666-1111-1111-1111-111111111111")
PARENT_KAVITA_ID = UUID("66666666-2222-2222-2222-222222222222")
PARENT_SUNIL_ID = UUID("66666666-3333-3333-3333-333333333333")
PARENT_POOJA_ID = UUID("66666666-4444-4444-4444-444444444444")
ADMIN_GREEN_ID = UUID("77777777-1111-1111-1111-111111111111")
ADMIN_SUNRISE_ID = UUID("77777777-2222-2222-2222-222222222222")
ADMIN_DEMO_ID = UUID("77777777-3333-3333-3333-333333333333")
MASTER_ADMIN_ID = UUID("88888888-1111-1111-1111-111111111111")
PENDING_TEACHER_VIKRAM_ID = UUID("99999999-1111-1111-1111-111111111111")
PENDING_PARENT_NISHA_ID = UUID("99999999-2222-2222-2222-222222222222")

SCIENCE_SUBJECT_ID = UUID("aaaaaaaa-1111-1111-1111-111111111111")
MATHS_SUBJECT_ID = UUID("aaaaaaaa-2222-2222-2222-222222222222")
ENGLISH_SUBJECT_ID = UUID("aaaaaaaa-3333-3333-3333-333333333333")
SPORTS_SUBJECT_ID = UUID("aaaaaaaa-4444-4444-4444-444444444444")

GREEN_CLASS_7A_ID = UUID("bbbbbbbb-1111-1111-1111-111111111111")
SUNRISE_CLASS_8B_ID = UUID("bbbbbbbb-2222-2222-2222-222222222222")
DEMO_CLASS_6A_ID = UUID("bbbbbbbb-3333-3333-3333-333333333333")

HOMEWORK_PHOTOSYNTHESIS_ID = UUID("cccccccc-1111-1111-1111-111111111111")
HOMEWORK_ENGLISH_ID = UUID("cccccccc-2222-2222-2222-222222222222")
QUESTION_PHOTOSYNTHESIS_ID = UUID("dddddddd-1111-1111-1111-111111111111")
QUESTION_ENGLISH_ID = UUID("dddddddd-2222-2222-2222-222222222222")
ATTEMPT_AARAV_ID = UUID("eeeeeeee-1111-1111-1111-111111111111")

FOCUS_FRACTIONS_ID = UUID("ffffffff-1111-1111-1111-111111111111")
FOCUS_PHOTOSYNTHESIS_ID = UUID("ffffffff-2222-2222-2222-222222222222")
GROWTH_CRICKET_ID = UUID("12121212-1111-1111-1111-111111111111")
GROWTH_MOBILITY_ID = UUID("12121212-2222-2222-2222-222222222222")

EVENT_ATTEMPT_ID = UUID("13131313-1111-1111-1111-111111111111")
EVENT_CHAT_ID = UUID("13131313-2222-2222-2222-222222222222")
EVENT_GROWTH_ID = UUID("13131313-3333-3333-3333-333333333333")

DEMO_SCHOOLS = (
    DemoSchoolSeed(
        id=GREEN_VALLEY_SCHOOL_ID,
        name="Green Valley Public School",
        slug="green-valley-public-school",
        code="GVPS",
        city="Bengaluru",
        state="Karnataka",
        country="India",
        contact_email="hello@greenvalley.edu",
    ),
    DemoSchoolSeed(
        id=SUNRISE_SCHOOL_ID,
        name="Sunrise International School",
        slug="sunrise-international-school",
        code="SIS",
        city="Mumbai",
        state="Maharashtra",
        country="India",
        contact_email="hello@sunrise.edu",
    ),
    DemoSchoolSeed(
        id=LEARNLOOP_DEMO_SCHOOL_ID,
        name="LearnLoop Demo School",
        slug="learnloop-demo-school",
        code="LLD",
        city="Pune",
        state="Maharashtra",
        country="India",
        contact_email="demo@learnloop.ai",
    ),
)

DEMO_USERS = (
    DemoUserSeed(STUDENT_AARAV_ID, "student-aarav", "aarav.student.demo@learnloop.ai", "Aarav Sharma", Role.STUDENT, ApprovalStatus.ACTIVE, GREEN_VALLEY_SCHOOL_ID, "7A"),
    DemoUserSeed(STUDENT_MEERA_ID, "student-meera", "meera.student.demo@learnloop.ai", "Meera Singh", Role.STUDENT, ApprovalStatus.ACTIVE, GREEN_VALLEY_SCHOOL_ID, "7A"),
    DemoUserSeed(STUDENT_KABIR_ID, "student-kabir", "kabir.student.demo@learnloop.ai", "Kabir Verma", Role.STUDENT, ApprovalStatus.ACTIVE, SUNRISE_SCHOOL_ID, "8B"),
    DemoUserSeed(STUDENT_ANAYA_ID, "student-anaya", "anaya.student.demo@learnloop.ai", "Anaya Gupta", Role.STUDENT, ApprovalStatus.ACTIVE, LEARNLOOP_DEMO_SCHOOL_ID, "6A"),
    DemoUserSeed(TEACHER_PRIYA_ID, "teacher-priya", "priya.teacher.demo@learnloop.ai", "Priya Mehta", Role.TEACHER, ApprovalStatus.ACTIVE, GREEN_VALLEY_SCHOOL_ID),
    DemoUserSeed(TEACHER_RAHUL_ID, "teacher-rahul", "rahul.teacher.demo@learnloop.ai", "Rahul Nair", Role.TEACHER, ApprovalStatus.ACTIVE, GREEN_VALLEY_SCHOOL_ID),
    DemoUserSeed(TEACHER_NEHA_ID, "teacher-neha", "neha.teacher.demo@learnloop.ai", "Neha Kapoor", Role.TEACHER, ApprovalStatus.ACTIVE, SUNRISE_SCHOOL_ID),
    DemoUserSeed(TEACHER_ARJUN_ID, "teacher-arjun", "arjun.teacher.demo@learnloop.ai", "Arjun Rao", Role.TEACHER, ApprovalStatus.ACTIVE, LEARNLOOP_DEMO_SCHOOL_ID),
    DemoUserSeed(PARENT_ROHAN_ID, "parent-rohan", "rohan.parent.demo@learnloop.ai", "Rohan Sharma", Role.PARENT, ApprovalStatus.ACTIVE, GREEN_VALLEY_SCHOOL_ID, approval_metadata={"parent_request": {"child_name": "Aarav Sharma", "child_email": "aarav.student.demo@learnloop.ai", "child_class": "Class 7A", "relationship": "father"}}),
    DemoUserSeed(PARENT_KAVITA_ID, "parent-kavita", "kavita.parent.demo@learnloop.ai", "Kavita Singh", Role.PARENT, ApprovalStatus.ACTIVE, GREEN_VALLEY_SCHOOL_ID, approval_metadata={"parent_request": {"child_name": "Meera Singh", "child_email": "meera.student.demo@learnloop.ai", "child_class": "Class 7A", "relationship": "mother"}}),
    DemoUserSeed(PARENT_SUNIL_ID, "parent-sunil", "sunil.parent.demo@learnloop.ai", "Sunil Verma", Role.PARENT, ApprovalStatus.ACTIVE, SUNRISE_SCHOOL_ID, approval_metadata={"parent_request": {"child_name": "Kabir Verma", "child_email": "kabir.student.demo@learnloop.ai", "child_class": "Class 8B", "relationship": "father"}}),
    DemoUserSeed(PARENT_POOJA_ID, "parent-pooja", "pooja.parent.demo@learnloop.ai", "Pooja Gupta", Role.PARENT, ApprovalStatus.ACTIVE, LEARNLOOP_DEMO_SCHOOL_ID, approval_metadata={"parent_request": {"child_name": "Anaya Gupta", "child_email": "anaya.student.demo@learnloop.ai", "child_class": "Class 6A", "relationship": "mother"}}),
    DemoUserSeed(ADMIN_GREEN_ID, "admin-green", "green.admin.demo@learnloop.ai", "Nandini Rao", Role.SCHOOL_ADMIN, ApprovalStatus.ACTIVE, GREEN_VALLEY_SCHOOL_ID),
    DemoUserSeed(ADMIN_SUNRISE_ID, "admin-sunrise", "sunrise.admin.demo@learnloop.ai", "Ibrahim Khan", Role.SCHOOL_ADMIN, ApprovalStatus.ACTIVE, SUNRISE_SCHOOL_ID),
    DemoUserSeed(ADMIN_DEMO_ID, "admin-demo", "demo.admin.demo@learnloop.ai", "Leena Menon", Role.SCHOOL_ADMIN, ApprovalStatus.ACTIVE, LEARNLOOP_DEMO_SCHOOL_ID),
    DemoUserSeed(MASTER_ADMIN_ID, "master-admin", "platform.admin.demo@learnloop.ai", "Platform Admin for LearnLoop AI", Role.PLATFORM_ADMIN, ApprovalStatus.ACTIVE),
    DemoUserSeed(PENDING_TEACHER_VIKRAM_ID, "pending-teacher-vikram", "vikram.teacher.demo@learnloop.ai", "Vikram Joshi", Role.TEACHER, ApprovalStatus.PENDING_APPROVAL, GREEN_VALLEY_SCHOOL_ID),
    DemoUserSeed(PENDING_PARENT_NISHA_ID, "pending-parent-nisha", "nisha.parent.demo@learnloop.ai", "Nisha Malhotra", Role.PARENT, ApprovalStatus.PENDING_APPROVAL, SUNRISE_SCHOOL_ID, approval_metadata={"parent_request": {"child_name": "Kabir Verma", "child_email": "kabir.student.demo@learnloop.ai", "child_class": "Class 8B", "relationship": "guardian"}}),
)

DEMO_SUBJECTS = (
    DemoSubjectSeed(SCIENCE_SUBJECT_ID, GREEN_VALLEY_SCHOOL_ID, "Science", "SCI"),
    DemoSubjectSeed(MATHS_SUBJECT_ID, GREEN_VALLEY_SCHOOL_ID, "Mathematics", "MTH"),
    DemoSubjectSeed(ENGLISH_SUBJECT_ID, SUNRISE_SCHOOL_ID, "English", "ENG"),
    DemoSubjectSeed(SPORTS_SUBJECT_ID, LEARNLOOP_DEMO_SCHOOL_ID, "Sports/Fitness", "SPT"),
)

DEMO_CLASSES = (
    DemoClassSeed(GREEN_CLASS_7A_ID, GREEN_VALLEY_SCHOOL_ID, "Class 7A", "GV-7A", "7A", TEACHER_PRIYA_ID, SCIENCE_SUBJECT_ID),
    DemoClassSeed(SUNRISE_CLASS_8B_ID, SUNRISE_SCHOOL_ID, "Class 8B", "SI-8B", "8B", TEACHER_NEHA_ID, ENGLISH_SUBJECT_ID),
    DemoClassSeed(DEMO_CLASS_6A_ID, LEARNLOOP_DEMO_SCHOOL_ID, "Class 6A", "LL-6A", "6A", TEACHER_ARJUN_ID, SPORTS_SUBJECT_ID),
)

DEMO_CLASS_STUDENTS = (
    (GREEN_CLASS_7A_ID, STUDENT_AARAV_ID),
    (GREEN_CLASS_7A_ID, STUDENT_MEERA_ID),
    (SUNRISE_CLASS_8B_ID, STUDENT_KABIR_ID),
    (DEMO_CLASS_6A_ID, STUDENT_ANAYA_ID),
)

DEMO_TEACHER_STUDENT_RELATIONS = (
    (GREEN_VALLEY_SCHOOL_ID, TEACHER_PRIYA_ID, STUDENT_AARAV_ID, GREEN_CLASS_7A_ID, SCIENCE_SUBJECT_ID),
    (GREEN_VALLEY_SCHOOL_ID, TEACHER_PRIYA_ID, STUDENT_MEERA_ID, GREEN_CLASS_7A_ID, SCIENCE_SUBJECT_ID),
    (GREEN_VALLEY_SCHOOL_ID, TEACHER_RAHUL_ID, STUDENT_AARAV_ID, GREEN_CLASS_7A_ID, MATHS_SUBJECT_ID),
    (GREEN_VALLEY_SCHOOL_ID, TEACHER_RAHUL_ID, STUDENT_MEERA_ID, GREEN_CLASS_7A_ID, MATHS_SUBJECT_ID),
    (SUNRISE_SCHOOL_ID, TEACHER_NEHA_ID, STUDENT_KABIR_ID, SUNRISE_CLASS_8B_ID, ENGLISH_SUBJECT_ID),
    (LEARNLOOP_DEMO_SCHOOL_ID, TEACHER_ARJUN_ID, STUDENT_ANAYA_ID, DEMO_CLASS_6A_ID, SPORTS_SUBJECT_ID),
)

DEMO_PARENT_STUDENT_RELATIONS = (
    (GREEN_VALLEY_SCHOOL_ID, PARENT_ROHAN_ID, STUDENT_AARAV_ID, "father"),
    (GREEN_VALLEY_SCHOOL_ID, PARENT_KAVITA_ID, STUDENT_MEERA_ID, "mother"),
    (SUNRISE_SCHOOL_ID, PARENT_SUNIL_ID, STUDENT_KABIR_ID, "father"),
    (LEARNLOOP_DEMO_SCHOOL_ID, PARENT_POOJA_ID, STUDENT_ANAYA_ID, "mother"),
)

DEMO_HOMEWORK = (
    DemoHomeworkSeed(
        HOMEWORK_PHOTOSYNTHESIS_ID,
        GREEN_VALLEY_SCHOOL_ID,
        GREEN_CLASS_7A_ID,
        SCIENCE_SUBJECT_ID,
        TEACHER_PRIYA_ID,
        "Photosynthesis short answer practice",
        "Explain how plants make food using sunlight.",
        datetime(2026, 5, 18, 9, 0, 0),
    ),
    DemoHomeworkSeed(
        HOMEWORK_ENGLISH_ID,
        SUNRISE_SCHOOL_ID,
        SUNRISE_CLASS_8B_ID,
        ENGLISH_SUBJECT_ID,
        TEACHER_NEHA_ID,
        "Reading comprehension evidence check",
        "Write one answer and support it with a line from the passage.",
        datetime(2026, 5, 19, 9, 0, 0),
    ),
)

DEMO_HOMEWORK_QUESTIONS = (
    DemoHomeworkQuestionSeed(QUESTION_PHOTOSYNTHESIS_ID, HOMEWORK_PHOTOSYNTHESIS_ID, "How do plants make food using sunlight?", 0),
    DemoHomeworkQuestionSeed(QUESTION_ENGLISH_ID, HOMEWORK_ENGLISH_ID, "What line in the passage best supports the answer?", 0),
)

DEMO_STUDENT_ATTEMPTS = (
    DemoStudentAttemptSeed(
        ATTEMPT_AARAV_ID,
        HOMEWORK_PHOTOSYNTHESIS_ID,
        STUDENT_AARAV_ID,
        QUESTION_PHOTOSYNTHESIS_ID,
        "Plants get food from the soil and sun together.",
        1,
        1,
        False,
        0.35,
        DEMO_YESTERDAY,
    ),
)

DEMO_FOCUS_AREAS = (
    DemoFocusAreaSeed(
        FOCUS_FRACTIONS_ID,
        GREEN_VALLEY_SCHOOL_ID,
        STUDENT_AARAV_ID,
        "Maths: Fractions need focus",
        "Equivalent fractions and simplifying mixed answers need another pass.",
        8.8,
        "Say each fraction step aloud before writing it.",
    ),
    DemoFocusAreaSeed(
        FOCUS_PHOTOSYNTHESIS_ID,
        GREEN_VALLEY_SCHOOL_ID,
        STUDENT_AARAV_ID,
        "Science: Photosynthesis homework pending",
        "Complete the pending science reflection before end of day.",
        8.2,
        "Explain the process in two simple sentences using your own words.",
    ),
)

DEMO_GROWTH_ACTIVITIES = (
    DemoGrowthActivitySeed(
        GROWTH_CRICKET_ID,
        GREEN_VALLEY_SCHOOL_ID,
        STUDENT_AARAV_ID,
        "sports",
        "Cricket footwork routine",
        "A short sports drill to build rhythm and balance after study time.",
    ),
    DemoGrowthActivitySeed(
        GROWTH_MOBILITY_ID,
        GREEN_VALLEY_SCHOOL_ID,
        STUDENT_AARAV_ID,
        "fitness",
        "10-minute mobility routine",
        "Reset posture and energy with a gentle movement block.",
    ),
)

DEMO_LEARNING_EVENTS = (
    DemoLearningEventSeed(
        EVENT_ATTEMPT_ID,
        GREEN_VALLEY_SCHOOL_ID,
        STUDENT_AARAV_ID,
        EventType.ATTEMPT_SUBMITTED,
        {"topic": "Fractions", "message": "Equivalent fraction attempt saved."},
        DEMO_NOW,
        HOMEWORK_PHOTOSYNTHESIS_ID,
        SCIENCE_SUBJECT_ID,
    ),
    DemoLearningEventSeed(
        EVENT_CHAT_ID,
        GREEN_VALLEY_SCHOOL_ID,
        STUDENT_AARAV_ID,
        EventType.CHAT_MESSAGE,
        {"topic": "Photosynthesis", "message": "Asked for a guided explanation."},
        DEMO_YESTERDAY,
        subject_id=SCIENCE_SUBJECT_ID,
    ),
    DemoLearningEventSeed(
        EVENT_GROWTH_ID,
        GREEN_VALLEY_SCHOOL_ID,
        STUDENT_AARAV_ID,
        EventType.GROWTH_ACTIVITY_COMPLETED,
        {"title": "Mobility routine", "minutes": 10},
        DEMO_TWO_DAYS_AGO,
    ),
)

DEMO_BEARER_TOKENS = {
    user.supabase_user_id: f"learnloop-demo-{user.supabase_user_id}"
    for user in DEMO_USERS
}

DEMO_TOKENS = {
    token: DemoTokenSeed(
        token=token,
        subject=user.supabase_user_id,
        email=user.email,
        full_name=user.full_name,
    )
    for user in DEMO_USERS
    for token in [DEMO_BEARER_TOKENS[user.supabase_user_id]]
}
