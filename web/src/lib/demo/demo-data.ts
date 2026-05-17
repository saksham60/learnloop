import type { UserProfile } from "@/features/auth/types";
import type { GrowthActivity } from "@/features/growth/types";
import type { HomeworkSummary } from "@/features/homework/types";
import type { MasterOverview, MasterSchool, MasterUser, SchoolAdminAssignment } from "@/features/master-admin/types";
import type {
  ApprovalRequest,
  ManagedClass,
  ManagedParent,
  ManagedStudent,
  ManagedTeacher,
  ParentStudentRelation,
  SchoolAdminOverview,
  SchoolAdminRelations,
  TeacherStudentRelation,
} from "@/features/school-admin/types";
import type { School } from "@/features/schools/types";
import type { StudentDashboardStats, StudentEvent, StudentFocusSignal } from "@/features/student-dashboard/types";
import type { ClassAnalytics, ClassMisconception, ClassWeakTopic, TeacherClass } from "@/features/teacher-analytics/types";
import type { AppRole } from "@/lib/constants";

export type DemoSchool = School & {
  slug: string;
  contact_email?: string | null;
  created_at: string;
};

export type DemoUser = UserProfile & {
  class_name?: string | null;
  subject_label?: string | null;
  last_active?: string | null;
};

export type DemoStudent = DemoUser & {
  role: "student";
  class_name: string;
  grade_level: string;
};

export type DemoTeacher = DemoUser & {
  role: "teacher";
  subject_label: string;
};

export type DemoParent = DemoUser & {
  role: "parent";
};

export type DemoClass = ManagedClass & {
  school_id: string;
  teacher_ids: string[];
  student_ids: string[];
  subject_teachers: string[];
};

export type DemoApprovalRequest = ApprovalRequest;
export type DemoTeacherStudentRelation = TeacherStudentRelation;
export type DemoParentStudentRelation = ParentStudentRelation;

export type DemoState = {
  schools: DemoSchool[];
  users: DemoUser[];
  classes: DemoClass[];
  approvals: DemoApprovalRequest[];
  teacher_student_relations: DemoTeacherStudentRelation[];
  parent_student_relations: DemoParentStudentRelation[];
};

const now = "2026-05-17T09:00:00.000Z";
const yesterday = "2026-05-16T10:30:00.000Z";
const twoDaysAgo = "2026-05-15T12:00:00.000Z";
const threeDaysAgo = "2026-05-14T15:15:00.000Z";

const schoolsSeed: DemoSchool[] = [
  {
    id: "school-green-valley",
    name: "Green Valley Public School",
    slug: "green-valley-public-school",
    code: "GVPS",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    status: "active",
    contact_email: "hello@greenvalley.edu",
    created_at: threeDaysAgo,
  },
  {
    id: "school-sunrise",
    name: "Sunrise International School",
    slug: "sunrise-international-school",
    code: "SIS",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    status: "active",
    contact_email: "hello@sunrise.edu",
    created_at: twoDaysAgo,
  },
  {
    id: "school-demo",
    name: "LearnLoop Demo School",
    slug: "learnloop-demo-school",
    code: "LLD",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    status: "active",
    contact_email: "demo@learnloop.ai",
    created_at: yesterday,
  },
];

