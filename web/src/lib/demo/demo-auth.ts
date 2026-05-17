import { useEffect, useState } from "react";

import type { AppRole } from "@/lib/constants";
import {
  addDemoParentStudents,
  addDemoTeacherStudents,
  approveDemoRequest,
  approveDemoChildAccessRequest as approveDemoChildAccessRequestState,
  assignDemoSchoolAdmin,
  createDemoParentChildRequest as createDemoParentChildRequestState,
  createDemoClass,
  createDemoSchool,
  createDemoSeedState,
  demoRoleDefaults,
  getDemoClassAnalytics,
  getDemoClassMisconceptions,
  getDemoClassWeakTopics,
  getDemoMasterOverview,
  getDemoParentDashboard,
  getDemoParentChildRequests as getDemoParentChildRequestsState,
  getDemoMasterSchools,
  getDemoMasterUsers,
  getDemoSchoolAdminAssignments,
  getDemoSchoolAdminOverview,
  getDemoSchoolApprovals,
  getDemoSchoolChildRequests as getDemoSchoolChildRequestsState,
  getDemoSchoolClasses,
  getDemoSchoolParents,
  getDemoSchoolRelations,
  getDemoSchoolStudents,
  getDemoSchoolTeachers,
  getDemoStudentDashboardStats,
  getDemoStudentEvents,
  getDemoStudentFocusSignals,
  getDemoStudentGrowth,
  getDemoStudentHomework,
  getDemoTeacherClasses,
  getDemoUserProfile,
  rejectDemoRequest,
  rejectDemoChildAccessRequest as rejectDemoChildAccessRequestState,
  removeDemoParentStudents,
  removeDemoTeacherStudents,
  searchDemoSchools,
  type DemoState,
  updateDemoSchool,
} from "@/lib/demo/demo-data";
import type { CreateChildAccessRequestPayload } from "@/features/parent-access/types";

const DEMO_SESSION_KEY = "learnloop-demo-session";
const DEMO_STATE_KEY = "learnloop-demo-state-v1";
const DEMO_EVENT = "learnloop:demo-changed";
const DEMO_ACCESS_TOKENS: Record<string, string> = {
  "student-aarav": "learnloop-demo-student-aarav",
  "teacher-priya": "learnloop-demo-teacher-priya",
  "parent-rohan": "learnloop-demo-parent-rohan",
  "admin-green": "learnloop-demo-admin-green",
  "master-admin": "learnloop-demo-master-admin",
};

type DemoSession = {
  userId: string;
};

export type DemoAccessRole = Exclude<AppRole, "pending">;

export function isDemoModeEnabled() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

function canUseStorage() {
  return typeof window !== "undefined";
}

function emitDemoChange() {
  if (!canUseStorage()) return;
  window.dispatchEvent(new Event(DEMO_EVENT));
}

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getDemoState(): DemoState {
  const fallback = createDemoSeedState();
  if (!isDemoModeEnabled() || !canUseStorage()) {
    return fallback;
  }
  const state = parseJson<DemoState>(window.localStorage.getItem(DEMO_STATE_KEY), fallback);
  if (!window.localStorage.getItem(DEMO_STATE_KEY)) {
    window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
  }
  return state;
}

function writeDemoState(state: DemoState) {
  if (!isDemoModeEnabled() || !canUseStorage()) return;
  window.localStorage.setItem(DEMO_STATE_KEY, JSON.stringify(state));
  emitDemoChange();
}

export function resetDemoState() {
  writeDemoState(createDemoSeedState());
}

export function updateDemoState(updater: (state: DemoState) => DemoState) {
  const next = updater(getDemoState());
  writeDemoState(next);
  return next;
}

function getDemoSession(): DemoSession | null {
  if (!isDemoModeEnabled() || !canUseStorage()) return null;
  return parseJson<DemoSession | null>(window.localStorage.getItem(DEMO_SESSION_KEY), null);
}

