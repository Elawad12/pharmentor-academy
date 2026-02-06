export type UserRole = "طالب" | "خريج" | "صيدلي" | "مشرف" | "مشرف عام" | "مدير المنصة";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface Course {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    imageHint?: string;
    price: number;
    duration: string;
    level: "مبتدئ" | "متوسط" | "متقدم";
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

export interface Consultation {
    id: string;
    author: string;
    authorId: string;
    avatar: string;
    question: string;
    answersCount: number;
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