const usersSeed: DemoUser[] = [
  {
    id: "student-aarav",
    email: "aarav.student.demo@learnloop.ai",
    full_name: "Aarav Sharma",
    role: "student",
    approval_status: "active",
    school_id: "school-green-valley",
    school_name: "Green Valley Public School",
    class_name: "Class 7A",
    grade_level: "7A",
    created_at: threeDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: now,
  },
  {
    id: "student-meera",
    email: "meera.student.demo@learnloop.ai",
    full_name: "Meera Singh",
    role: "student",
    approval_status: "active",
    school_id: "school-green-valley",
    school_name: "Green Valley Public School",
    class_name: "Class 7A",
    grade_level: "7A",
    created_at: threeDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: yesterday,
  },
  {
    id: "student-kabir",
    email: "kabir.student.demo@learnloop.ai",
    full_name: "Kabir Verma",
    role: "student",
    approval_status: "active",
    school_id: "school-sunrise",
    school_name: "Sunrise International School",
    class_name: "Class 8B",
    grade_level: "8B",
    created_at: twoDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: now,
  },
  {
    id: "student-anaya",
    email: "anaya.student.demo@learnloop.ai",
    full_name: "Anaya Gupta",
    role: "student",
    approval_status: "active",
    school_id: "school-demo",
    school_name: "LearnLoop Demo School",
    class_name: "Class 6A",
    grade_level: "6A",
    created_at: yesterday,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: yesterday,
  },
  {
    id: "teacher-priya",
    email: "priya.teacher.demo@learnloop.ai",
    full_name: "Priya Mehta",
    role: "teacher",
    approval_status: "active",
    school_id: "school-green-valley",
    school_name: "Green Valley Public School",
    subject_label: "Science Teacher",
    created_at: threeDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: now,
  },
  {
    id: "teacher-rahul",
    email: "rahul.teacher.demo@learnloop.ai",
    full_name: "Rahul Nair",
    role: "teacher",
    approval_status: "active",
    school_id: "school-green-valley",
    school_name: "Green Valley Public School",
    subject_label: "Maths Teacher",
    created_at: threeDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: yesterday,
  },
  {
    id: "teacher-neha",
    email: "neha.teacher.demo@learnloop.ai",
    full_name: "Neha Kapoor",
    role: "teacher",
    approval_status: "active",
    school_id: "school-sunrise",
    school_name: "Sunrise International School",
    subject_label: "English Teacher",
    created_at: twoDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: yesterday,
  },
  {
    id: "teacher-arjun",
    email: "arjun.teacher.demo@learnloop.ai",
    full_name: "Arjun Rao",
    role: "teacher",
    approval_status: "active",
    school_id: "school-demo",
    school_name: "LearnLoop Demo School",
    subject_label: "Sports Coach",
    created_at: yesterday,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: now,
  },
  {
    id: "parent-rohan",
    email: "rohan.parent.demo@learnloop.ai",
    full_name: "Rohan Sharma",
    role: "parent",
    approval_status: "active",
    school_id: "school-green-valley",
    school_name: "Green Valley Public School",
    created_at: threeDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: {
      child_name: "Aarav Sharma",
      child_email: "aarav.student.demo@learnloop.ai",
      child_class: "Class 7A",
      relationship: "father",
    },
    last_active: yesterday,
  },
  {
    id: "parent-kavita",
    email: "kavita.parent.demo@learnloop.ai",
    full_name: "Kavita Singh",
    role: "parent",
    approval_status: "active",
    school_id: "school-green-valley",
    school_name: "Green Valley Public School",
    created_at: threeDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: {
      child_name: "Meera Singh",
      child_email: "meera.student.demo@learnloop.ai",
      child_class: "Class 7A",
      relationship: "mother",
    },
    last_active: yesterday,
  },
  {
    id: "parent-sunil",
    email: "sunil.parent.demo@learnloop.ai",
    full_name: "Sunil Verma",
    role: "parent",
    approval_status: "active",
    school_id: "school-sunrise",
    school_name: "Sunrise International School",
    created_at: twoDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: {
      child_name: "Kabir Verma",
      child_email: "kabir.student.demo@learnloop.ai",
      child_class: "Class 8B",
      relationship: "father",
    },
    last_active: yesterday,
  },
  {
    id: "parent-pooja",
    email: "pooja.parent.demo@learnloop.ai",
    full_name: "Pooja Gupta",
    role: "parent",
    approval_status: "active",
    school_id: "school-demo",
    school_name: "LearnLoop Demo School",
    created_at: yesterday,
    avatar_url: null,
    approval_reason: null,
    parent_request: {
      child_name: "Anaya Gupta",
      child_email: "anaya.student.demo@learnloop.ai",
      child_class: "Class 6A",
      relationship: "mother",
    },
    last_active: yesterday,
  },
  {
    id: "admin-green",
    email: "green.admin.demo@learnloop.ai",
    full_name: "Nandini Rao",
    role: "school_admin",
    approval_status: "active",
    school_id: "school-green-valley",
    school_name: "Green Valley Public School",
    created_at: threeDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: now,
  },
  {
    id: "admin-sunrise",
    email: "sunrise.admin.demo@learnloop.ai",
    full_name: "Ibrahim Khan",
    role: "school_admin",
    approval_status: "active",
    school_id: "school-sunrise",
    school_name: "Sunrise International School",
    created_at: twoDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: yesterday,
  },
  {
    id: "admin-demo",
    email: "demo.admin.demo@learnloop.ai",
    full_name: "Leena Menon",
    role: "school_admin",
    approval_status: "active",
    school_id: "school-demo",
    school_name: "LearnLoop Demo School",
    created_at: yesterday,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: now,
  },
  {
    id: "master-admin",
    email: "platform.admin.demo@learnloop.ai",
    full_name: "Platform Admin for LearnLoop AI",
    role: "platform_admin",
    approval_status: "active",
    school_id: null,
    school_name: null,
    created_at: threeDaysAgo,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: now,
  },
  {
    id: "pending-teacher-vikram",
    email: "vikram.teacher.demo@learnloop.ai",
    full_name: "Vikram Joshi",
    role: "teacher",
    approval_status: "pending_approval",
    school_id: "school-green-valley",
    school_name: "Green Valley Public School",
    subject_label: "General Teacher",
    created_at: yesterday,
    avatar_url: null,
    approval_reason: null,
    parent_request: null,
    last_active: null,
  },
  {
    id: "pending-parent-nisha",
    email: "nisha.parent.demo@learnloop.ai",
    full_name: "Nisha Malhotra",
    role: "parent",
    approval_status: "pending_approval",
    school_id: "school-sunrise",
    school_name: "Sunrise International School",
    created_at: yesterday,
    avatar_url: null,
    approval_reason: null,
    parent_request: {
      child_name: "Kabir Verma",
      child_email: "kabir.student.demo@learnloop.ai",
      child_class: "Class 8B",
      relationship: "guardian",
    },
    last_active: null,
  },
];

