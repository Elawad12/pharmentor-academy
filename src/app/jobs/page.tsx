"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Pencil, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import * as React from "react";
import { useFirebase, useCollection } from "@/firebase";
import { collection, deleteDoc, doc } from "firebase/firestore";
import type { Job } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useMemo } from "react";

export default function JobsPage() {
  const { toast } = useToast();
  const { user, db } = useFirebase();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';

  const jobsQuery = useMemo(() => db ? collection(db, 'jobs') : null, [db]);
  const { data: jobs, loading } = useCollection<Job>(jobsQuery);

  const handleDelete = (jobId: string, jobTitle: string) => {
    if (!db) return;
    const jobDocRef = doc(db, "jobs", jobId);
    deleteDoc(jobDocRef)
      .then(() => {
        toast({
          title: "تم حذف الوظيفة بنجاح!",
          description: `تم حذف وظيفة "${jobTitle}".`,
        });
      })
      .catch((serverError) => {
        console.error("Firestore 'delete' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: jobDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <div className="text-center flex-grow">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">فرص العمل</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            اكتشف أحدث الوظائف الشاغرة في مجال الصيدلة.
          </p>
        </div>
        {isAdmin && (
            <Link href="/jobs/new">
            <Button className="rounded-lg font-bold">إضافة وظيفة جديدة</Button>
            </Link>
        )}
      </div>

       {loading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
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
                                <Skeleton className="h-4 w-28 mt-4" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardFooter className="bg-slate-50 dark:bg-slate-900/50 p-3 grid grid-cols-1 gap-2">
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
          </div>
        )}

      <div className="space-y-6">
        {jobs.map((job) => (
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
                        {/* Fake date for now */}
                        {/* <p className="text-xs text-muted-foreground mt-4">نشرت قبل {job.id} أيام</p> */}
                    </div>
                </div>
             </CardHeader>
            <CardFooter className={`bg-slate-50 dark:bg-slate-900/50 p-3 grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
               <Button asChild className="w-full rounded-lg font-bold">
                 <Link href={`/jobs/${job.id}`}>
                  <ArrowRight className="ml-2 h-4 w-4" />
                  عرض التفاصيل
                </Link>
              </Button>
              {isAdmin && (
                <>
                    <Button asChild variant="outline" className="w-full rounded-lg font-bold">
                        <Link href={`/jobs/edit/${job.id}`}>
                        <Pencil className="ml-2 h-4 w-4" />
                        تعديل
                        </Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full rounded-lg font-bold">
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                            <AlertDialogDescription>
                            هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف الوظيفة بشكل دائم.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(job.id, job.title)}>
                            تأكيد الحذف
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
       {!loading && jobs.length === 0 && (
        <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 custom-shadow">
            <h3 className="text-2xl font-bold">لا توجد وظائف متاحة حالياً</h3>
            <p className="text-muted-foreground mt-2 mb-6">
                {isAdmin ? 'يمكنك إضافة أول وظيفة من خلال الضغط على زر "إضافة وظيفة جديدة".' : 'يرجى العودة لاحقاً للتحقق من وجود وظائف جديدة.'}
            </p>
             {isAdmin && (
                <Link href="/jobs/new">
                    <Button className="rounded-lg font-bold">إضافة وظيفة جديدة</Button>
                </Link>
            )}
        </div>
      )}
    </div>
  );
}
