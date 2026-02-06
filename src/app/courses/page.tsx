"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
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
import { collection, query, where, doc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, CourseRegistration } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import placeholderImages from "@/lib/placeholder-images.json";
import { useMemo } from "react";

export default function CoursesPage() {
  const { toast } = useToast();
  const { user, db, loading: userLoading } = useFirebase();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';

  const coursesQuery = useMemo(() => db ? collection(db, 'courses') : null, [db]);
  const { data: courses, loading: coursesLoading } = useCollection<Course>(coursesQuery);
  
  const registrationsQuery = useMemo(() => {
    if (!user || !db) return null;
    return collection(db, 'users', user.id, 'registrations');
  }, [db, user]);

  const { data: registrations, loading: registrationsLoading } = useCollection<CourseRegistration>(registrationsQuery);

  const registeredCourseIds = useMemo(() => 
    new Set(registrations.map(reg => reg.courseId))
  , [registrations]);

  const handleDelete = (courseId: string, courseName: string) => {
    if (!db) return;
    const courseDocRef = doc(db, "courses", courseId);
    deleteDoc(courseDocRef)
      .then(() => {
        toast({
          title: "تم حذف الكورس بنجاح!",
          description: `تم حذف كورس "${courseName}".`,
        });
      })
      .catch((serverError) => {
        console.error("Firestore 'delete' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: courseDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const handleRegister = (courseId: string, courseName: string) => {
    if (!user || !db) {
      toast({
        variant: "destructive",
        title: "يجب تسجيل الدخول أولاً",
        description: "الرجاء تسجيل الدخول أو إنشاء حساب للتسجيل في الكورس.",
      });
      return;
    }
    const registrationRef = doc(db, 'users', user.id, 'registrations', courseId);
    const registrationData: Omit<CourseRegistration, 'id'> = {
      userId: user.id,
      courseId: courseId,
      registeredAt: serverTimestamp() as any,
    };
    setDoc(registrationRef, registrationData)
      .then(() => {
        toast({
          title: "تم التسجيل بنجاح!",
          description: `لقد سجلت في كورس "${courseName}".`,
        });
      })
      .catch((serverError) => {
        console.error("Firestore 'set' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: registrationRef.path,
          operation: 'create',
          requestResourceData: registrationData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const loading = coursesLoading || userLoading || registrationsLoading;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <div className="text-center flex-grow">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">الكورسات المتاحة</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            طور مهاراتك ومعرفتك مع مجموعة من الكورسات المتخصصة المقدمة من خبراء المجال.
          </p>
        </div>
        {isAdmin && (
            <Link href="/courses/new">
                <Button className="rounded-lg font-bold">إضافة كورس جديد</Button>
            </Link>
        )}
      </div>

        {loading && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="flex flex-col overflow-hidden rounded-2xl custom-shadow">
                        <Skeleton className="w-full h-56" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                        <CardFooter className="grid grid-cols-2 gap-2">
                             <Skeleton className="h-10 w-full col-span-2" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {!loading && courses.map((course) => {
          const isRegistered = registeredCourseIds.has(course.id);
          return (
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
              <p className="text-muted-foreground text-sm">{course.description}</p>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
              {isAdmin ? (
                <>
                  <Button asChild variant="outline" className="w-full rounded-lg font-bold">
                    <Link href={`/courses/edit/${course.id}`}>
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
                          هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف الكورس بشكل دائم.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(course.id, course.name)}>
                          تأكيد الحذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <Button 
                    className="font-bold rounded-lg w-full col-span-2" 
                    onClick={() => handleRegister(course.id, course.name)}
                    disabled={isRegistered}
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle className="ml-2 h-4 w-4" />
                      مسجل
                    </>
                  ) : (
                    'التسجيل في الكورس'
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        )})}
      </div>
      {!loading && courses.length === 0 && (
        <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 custom-shadow">
            <h3 className="text-2xl font-bold">لا توجد كورسات متاحة حالياً</h3>
            <p className="text-muted-foreground mt-2 mb-6">
                {isAdmin ? 'يمكنك إضافة أول كورس من خلال الضغط على زر "إضافة كورس جديد".' : 'يرجى العودة لاحقاً للتحقق من وجود كورسات جديدة.'}
            </p>
             {isAdmin && (
                <Link href="/courses/new">
                    <Button className="rounded-lg font-bold">إضافة كورس جديد</Button>
                </Link>
            )}
        </div>
      )}
    </div>
  );
}