const classesSeed: DemoClass[] = [
  {
    id: "class-green-7a",
    school_id: "school-green-valley",
    name: "Class 7A",
    code: "GV-7A",
    grade_level: "7A",
    teacher_name: "Priya Mehta, Rahul Nair",
    subject: "Science + Maths",
    student_count: 2,
    teachers_count: 2,
    pending_homework_count: 1,
    weak_topics_summary: "Fractions need revision. Photosynthesis explanations are still shallow.",
    teacher_ids: ["teacher-priya", "teacher-rahul"],
    student_ids: ["student-aarav", "student-meera"],
    subject_teachers: ["Science", "Maths"],
  },
  {
    id: "class-sunrise-8b",
    school_id: "school-sunrise",
    name: "Class 8B",
    code: "SI-8B",
    grade_level: "8B",
    teacher_name: "Neha Kapoor",
    subject: "English",
    student_count: 1,
    teachers_count: 1,
    pending_homework_count: 1,
    weak_topics_summary: "Reading comprehension needs more evidence-based answers.",
    teacher_ids: ["teacher-neha"],
    student_ids: ["student-kabir"],
    subject_teachers: ["English"],
  },
  {
    id: "class-demo-6a",
    school_id: "school-demo",
    name: "Class 6A",
    code: "LL-6A",
    grade_level: "6A",
    teacher_name: "Arjun Rao",
    subject: "Sports/Fitness",
    student_count: 1,
    teachers_count: 1,
    pending_homework_count: 0,
    weak_topics_summary: "Mobility consistency is the next coaching opportunity.",
    teacher_ids: ["teacher-arjun"],
    student_ids: ["student-anaya"],
    subject_teachers: ["Sports/Fitness"],
  },
];

const approvalsSeed: DemoApprovalRequest[] = [
  {
    id: "approval-vikram",
    user_id: "pending-teacher-vikram",
    full_name: "Vikram Joshi",
    email: "vikram.teacher.demo@learnloop.ai",
    requested_role: "teacher",
    school_id: "school-green-valley",
    school_name: "Green Valley Public School",
    status: "pending_approval",
    reason: null,
    parent_request: null,
    created_at: yesterday,
  },
  {
    id: "approval-nisha",
    user_id: "pending-parent-nisha",
    full_name: "Nisha Malhotra",
    email: "nisha.parent.demo@learnloop.ai",
    requested_role: "parent",
    school_id: "school-sunrise",
    school_name: "Sunrise International School",
    status: "pending_approval",
    reason: null,
    parent_request: {
      child_name: "Kabir Verma",
      child_email: "kabir.student.demo@learnloop.ai",
      child_class: "Class 8B",
      relationship: "guardian",
    },
    created_at: yesterday,
  },
];

