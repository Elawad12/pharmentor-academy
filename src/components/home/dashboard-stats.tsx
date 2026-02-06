"use client";

import { useFirebase, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, Briefcase, FileText } from "lucide-react";
import type { UserProfile, Course, Job, Article } from "@/lib/types";
import { useMemo } from "react";

const StatCard = ({ title, value, icon: Icon, loading }: { title: string, value: number, icon: React.ElementType, loading: boolean }) => {
    return (
        <Card className="rounded-2xl custom-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-20" />
                ) : (
                    <div className="text-2xl font-bold">{value}</div>
                )}
            </CardContent>
        </Card>
    )
}

export function DashboardStats() {
  const { db, user: currentUser, loading: userLoading } = useFirebase();
  const isAdmin = currentUser?.role === 'مشرف النظام' || currentUser?.role === 'مدير النظام';

  // Make queries dependent on admin status to avoid permission errors
  const usersQuery = useMemo(() => db && isAdmin ? collection(db, 'users') : null, [db, isAdmin]);
  const coursesQuery = useMemo(() => db ? collection(db, 'courses') : null, [db]);
  const jobsQuery = useMemo(() => db ? collection(db, 'jobs') : null, [db]);
  const articlesQuery = useMemo(() => db ? collection(db, 'articles') : null, [db]);

  const { data: users, loading: usersLoading } = useCollection<UserProfile>(usersQuery);
  const { data: courses, loading: coursesLoading } = useCollection<Course>(coursesQuery);
  const { data: jobs, loading: jobsLoading } = useCollection<Job>(jobsQuery);
  const { data: articles, loading: articlesLoading } = useCollection<Article>(articlesQuery);

  const loading = userLoading || usersLoading || coursesLoading || jobsLoading || articlesLoading;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="إجمالي المستخدمين" value={users.length} icon={Users} loading={loading} />
        <StatCard title="إجمالي الكورسات" value={courses.length} icon={BookOpen} loading={loading} />
        <StatCard title="إجمالي الوظائف" value={jobs.length} icon={Briefcase} loading={loading} />
        <StatCard title="إجمالي المقالات" value={articles.length} icon={FileText} loading={loading} />
    </div>
  );
}