function writeDemoSession(session: DemoSession | null) {
  if (!isDemoModeEnabled() || !canUseStorage()) return;
  if (session) {
    window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
  }
  emitDemoChange();
}

export function getDemoProfile() {
  if (!isDemoModeEnabled()) return null;
  const session = getDemoSession();
  return getDemoUserProfile(getDemoState(), session?.userId);
}

export function setDemoRole(role: DemoAccessRole) {
  if (!isDemoModeEnabled()) return null;
  const userId = demoRoleDefaults[role];
  if (!userId) return null;
  if (!canUseStorage()) return null;
  if (!window.localStorage.getItem(DEMO_STATE_KEY)) {
    resetDemoState();
  }
  writeDemoSession({ userId });
  return getDemoProfile();
}

export function clearDemoProfile() {
  writeDemoSession(null);
}

export function getDemoAccessToken() {
  if (!isDemoModeEnabled()) return null;
  const session = getDemoSession();
  if (!session?.userId) return null;
  return DEMO_ACCESS_TOKENS[session.userId] ?? null;
}

export function useDemoProfile() {
  const [profile, setProfile] = useState(() => getDemoProfile());

  useEffect(() => {
    if (!isDemoModeEnabled() || !canUseStorage()) return;
    const sync = () => setProfile(getDemoProfile());
    sync();
    window.addEventListener(DEMO_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(DEMO_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return profile;
}

export function getDemoRoleDestinations() {
  return {
    student: "/student",
    school: "/school",
    teacher: "/teacher",
    school_admin: "/school",
    platform_admin: "/master",
    parent: "/parent",
  } as const;
}

export function getDemoSchoolsList(search?: string) {
  const state = getDemoState();
  return searchDemoSchools(state, search);
}

export function getDemoStudentDashboard() {
  const profile = getDemoProfile();
  return profile ? getDemoStudentDashboardStats(profile.id) : null;
}

export function getDemoStudentFocus() {
  const profile = getDemoProfile();
  return profile ? getDemoStudentFocusSignals(profile.id) : [];
}

export function getDemoStudentActivity() {
  const profile = getDemoProfile();
  return profile ? getDemoStudentEvents(profile.id) : [];
}

export function getDemoStudentHomeworkList() {
  const profile = getDemoProfile();
  return profile ? getDemoStudentHomework(profile.id) : [];
}

export function getDemoStudentGrowthList() {
  const profile = getDemoProfile();
  return profile ? getDemoStudentGrowth(profile.id) : [];
}

export function getDemoTeacherClassesList() {
  const profile = getDemoProfile();
  return profile ? getDemoTeacherClasses(profile.id) : [];
}

export function getDemoTeacherClassAnalytics(classId: string) {
  return getDemoClassAnalytics(classId);
}

export function getDemoTeacherWeakTopics(classId: string) {
  return getDemoClassWeakTopics(classId);
}

export function getDemoTeacherMisconceptions(classId: string) {
  return getDemoClassMisconceptions(classId);
}

export function getDemoParentDashboardData() {
  const profile = getDemoProfile();
  return profile ? getDemoParentDashboard(getDemoState(), profile.id) : null;
}

export function getDemoParentChildRequests() {
  const profile = getDemoProfile();
  return profile ? getDemoParentChildRequestsState(getDemoState(), profile.id) : [];
}

export function createDemoChildAccessRequest(payload: CreateChildAccessRequestPayload) {
  const profile = getDemoProfile();
  if (!profile) return null;
  let created = null;
  updateDemoState((state) => {
    const next = createDemoParentChildRequestState(state, profile.id, payload);
    created = next.child_access_requests[0] ?? null;
    return next;
  });
  return created;
}

export function getDemoSchoolAdminData() {
  const profile = getDemoProfile();
  const state = getDemoState();
  const schoolId = profile?.school_id;
  if (!schoolId) return null;
  return {
    overview: getDemoSchoolAdminOverview(state, schoolId),
    approvals: getDemoSchoolApprovals(state, schoolId),
    students: getDemoSchoolStudents(state, schoolId),
    teachers: getDemoSchoolTeachers(state, schoolId),
    parents: getDemoSchoolParents(state, schoolId),
    classes: getDemoSchoolClasses(state, schoolId),
    relations: getDemoSchoolRelations(state, schoolId),
  };
}

export function getDemoSchoolChildRequests() {
  const profile = getDemoProfile();
  const schoolId = profile?.school_id;
  return schoolId ? getDemoSchoolChildRequestsState(getDemoState(), schoolId) : [];
}

export function approveDemoApproval(requestId: string, role: "teacher" | "parent") {
  updateDemoState((state) => approveDemoRequest(state, requestId, role));
}

export function rejectDemoApproval(requestId: string, reason?: string) {
  updateDemoState((state) => rejectDemoRequest(state, requestId, reason));
}

export function approveDemoChildAccessRequest(requestId: string, studentId?: string | null) {
  let updated = null;
  updateDemoState((state) => {
    const next = approveDemoChildAccessRequestState(state, requestId, studentId);
    updated = next.child_access_requests.find((item) => item.id === requestId) ?? null;
    return next;
  });
  return updated;
}

export function rejectDemoChildAccessRequest(requestId: string, reason?: string | null) {
  let updated = null;
  updateDemoState((state) => {
    const next = rejectDemoChildAccessRequestState(state, requestId, reason);
    updated = next.child_access_requests.find((item) => item.id === requestId) ?? null;
    return next;
  });
  return updated;
}

export function assignDemoTeacherRelation(payload: {
  teacher_id: string;
  student_ids: string[];
  class_id?: string | null;
  subject_id?: string | null;
}) {
  updateDemoState((state) =>
    addDemoTeacherStudents(state, payload.teacher_id, payload.student_ids, payload.class_id, payload.subject_id),
  );
}

export function removeDemoTeacherRelation(payload: { teacher_id: string; student_ids: string[] }) {
  updateDemoState((state) => removeDemoTeacherStudents(state, payload.teacher_id, payload.student_ids));
}

export function assignDemoParentRelation(payload: {
  parent_id: string;
  student_ids: string[];
  relationship?: string | null;
}) {
  updateDemoState((state) =>
    addDemoParentStudents(state, payload.parent_id, payload.student_ids, payload.relationship),
  );
}

export function removeDemoParentRelation(payload: { parent_id: string; student_ids: string[] }) {
  updateDemoState((state) => removeDemoParentStudents(state, payload.parent_id, payload.student_ids));
}

export function createDemoSchoolClass(payload: {
  name: string;
  code: string;
  grade_level?: string | null;
  teacher_id?: string | null;
  subject_id?: string | null;
}) {
  const profile = getDemoProfile();
  if (!profile?.school_id) return null;
  const existingCount = getDemoSchoolClasses(getDemoState(), profile.school_id).length;
  const nextState = updateDemoState((state) =>
    createDemoClass(state, { ...payload, school_id: profile.school_id as string }),
  );
  return getDemoSchoolClasses(nextState, profile.school_id)[existingCount] ?? null;
}

export function getDemoMasterData() {
  const state = getDemoState();
  return {
    overview: getDemoMasterOverview(state),
    schools: getDemoMasterSchools(state),
    users: getDemoMasterUsers(state),
    schoolAdmins: getDemoSchoolAdminAssignments(state),
  };
}

export function createDemoMasterSchoolRecord(payload: {
  name: string;
  code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  contact_email?: string | null;
  status?: "active" | "inactive";
}) {
  updateDemoState((state) => createDemoSchool(state, payload));
}

export function updateDemoMasterSchoolRecord(
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
) {
  updateDemoState((state) => updateDemoSchool(state, schoolId, payload));
}

export function assignDemoMasterSchoolAdmin(payload: { email: string; school_id: string }) {
  updateDemoState((state) => assignDemoSchoolAdmin(state, payload));
}
