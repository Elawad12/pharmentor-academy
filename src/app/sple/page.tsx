"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import * as React from "react";
import { useFirebase, useCollection } from "@/firebase";
import { collection, query, where, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course, CourseRegistration } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useMemo } from "react";

export default function SplePage() {
  const { toast } = useToast();
  const { user, db, loading: userLoading } = useFirebase();

  const spleCoursesQuery = useMemo(() => 
    db ? query(collection(db, 'courses'), where('isSple', '==', true)) : null
  , [db]);

  const { data: courses, loading: coursesLoading } = useCollection<Course>(spleCoursesQuery);
  
  const registrationsQuery = useMemo(() => {
    if (!user || !db) return null;
    return collection(db, 'users', user.id, 'registrations');
  }, [db, user]);

  const { data: registrations, loading: registrationsLoading } = useCollection<CourseRegistration>(registrationsQuery);

  const registeredCourseIds = useMemo(() => 
    new Set(registrations.map(reg => reg.courseId))
  , [registrations]);


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
      <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">امتحان رخصة الممارسة الصيدلانية (SPLE)</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            مجموعة من الكورسات المتخصصة والمصممة لمساعدتك على اجتياز امتحان القيد الصيدلي (SPLE) بثقة وتميز.
          </p>
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
                        <CardFooter className="grid grid-cols-1 gap-2">
                             <Skeleton className="h-10 w-full" />
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
            {course.imageUrl && (
              <div className="relative w-full h-56">
                <Image
                  src={course.imageUrl}
                  alt={course.name}
                  fill
                  className="object-cover"
                  data-ai-hint={course.imageHint}
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="font-bold text-lg">{course.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground text-sm">{course.description}</p>
            </CardContent>
            <CardFooter className="grid grid-cols-1 gap-2">
              <Button 
                  className="font-bold rounded-lg w-full" 
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
            </CardFooter>
          </Card>
        )})}
      </div>
      {!loading && courses.length === 0 && (
        <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 custom-shadow">
            <h3 className="text-2xl font-bold">لا توجد كورسات SPLE متاحة حالياً</h3>
            <p className="text-muted-foreground mt-2 mb-6">
                يرجى العودة لاحقاً للتحقق من وجود كورسات جديدة مخصصة لاختبار SPLE.
            </p>
             <Link href="/courses">
                <Button variant="outline">عرض كل الكورسات</Button>
            </Link>
        </div>
      )}
    </div>
  );
}