const teacherStudentRelationsSeed: DemoTeacherStudentRelation[] = [
  {
    teacher_id: "teacher-priya",
    teacher_name: "Priya Mehta",
    student_id: "student-aarav",
    student_name: "Aarav Sharma",
    class_id: "class-green-7a",
    class_name: "Class 7A",
    subject_id: "subject-science",
    subject_name: "Science",
  },
  {
    teacher_id: "teacher-priya",
    teacher_name: "Priya Mehta",
    student_id: "student-meera",
    student_name: "Meera Singh",
    class_id: "class-green-7a",
    class_name: "Class 7A",
    subject_id: "subject-science",
    subject_name: "Science",
  },
  {
    teacher_id: "teacher-rahul",
    teacher_name: "Rahul Nair",
    student_id: "student-aarav",
    student_name: "Aarav Sharma",
    class_id: "class-green-7a",
    class_name: "Class 7A",
    subject_id: "subject-maths",
    subject_name: "Maths",
  },
  {
    teacher_id: "teacher-rahul",
    teacher_name: "Rahul Nair",
    student_id: "student-meera",
    student_name: "Meera Singh",
    class_id: "class-green-7a",
    class_name: "Class 7A",
    subject_id: "subject-maths",
    subject_name: "Maths",
  },
  {
    teacher_id: "teacher-neha",
    teacher_name: "Neha Kapoor",
    student_id: "student-kabir",
    student_name: "Kabir Verma",
    class_id: "class-sunrise-8b",
    class_name: "Class 8B",
    subject_id: "subject-english",
    subject_name: "English",
  },
  {
    teacher_id: "teacher-arjun",
    teacher_name: "Arjun Rao",
    student_id: "student-anaya",
    student_name: "Anaya Gupta",
    class_id: "class-demo-6a",
    class_name: "Class 6A",
    subject_id: "subject-sports",
    subject_name: "Sports/Fitness",
  },
];

const parentStudentRelationsSeed: DemoParentStudentRelation[] = [
  {
    parent_id: "parent-rohan",
    parent_name: "Rohan Sharma",
    student_id: "student-aarav",
    student_name: "Aarav Sharma",
    relationship: "father",
  },
  {
    parent_id: "parent-kavita",
    parent_name: "Kavita Singh",
    student_id: "student-meera",
    student_name: "Meera Singh",
    relationship: "mother",
  },
  {
    parent_id: "parent-sunil",
    parent_name: "Sunil Verma",
    student_id: "student-kabir",
    student_name: "Kabir Verma",
    relationship: "father",
  },
  {
    parent_id: "parent-pooja",
    parent_name: "Pooja Gupta",
    student_id: "student-anaya",
    student_name: "Anaya Gupta",
    relationship: "mother",
  },
];

const studentFocusSeed: Record<string, StudentFocusSignal[]> = {
  "student-aarav": [
    { id: "focus-maths", title: "Maths: Fractions need focus", description: "Equivalent fractions and simplifying mixed answers need another pass.", score: 8.8, status: "active" },
    { id: "focus-science", title: "Science: Photosynthesis homework pending", description: "Complete the pending science reflection before end of day.", score: 8.2, status: "active" },
    { id: "focus-communication", title: "Communication: Speak 3 lines aloud", description: "Read your explanation out loud once before submitting.", score: 6.7, status: "active" },
    { id: "focus-exercise", title: "Exercise: 10-minute mobility routine", description: "Reset posture and energy after study time.", score: 6.1, status: "active" },
  ],
};

const studentEventsSeed: Record<string, StudentEvent[]> = {
  "student-aarav": [
    { id: "event-1", event_type: "attempt_submitted", payload: { topic: "Fractions" }, created_at: now },
    { id: "event-2", event_type: "chat_message", payload: { topic: "Photosynthesis" }, created_at: yesterday },
    { id: "event-3", event_type: "growth_activity_completed", payload: { title: "Mobility routine" }, created_at: twoDaysAgo },
  ],
};

const studentHomeworkSeed: Record<string, HomeworkSummary[]> = {
  "student-aarav": [
    {
      id: "homework-photosynthesis",
      title: "Photosynthesis short answer practice",
      description: "Explain how plants make food using sunlight.",
      status: "assigned",
      due_at: "2026-05-18T09:00:00.000Z",
      question_count: 3,
    },
  ],
};

const studentGrowthSeed: Record<string, GrowthActivity[]> = {
  "student-aarav": [
    { id: "growth-1", title: "Cricket footwork routine", activity_type: "sports", status: "suggested" },
    { id: "growth-2", title: "Speak 3 lines aloud", activity_type: "communication", status: "suggested" },
    { id: "growth-3", title: "10-minute mobility routine", activity_type: "fitness", status: "suggested" },
  ],
};

const teacherClassesSeed: Record<string, TeacherClass[]> = {
  "teacher-priya": [
    { id: "class-green-7a", name: "Class 7A", code: "GV-7A", grade_level: "7A", subject: "Science", student_count: 2 },
  ],
  "teacher-rahul": [
    { id: "class-green-7a", name: "Class 7A", code: "GV-7A", grade_level: "7A", subject: "Maths", student_count: 2 },
  ],
  "teacher-neha": [
    { id: "class-sunrise-8b", name: "Class 8B", code: "SI-8B", grade_level: "8B", subject: "English", student_count: 1 },
  ],
  "teacher-arjun": [
    { id: "class-demo-6a", name: "Class 6A", code: "LL-6A", grade_level: "6A", subject: "Sports/Fitness", student_count: 1 },
  ],
};

