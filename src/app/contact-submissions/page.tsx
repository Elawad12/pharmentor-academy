"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Trash2 } from "lucide-react";
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
import { collection, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import type { ContactSubmission } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ContactSubmissionsPage() {
  const { toast } = useToast();
  const { user, loading: userLoading, db } = useFirebase();
  const router = useRouter();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';

  const submissionsQuery = useMemo(() => 
    (db && isAdmin) ? query(collection(db, 'contactSubmissions'), orderBy('submittedAt', 'desc')) : null
  , [db, isAdmin]);
  const { data: submissions, loading: submissionsLoading } = useCollection<ContactSubmission>(submissionsQuery);

  const loading = userLoading || submissionsLoading;

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push('/');
    }
  }, [user, userLoading, isAdmin, router]);

  const handleDelete = (submissionId: string) => {
    if (!db) return;
    const submissionDocRef = doc(db, 'contactSubmissions', submissionId);
    deleteDoc(submissionDocRef)
      .then(() => {
        toast({
          title: "تم حذف الرسالة بنجاح!",
        });
      })
      .catch((serverError) => {
        console.error("Firestore 'delete' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: submissionDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Skeleton className="h-12 w-1/2 mb-2" />
        <Skeleton className="h-5 w-3/4 mb-8" />
        <Card className="rounded-2xl custom-shadow">
          <CardContent className="p-0">
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-20" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell className="text-left">
                            <Skeleton className="h-9 w-20" />
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>
      </div>
    );
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
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-left mb-8">
        <h1 className="text-3xl font-bold">رسائل التواصل</h1>
        <p className="mt-2 text-muted-foreground">
          عرض وإدارة الرسائل الواردة من نموذج "تواصل معنا".
        </p>
      </div>

      <Card className="rounded-2xl custom-shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المرسل</TableHead>
                <TableHead className="hidden md:table-cell">البريد الإلكتروني</TableHead>
                <TableHead>الرسالة</TableHead>
                <TableHead>تاريخ الإرسال</TableHead>
                <TableHead className="text-left w-[100px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    لم يتم استلام أي رسائل من نموذج التواصل بعد.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{submission.email}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{submission.message}</TableCell>
                    <TableCell>
                      {submission.submittedAt ? format(submission.submittedAt.toDate(), "d MMMM yyyy", { locale: ar }) : "غير محدد"}
                    </TableCell>
                    <TableCell className="text-left">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                            <AlertDialogDescription>
                              هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف الرسالة بشكل دائم.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(submission.id)}>
                              تأكيد الحذف
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
