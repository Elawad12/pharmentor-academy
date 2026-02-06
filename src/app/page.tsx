"use client";

import { Hero } from "@/components/home/hero";
import { useFirebase } from "@/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, Shield, LayoutDashboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LatestCourses } from "@/components/home/latest-courses";
import { LatestArticles } from "@/components/home/latest-articles";
import { LatestJobs } from "@/components/home/latest-jobs";

export default function Home() {
  const { user, loading } = useFirebase();
  const isAdmin = user?.role === "مشرف النظام" || user?.role === "مدير النظام";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <section id="hero" className="mb-16">
        <Hero />
      </section>

      <div className="space-y-24">
        <LatestCourses />
        <LatestArticles />
        <LatestJobs />
      </div>

      <div className="mt-24">
        {loading ? (
          <Skeleton className="h-64 w-full rounded-2xl" />
        ) : isAdmin ? (
          <div className="text-center bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-12 custom-shadow">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LayoutDashboard className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold">لوحة تحكم الإدارة</h3>
              <p className="text-muted-foreground mt-2 mb-6">انتقل إلى لوحة التحكم لإدارة جميع جوانب المنصة.</p>
              <Button size="lg" asChild>
                  <Link href="/dashboard">
                      الانتقال إلى لوحة التحكم
                  </Link>
              </Button>
          </div>
        ) : (
          <div className="text-center bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-12 custom-shadow">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold">قسم الإدارة</h3>
              <p className="text-muted-foreground mt-2 mb-6">هذا القسم مخصص لمدير المنصة والمشرفين.</p>
              <Button size="lg" asChild>
                  <Link href="/login">
                      <User className="ml-2 h-5 w-5" />
                      تسجيل الدخول كمسؤول
                  </Link>
              </Button>
          </div>
        )}
      </div>
    </div>
  );
}