const teacherClassAnalyticsSeed: Record<string, ClassAnalytics> = {
  "class-green-7a": { class_id: "class-green-7a", student_count: 2, homework_count: 2 },
  "class-sunrise-8b": { class_id: "class-sunrise-8b", student_count: 1, homework_count: 1 },
  "class-demo-6a": { class_id: "class-demo-6a", student_count: 1, homework_count: 1 },
};

const teacherWeakTopicsSeed: Record<string, ClassWeakTopic[]> = {
  "class-green-7a": [
    { class_id: "class-green-7a", topic: "Fractions", risk_score: 8.7 },
    { class_id: "class-green-7a", topic: "Photosynthesis", risk_score: 7.9 },
  ],
  "class-sunrise-8b": [{ class_id: "class-sunrise-8b", topic: "Reading comprehension", risk_score: 6.4 }],
  "class-demo-6a": [{ class_id: "class-demo-6a", topic: "Mobility routine consistency", risk_score: 5.8 }],
};

const teacherMisconceptionsSeed: Record<string, ClassMisconception[]> = {
  "class-green-7a": [
    {
      class_id: "class-green-7a",
      misconception: "Students think plants get food directly from soil.",
      signal_count: 4,
    },
  ],
  "class-sunrise-8b": [
    {
      class_id: "class-sunrise-8b",
      misconception: "Students quote the passage but skip evidence-based explanation.",
      signal_count: 2,
    },
  ],
  "class-demo-6a": [
    {
      class_id: "class-demo-6a",
      misconception: "Students rush movement drills without posture control.",
      signal_count: 2,
    },
  ],
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSchoolName(schools: DemoSchool[], schoolId?: string | null) {
  return schools.find((school) => school.id === schoolId)?.name ?? null;
}

function getUser(users: DemoUser[], userId: string) {
  return users.find((user) => user.id === userId) ?? null;
}

function buildManagedStudent(
  user: DemoUser,
  teacherRelations: DemoTeacherStudentRelation[],
  parentRelations: DemoParentStudentRelation[],
): ManagedStudent {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    class_name: user.class_name ?? user.grade_level ?? null,
    assigned_teachers_count: teacherRelations.filter((relation) => relation.student_id === user.id).length,
    linked_parents_count: parentRelations.filter((relation) => relation.student_id === user.id).length,
    status: user.approval_status,
    last_active: user.last_active ?? null,
  };
}

function buildManagedTeacher(user: DemoUser, teacherRelations: DemoTeacherStudentRelation[]): ManagedTeacher {
  const subjects = Array.from(
    new Set(
      teacherRelations
        .filter((relation) => relation.teacher_id === user.id)
        .map((relation) => [relation.subject_name, relation.class_name].filter(Boolean).join(" - "))
        .filter(Boolean),
    ),
  );

  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    subjects_or_classes: subjects.length ? subjects : [user.subject_label || "General"],
    assigned_students_count: teacherRelations.filter((relation) => relation.teacher_id === user.id).length,
    status: user.approval_status,
  };
}

function buildManagedParent(user: DemoUser, parentRelations: DemoParentStudentRelation[]): ManagedParent {
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    linked_students_count: parentRelations.filter((relation) => relation.parent_id === user.id).length,
    status: user.approval_status,
  };
}

export function createDemoSeedState(): DemoState {
  return {
    schools: clone(schoolsSeed),
    users: clone(usersSeed),
    classes: clone(classesSeed),
    approvals: clone(approvalsSeed),
    teacher_student_relations: clone(teacherStudentRelationsSeed),
    parent_student_relations: clone(parentStudentRelationsSeed),
  };
}

export const demoRoleDefaults: Record<Exclude<AppRole, "pending">, string> = {
  student: "student-aarav",
  teacher: "teacher-priya",
  parent: "parent-rohan",
  school_admin: "admin-green",
  platform_admin: "master-admin",
};

export function getDemoSchools(state: DemoState): School[] {
  return state.schools.map((school) => ({
    id: school.id,
    name: school.name,
    code: school.code,
    city: school.city,
    state: school.state,
    country: school.country,
    status: school.status,
  }));
}

export function searchDemoSchools(state: DemoState, query?: string): School[] {
  const normalized = query?.trim().toLowerCase();
  if (!normalized) {
    return getDemoSchools(state);
  }
  return getDemoSchools(state).filter((school) =>
    [school.name, school.code, school.city, school.state, school.country]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized)),
  );
}

