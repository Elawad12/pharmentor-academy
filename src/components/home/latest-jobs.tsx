"use client";

import { useFirebase, useCollection } from "@/firebase";
import { collection, limit, query } from "firebase/firestore";
import type { Job } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

export function LatestJobs() {
    const { db } = useFirebase();
    const jobsQuery = useMemo(() => db ? query(collection(db, 'jobs'), limit(3)) : null, [db]);
    const { data: jobs, loading } = useCollection<Job>(jobsQuery);

    return (
        <section id="latest-jobs" className="mb-16 scroll-mt-24">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white border-r-4 border-accent pr-4">أحدث الوظائف</h2>
                <Button asChild variant="outline">
                    <Link href="/jobs">
                        <ArrowLeft className="ml-2 h-4 w-4" />
                        عرض كل الوظائف
                    </Link>
                </Button>
            </div>
            <div className="space-y-6">
                {loading && [...Array(2)].map((_, i) => (
                    <Card key={i} className="rounded-2xl custom-shadow overflow-hidden">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between">
                                <div>
                                    <Skeleton className="h-6 w-1/2 mb-2" />
                                    <Skeleton className="h-5 w-1/3 mb-4" />
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-sm">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end justify-between">
                                    <div className="flex flex-wrap gap-2">
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-5 w-20" />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-3 grid grid-cols-1 gap-2">
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
                 {!loading && jobs.map((job) => (
                    <Card key={job.id} className="rounded-2xl custom-shadow overflow-hidden">
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row justify-between">
                                <div>
                                    <CardTitle className="font-bold text-lg mb-1">
                                        <Link href={`/jobs/${job.id}`} className="hover:underline">{job.title}</Link>
                                    </CardTitle>
                                    <CardDescription className="text-base font-medium text-slate-700 dark:text-slate-200">{job.company}</CardDescription>
                                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{job.location}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-4 h-4" />
                                            <span>{job.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 sm:mt-0 flex flex-col items-start sm:items-end justify-between">
                                    <div className="flex flex-wrap gap-2">
                                        {job.tags && job.tags.map((tag, i) => (
                                            <Badge key={i} variant="secondary" className="font-medium">{tag}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardFooter className={`bg-slate-50 dark:bg-slate-900/50 p-3`}>
                            <Button asChild className="w-full font-bold rounded-lg">
                                <Link href={`/jobs/${job.id}`}>
                                <ArrowRight className="ml-2 h-4 w-4" />
                                عرض التفاصيل
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {!loading && jobs.length === 0 && (
                <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 custom-shadow">
                    <h3 className="text-xl font-bold">لا توجد وظائف متاحة حالياً</h3>
                    <p className="text-muted-foreground mt-2">يرجى العودة لاحقاً للتحقق من وجود وظائف جديدة.</p>
                </div>
            )}
        </section>
    )
}
