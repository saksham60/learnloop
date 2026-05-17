import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  FileText,
  Flag,
  GraduationCap,
  Home,
  Layers3,
  LineChart,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type AppRole =
  | "student"
  | "teacher"
  | "school_admin"
  | "parent"
  | "platform_admin"
  | "pending";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "LearnLoop AI";
export const APP_TAGLINE = "Think. Try. Reflect. Grow.";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://learnloop-wpdv.onrender.com";

export const featureFlags = {
  googleAuth: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_AUTH !== "false",
  emailAuth: process.env.NEXT_PUBLIC_ENABLE_EMAIL_AUTH !== "false",
  studentApp: process.env.NEXT_PUBLIC_ENABLE_STUDENT_APP !== "false",
  teacherDashboard: process.env.NEXT_PUBLIC_ENABLE_TEACHER_DASHBOARD !== "false",
  adminDashboard: process.env.NEXT_PUBLIC_ENABLE_ADMIN_DASHBOARD !== "false",
  parentDashboard: process.env.NEXT_PUBLIC_ENABLE_PARENT_DASHBOARD === "true",
  socraticMode: process.env.NEXT_PUBLIC_ENABLE_SOCRATIC_MODE !== "false",
  homework: process.env.NEXT_PUBLIC_ENABLE_HOMEWORK !== "false",
  compass: process.env.NEXT_PUBLIC_ENABLE_LEARNING_COMPASS !== "false",
  progressQa: process.env.NEXT_PUBLIC_ENABLE_PROGRESS_QA !== "false",
  growth: process.env.NEXT_PUBLIC_ENABLE_GROWTH_MODULES !== "false",
  offlineMode: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === "true",
};

export const roleDestinations: Record<AppRole, string> = {
  student: "/student",
  teacher: "/teacher",
  school_admin: "/admin",
  parent: "/parent",
  platform_admin: "/admin",
  pending: "/pending",
};

export const studentNav: NavItem[] = [
  { title: "Today", href: "/student", icon: Home, description: "Daily companion dashboard" },
  {
    title: "Companion",
    href: "/student/companion",
    icon: BrainCircuit,
    description: "Guided learning conversations",
  },
  { title: "Homework", href: "/student/homework", icon: FileText, description: "Attempt-first coaching" },
  { title: "Focus", href: "/student/focus", icon: Flag, description: "Learning Compass priorities" },
  { title: "Progress", href: "/student/progress", icon: LineChart, description: "Ask My Progress" },
  { title: "Growth", href: "/student/growth", icon: Sparkles, description: "Habits, sports, skills" },
];

export const teacherNav: NavItem[] = [
  { title: "Overview", href: "/teacher", icon: Home, description: "Classroom signal board" },
  { title: "Classes", href: "/teacher/classes", icon: Users, description: "Per-class insights" },
  { title: "Homework", href: "/teacher/homework", icon: BookOpen, description: "Assignments and analytics" },
  { title: "Content", href: "/teacher/content", icon: Layers3, description: "Upload and process content" },
  { title: "Analytics", href: "/teacher/analytics", icon: BarChart3, description: "Weak topics and trends" },
];

export const adminNav: NavItem[] = [
  { title: "Overview", href: "/admin", icon: ShieldCheck, description: "Platform health and roles" },
  { title: "Users", href: "/admin/users", icon: Users, description: "User roles and onboarding" },
  { title: "Classes", href: "/admin/classes", icon: GraduationCap, description: "School structure" },
  { title: "Settings", href: "/admin/settings", icon: Settings, description: "Feature and org settings" },
];