export function getDemoUserProfile(state: DemoState, userId: string | null | undefined): UserProfile | null {
  if (!userId) return null;
  const user = getUser(state.users, userId);
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    approval_status: user.approval_status,
    school_id: user.school_id ?? null,
    school_name: user.school_name ?? null,
    grade_level: user.grade_level ?? null,
    avatar_url: user.avatar_url ?? null,
    approval_reason: user.approval_reason ?? null,
    parent_request: user.parent_request ?? null,
    created_at: user.created_at,
  };
}

export function getDemoStudentDashboardStats(userId: string): StudentDashboardStats {
  const homework = studentHomeworkSeed[userId] ?? [];
  const focus = studentFocusSeed[userId] ?? [];
  const events = studentEventsSeed[userId] ?? [];

  return {
    pending_homework_count: homework.length,
    active_focus_count: focus.length,
    recent_attempts_count: events.filter((event) => event.event_type === "attempt_submitted").length,
    source: "fallback",
    fallback_message: "Demo data is active for the student dashboard.",
  };
}

export function getDemoStudentFocusSignals(userId: string): StudentFocusSignal[] {
  return clone(studentFocusSeed[userId] ?? []);
}

export function getDemoStudentEvents(userId: string): StudentEvent[] {
  return clone(studentEventsSeed[userId] ?? []);
}

export function getDemoStudentHomework(userId: string): HomeworkSummary[] {
  return clone(studentHomeworkSeed[userId] ?? []);
}

export function getDemoStudentGrowth(userId: string): GrowthActivity[] {
  return clone(studentGrowthSeed[userId] ?? []);
}

export function getDemoTeacherClasses(teacherId: string): TeacherClass[] {
  return clone(teacherClassesSeed[teacherId] ?? []);
}

export function getDemoClassAnalytics(classId: string): ClassAnalytics | undefined {
  const analytics = teacherClassAnalyticsSeed[classId];
  return analytics ? clone(analytics) : undefined;
}

export function getDemoClassWeakTopics(classId: string): ClassWeakTopic[] {
  return clone(teacherWeakTopicsSeed[classId] ?? []);
}

export function getDemoClassMisconceptions(classId: string): ClassMisconception[] {
  return clone(teacherMisconceptionsSeed[classId] ?? []);
}

export function getDemoSchoolAdminOverview(state: DemoState, schoolId: string): SchoolAdminOverview {
  const users = state.users.filter((user) => user.school_id === schoolId);
  return {
    pending_approvals: state.approvals.filter(
      (request) => request.school_id === schoolId && request.status === "pending_approval",
    ).length,
    total_students: users.filter((user) => user.role === "student" && user.approval_status === "active").length,
    total_teachers: users.filter((user) => user.role === "teacher" && user.approval_status === "active").length,
    total_parents: users.filter((user) => user.role === "parent" && user.approval_status === "active").length,
    active_classes: state.classes.filter((item) => item.school_id === schoolId).length,
    teacher_student_relations: state.teacher_student_relations.filter((relation) => {
      const teacher = getUser(state.users, relation.teacher_id);
      return teacher?.school_id === schoolId;
    }).length,
    parent_student_relations: state.parent_student_relations.filter((relation) => {
      const parent = getUser(state.users, relation.parent_id);
      return parent?.school_id === schoolId;
    }).length,
  };
}

export function getDemoSchoolApprovals(state: DemoState, schoolId: string): ApprovalRequest[] {
  return clone(state.approvals.filter((request) => request.school_id === schoolId));
}

export function getDemoSchoolStudents(state: DemoState, schoolId: string): ManagedStudent[] {
  return state.users
    .filter((user) => user.role === "student" && user.school_id === schoolId)
    .map((user) => buildManagedStudent(user, state.teacher_student_relations, state.parent_student_relations));
}

export function getDemoSchoolTeachers(state: DemoState, schoolId: string): ManagedTeacher[] {
  return state.users
    .filter((user) => user.role === "teacher" && user.school_id === schoolId)
    .map((user) => buildManagedTeacher(user, state.teacher_student_relations));
}

export function getDemoSchoolParents(state: DemoState, schoolId: string): ManagedParent[] {
  return state.users
    .filter((user) => user.role === "parent" && user.school_id === schoolId)
    .map((user) => buildManagedParent(user, state.parent_student_relations));
}

export function getDemoSchoolClasses(state: DemoState, schoolId: string): ManagedClass[] {
  return state.classes
    .filter((item) => item.school_id === schoolId)
    .map((item) => ({ ...item }));
}

