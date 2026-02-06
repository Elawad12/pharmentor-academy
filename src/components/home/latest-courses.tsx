"use client";

import { useFirebase, useCollection } from "@/firebase";
import { collection, limit, query } from "firebase/firestore";
import type { Course } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import placeholderImages from "@/lib/placeholder-images.json";
import { useMemo } from "react";

export function LatestCourses() {
    const { db } = useFirebase();
    const coursesQuery = useMemo(() => db ? query(collection(db, 'courses'), limit(3)) : null, [db]);
    const { data: courses, loading } = useCollection<Course>(coursesQuery);

    return (
        <section id="latest-courses" className="mb-16 scroll-mt-24">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white border-r-4 border-accent pr-4">أحدث الكورسات</h2>
                <Button asChild variant="outline">
                    <Link href="/courses">
                        <ArrowLeft className="ml-2 h-4 w-4" />
                        عرض كل الكورسات
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && [...Array(3)].map((_, i) => (
                    <Card key={i} className="flex flex-col overflow-hidden rounded-2xl custom-shadow">
                        <Skeleton className="w-full h-56" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                        <CardFooter>
                             <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
                 {!loading && courses.map((course) => (
                    <Card key={course.id} className="flex flex-col overflow-hidden rounded-2xl custom-shadow">
                        <div className="relative w-full h-56">
                            <Image
                            src={course.imageUrl || placeholderImages.course.url}
                            alt={course.name}
                            fill
                            className="object-cover"
                            data-ai-hint={course.imageHint || placeholderImages.course.hint}
                            />
                        </div>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="font-bold text-lg">{course.name}</CardTitle>
                                <div className="text-lg font-black text-primary whitespace-nowrap">
                                {course.price > 0 ? `${course.price} ${course.currency}` : 'مجاني'}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow">
                        <p className="text-muted-foreground text-sm line-clamp-3">{course.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full font-bold rounded-lg">
                                <Link href={`/courses`}>التسجيل في الكورس</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {!loading && courses.length === 0 && (
                <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 custom-shadow col-span-full">
                    <h3 className="text-xl font-bold">لا توجد كورسات متاحة حالياً</h3>
                    <p className="text-muted-foreground mt-2">يرجى العودة لاحقاً للتحقق من وجود كورسات جديدة.</p>
                </div>
            )}
        </section>
    )
}
