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
import { Pencil, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
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
import type { SocialLink } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, loading: userLoading, db } = useFirebase();
  const router = useRouter();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';

  const socialLinksQuery = useMemo(() => (db && isAdmin) ? collection(db, 'settings') : null, [db, isAdmin]);
  const { data: socialLinks, loading: socialLinksLoading } = useCollection<SocialLink>(socialLinksQuery);

  const loading = userLoading || socialLinksLoading;

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push('/');
    }
  }, [user, userLoading, isAdmin, router]);

  const handleDelete = (settingId: string, settingName: string) => {
    if (!db) return;
    const settingDocRef = doc(db, 'settings', settingId);
    deleteDoc(settingDocRef)
      .then(() => {
        toast({
          title: "تم حذف الرابط بنجاح!",
          description: `تم حذف رابط "${settingName}".`,
        });
      })
      .catch((serverError) => {
        console.error("Firestore 'delete' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: settingDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };
  
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-12 w-1/2 mb-2" />
        <Skeleton className="h-5 w-3/4 mb-8" />
        <Card className="rounded-2xl custom-shadow">
          <CardContent className="p-0">
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-full" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                        <TableCell className="text-left">
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-20" />
                                <Skeleton className="h-9 w-20" />
                            </div>
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold">إدارة روابط التواصل الاجتماعي</h1>
          <p className="mt-2 text-muted-foreground">
            إضافة وتعديل وحذف روابط التواصل الخاصة بالمنصة.
          </p>
        </div>
        <Link href="/settings/new">
          <Button className="rounded-lg font-bold">إضافة رابط جديد</Button>
        </Link>
      </div>

       <Card className="rounded-2xl custom-shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المنصة</TableHead>
                <TableHead>الرابط</TableHead>
                <TableHead className="text-left w-[200px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {socialLinks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    لم يتم إضافة أي روابط بعد.
                  </TableCell>
                </TableRow>
              ) : (
                socialLinks.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell className="font-medium">{setting.name}</TableCell>
                    <TableCell className="break-all">{setting.value}</TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                              <Link href={`/settings/edit/${setting.id}`}>
                              <Pencil className="ml-2 h-4 w-4" />
                              تعديل
                              </Link>
                          </Button>
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
                                  هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف الرابط بشكل دائم.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(setting.id, setting.name)}>
                                  تأكيد الحذف
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
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