export function getDemoSchoolRelations(state: DemoState, schoolId: string): SchoolAdminRelations {
  const teacher_students = state.teacher_student_relations.filter((relation) => {
    const teacher = getUser(state.users, relation.teacher_id);
    return teacher?.school_id === schoolId;
  });
  const parent_students = state.parent_student_relations.filter((relation) => {
    const parent = getUser(state.users, relation.parent_id);
    return parent?.school_id === schoolId;
  });
  return {
    teacher_students: clone(teacher_students),
    parent_students: clone(parent_students),
  };
}

export function getDemoMasterOverview(state: DemoState): MasterOverview {
  return {
    total_schools: state.schools.length,
    active_schools: state.schools.filter((school) => school.status === "active").length,
    total_users: state.users.length,
    pending_school_admin_setup: state.schools.filter(
      (school) => !state.users.some((user) => user.role === "school_admin" && user.school_id === school.id),
    ).length,
    platform_health: "Demo mode active",
  };
}

export function getDemoMasterSchools(state: DemoState): MasterSchool[] {
  return state.schools.map((school) => ({
    id: school.id,
    name: school.name,
    code: school.code,
    city: school.city,
    state: school.state,
    country: school.country,
    status: school.status,
    contact_email: school.contact_email ?? null,
    created_at: school.created_at,
    user_count: state.users.filter((user) => user.school_id === school.id).length,
    class_count: state.classes.filter((item) => item.school_id === school.id).length,
  }));
}

export function getDemoMasterUsers(state: DemoState): MasterUser[] {
  return state.users.map((user) => ({
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    approval_status: user.approval_status,
    school_id: user.school_id ?? null,
    school_name: user.school_name ?? null,
    created_at: user.created_at,
  }));
}

export function getDemoSchoolAdminAssignments(state: DemoState): SchoolAdminAssignment[] {
  return state.users
    .filter((user) => user.role === "school_admin")
    .map((user) => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      school_id: user.school_id ?? null,
      school_name: user.school_name ?? null,
      approval_status: user.approval_status,
    }));
}

export function approveDemoRequest(state: DemoState, requestId: string, role: "teacher" | "parent"): DemoState {
  const request = state.approvals.find((item) => item.id === requestId);
  if (!request) return state;

  return {
    ...state,
    approvals: state.approvals.map((item) =>
      item.id === requestId ? { ...item, status: "active", requested_role: role, reason: null } : item,
    ),
    users: state.users.map((user) =>
      user.id === request.user_id
        ? { ...user, role, approval_status: "active", approval_reason: null }
        : user,
    ),
  };
}

export function rejectDemoRequest(state: DemoState, requestId: string, reason?: string | null): DemoState {
  const request = state.approvals.find((item) => item.id === requestId);
  if (!request) return state;

  return {
    ...state,
    approvals: state.approvals.map((item) =>
      item.id === requestId ? { ...item, status: "rejected", reason: reason || "Demo rejection recorded." } : item,
    ),
    users: state.users.map((user) =>
      user.id === request.user_id
        ? { ...user, approval_status: "rejected", approval_reason: reason || "Demo rejection recorded." }
        : user,
    ),
  };
}

export function addDemoTeacherStudents(
  state: DemoState,
  teacherId: string,
  studentIds: string[],
  classId?: string | null,
  subjectId?: string | null,
): DemoState {
  const teacher = getUser(state.users, teacherId);
  if (!teacher) return state;

  const additions = studentIds
    .map((studentId) => {
      const student = getUser(state.users, studentId);
      if (!student) return null;
      if (
        state.teacher_student_relations.some(
          (relation) => relation.teacher_id === teacherId && relation.student_id === studentId,
        )
      ) {
        return null;
      }
      const relatedClass =
        state.classes.find((item) => item.id === classId) ||
        state.classes.find((item) => item.student_ids.includes(studentId));
      return {
        teacher_id: teacherId,
        teacher_name: teacher.full_name,
        student_id: studentId,
        student_name: student.full_name,
        class_id: relatedClass?.id ?? null,
        class_name: relatedClass?.name ?? student.class_name ?? null,
        subject_id: subjectId ?? `subject-${(teacher.subject_label || "general").toLowerCase().replaceAll(/\s+/g, "-")}`,
        subject_name: teacher.subject_label?.replace(" Teacher", "") ?? teacher.subject_label ?? "General",
      } satisfies DemoTeacherStudentRelation;
    })
    .filter(Boolean) as DemoTeacherStudentRelation[];

  return {
    ...state,
    teacher_student_relations: [...state.teacher_student_relations, ...additions],
  };
}

export function removeDemoTeacherStudents(state: DemoState, teacherId: string, studentIds: string[]): DemoState {
  return {
    ...state,
    teacher_student_relations: state.teacher_student_relations.filter(
      (relation) => relation.teacher_id !== teacherId || !studentIds.includes(relation.student_id),
    ),
  };
}

