"use client";

import { useFirebase } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, where, documentId } from "firebase/firestore";
import type { Course, CourseRegistration } from "@/lib/types";
import { useMemo } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { BookOpen } from "lucide-react";

export function RegisteredCourses() {
    const { user, db, loading: firebaseLoading } = useFirebase();
    const userId = user?.id;

    const registrationsQuery = useMemo(() => {
        if (!userId || !db) return null;
        return collection(db, 'users', userId, 'registrations');
    }, [db, userId]);

    const { data: registrations, loading: loadingRegistrations } = useCollection<CourseRegistration>(registrationsQuery);

    const registeredCourseIds = useMemo(() => {
        if (registrations.length === 0) return [];
        return registrations.map(reg => reg.courseId);
    }, [registrations]);

    const coursesQuery = useMemo(() => {
        if (!db || registeredCourseIds.length === 0) return null;
        return query(collection(db, 'courses'), where(documentId(), 'in', registeredCourseIds));
    }, [db, registeredCourseIds]);

    const { data: courses, loading: loadingCourses } = useCollection<Course>(coursesQuery);
    
    const isLoading = firebaseLoading || loadingRegistrations || (registeredCourseIds.length > 0 && loadingCourses);

    if (isLoading) {
        return (
             <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">الكورسات المسجلة</h3>
                <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg h-full">
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            </div>
        )
    }

    if (courses.length === 0) {
        return (
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">الكورسات المسجلة</h3>
                <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg h-full">
                    <BookOpen className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="font-bold">لم تسجل في أي كورس بعد</p>
                    <p className="text-xs text-muted-foreground mt-1">تصفح الكورسات المتاحة وابدأ رحلتك التعليمية.</p>
                    <Button size="sm" asChild className="mt-4">
                        <Link href="/courses">تصفح الكورسات</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">الكورسات المسجلة ({courses.length})</h3>
            <div className="grid grid-cols-1 gap-4">
                {courses.map(course => (
                    <Link key={course.id} href={`/courses`}>
                        <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
                            <div className="flex items-center gap-4">
                                {course.imageUrl && 
                                    <div className="relative w-20 h-20 flex-shrink-0">
                                        <Image src={course.imageUrl} alt={course.name} fill className="object-cover" />
                                    </div>
                                }
                                <CardHeader className="py-4 px-0">
                                    <CardTitle className="text-base font-bold">{course.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground mt-1">{course.level} - {course.duration}</p>
                                </CardHeader>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
