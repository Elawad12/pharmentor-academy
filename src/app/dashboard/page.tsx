"use client";

import { AdminDashboard } from "@/components/home/admin-dashboard";
import { useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";


export default function DashboardPage() {
  const { user, loading } = useFirebase();
  const router = useRouter();
  const isAdmin = user?.role === "مشرف النظام" || user?.role === "مدير النظام";

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);
  
  if (loading) {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <Skeleton className="h-[200px] w-full rounded-2xl mb-8" />
            <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
    )
  }

  if (!isAdmin) {
    return (
         <div className="max-w-7xl mx-auto px-4 py-12 text-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">الوصول مرفوض</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            هذه الصفحة مخصصة للمسؤولين فقط.
            </p>
            <Link href="/" className="mt-8 inline-block">
                <Button size="lg">العودة إلى الصفحة الرئيسية</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <section id="dashboard" className="scroll-mt-24">
          <AdminDashboard />
      </section>
    </div>
  );
}