export function addDemoParentStudents(
  state: DemoState,
  parentId: string,
  studentIds: string[],
  relationship?: string | null,
): DemoState {
  const parent = getUser(state.users, parentId);
  if (!parent) return state;

  const additions = studentIds
    .map((studentId) => {
      const student = getUser(state.users, studentId);
      if (!student) return null;
      if (
        state.parent_student_relations.some(
          (relation) => relation.parent_id === parentId && relation.student_id === studentId,
        )
      ) {
        return null;
      }
      return {
        parent_id: parentId,
        parent_name: parent.full_name,
        student_id: studentId,
        student_name: student.full_name,
        relationship: relationship ?? "guardian",
      } satisfies DemoParentStudentRelation;
    })
    .filter(Boolean) as DemoParentStudentRelation[];

  return {
    ...state,
    parent_student_relations: [...state.parent_student_relations, ...additions],
  };
}

export function removeDemoParentStudents(state: DemoState, parentId: string, studentIds: string[]): DemoState {
  return {
    ...state,
    parent_student_relations: state.parent_student_relations.filter(
      (relation) => relation.parent_id !== parentId || !studentIds.includes(relation.student_id),
    ),
  };
}

export function createDemoClass(
  state: DemoState,
  payload: {
    school_id: string;
    name: string;
    code: string;
    grade_level?: string | null;
    teacher_id?: string | null;
    subject_id?: string | null;
  },
): DemoState {
  const teacher = payload.teacher_id ? getUser(state.users, payload.teacher_id) : null;
  const newClass: DemoClass = {
    id: createId("demo-class"),
    school_id: payload.school_id,
    name: payload.name,
    code: payload.code,
    grade_level: payload.grade_level ?? null,
    teacher_name: teacher?.full_name ?? null,
    subject: teacher?.subject_label ?? null,
    student_count: 0,
    teachers_count: teacher ? 1 : 0,
    pending_homework_count: 0,
    weak_topics_summary: "Weak topics summary placeholder",
    teacher_ids: teacher ? [teacher.id] : [],
    student_ids: [],
    subject_teachers: teacher?.subject_label ? [teacher.subject_label] : [],
  };

  return {
    ...state,
    classes: [...state.classes, newClass],
  };
}

export function createDemoSchool(
  state: DemoState,
  payload: {
    name: string;
    code?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    contact_email?: string | null;
    status?: "active" | "inactive";
  },
): DemoState {
  const school: DemoSchool = {
    id: createId("demo-school"),
    name: payload.name,
    slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    code: payload.code ?? null,
    city: payload.city ?? null,
    state: payload.state ?? null,
    country: payload.country ?? null,
    status: payload.status ?? "active",
    contact_email: payload.contact_email ?? null,
    created_at: now,
  };

  return {
    ...state,
    schools: [...state.schools, school],
  };
}

export function updateDemoSchool(
  state: DemoState,
  schoolId: string,
  payload: {
    name?: string | null;
    code?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    contact_email?: string | null;
    status?: "active" | "inactive" | null;
  },
): DemoState {
  return {
    ...state,
    schools: state.schools.map((school) =>
      school.id === schoolId
        ? {
            ...school,
            name: payload.name ?? school.name,
            code: payload.code ?? school.code ?? null,
            city: payload.city ?? school.city ?? null,
            state: payload.state ?? school.state ?? null,
            country: payload.country ?? school.country ?? null,
            contact_email: payload.contact_email ?? school.contact_email ?? null,
            status: payload.status ?? school.status,
          }
        : school,
    ),
  };
}

export function assignDemoSchoolAdmin(
  state: DemoState,
  payload: { email: string; school_id: string },
): DemoState {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const schoolName = getSchoolName(state.schools, payload.school_id);
  const existing = state.users.find((user) => user.email.toLowerCase() === normalizedEmail);

  if (existing) {
    return {
      ...state,
      users: state.users.map((user) =>
        user.id === existing.id
          ? {
              ...user,
              role: "school_admin",
              approval_status: "active",
              school_id: payload.school_id,
              school_name: schoolName,
            }
          : user,
      ),
    };
  }

  const fullName = normalizedEmail.split("@")[0].split(".").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
  return {
    ...state,
    users: [
      ...state.users,
      {
        id: createId("school-admin"),
        email: normalizedEmail,
        full_name: fullName || "Demo School Admin",
        role: "school_admin",
        approval_status: "active",
        school_id: payload.school_id,
        school_name: schoolName,
        created_at: now,
        avatar_url: null,
        approval_reason: null,
        parent_request: null,
      },
    ],
  };
}
