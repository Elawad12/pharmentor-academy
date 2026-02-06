import type { Timestamp } from 'firebase/firestore';

export type UserRole = "طالب" | "خريج" | "صيدلي" | "مشرف" | "مشرف النظام" | "مدير النظام";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  role: UserRole;
  avatar: string;
  createdAt: Timestamp;
}

export interface Course {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    imageHint?: string;
    price: number;
    currency: string;
    duration: string;
    level: "مبتدئ" | "متوسط" | "متقدم";
    isSple?: boolean;
}

export interface CourseRegistration {
    id: string; // This will be the courseId
    userId: string;
    courseId: string;
    registeredAt: Timestamp;
}

export interface Article {
    id: string;
    title: string;
    excerpt: string;
    imageUrl?: string;
    imageHint?: string;
    content: string;
}

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: "دوام كامل" | "دوام جزئي" | "عقد";
    tags: string[];
    imageUrl?: string;
    imageHint?: string;
    description: string;
}

export interface Inquiry {
    id: string;
    author: string;
    authorId: string;
    avatar: string;
    question: string;
    answersCount: number;
    createdAt: Timestamp;
}

export interface Reply {
    id: string;
    content: string;
    author: string;
    authorId: string;
    avatar: string;
    createdAt: Timestamp;
}

export interface Goal {
    id: string;
    text: string;
}

export interface SocialLink {
    id: string;
    name: string;
    value: string;
}

export interface BankAccount {
    id: string;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
}

export interface Branding {
    id: string;
    name: string;
    logoUrl?: string;
}

export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    message: string;
    submittedAt: Timestamp;
}

// Hooks return types
export interface UseCollectionHook<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export interface UseDocHook<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}
