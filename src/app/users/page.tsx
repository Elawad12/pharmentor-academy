
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useFirebase, useCollection } from "@/firebase";
import { collection, deleteDoc, doc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useMemo } from "react";

export default function UsersPage() {
  const { toast } = useToast();
  const { db, user: currentUser, loading: userLoading } = useFirebase();
  const isAdmin = currentUser?.role === 'مشرف النظام' || currentUser?.role === 'مدير النظام';

  const usersQuery = useMemo(() => {
    // Only query if db is available AND the user is an admin
    if (db && isAdmin) {
      return collection(db, 'users');
    }
    return null;
  }, [db, isAdmin]);
  
  const { data: users, loading: usersLoading } = useCollection<UserProfile>(usersQuery);

  const loading = userLoading || usersLoading;

  const handleDelete = (userId: string, userName: string) => {
    if (!db) return;
    const userDocRef = doc(db, 'users', userId);
    deleteDoc(userDocRef)
      .then(() => {
        toast({
          title: "تم حذف المستخدم بنجاح!",
          description: `تم حذف المستخدم "${userName}".`,
        });
      })
      .catch((serverError) => {
        console.error("Firestore 'delete' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: userDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="mt-2 text-muted-foreground">
            تعديل وحذف مستخدمي المنصة.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl custom-shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px] hidden sm:table-cell"></TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد الإلكتروني</TableHead>
                <TableHead className="hidden md:table-cell">رقم الهاتف</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead className="text-left w-[200px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell className="hidden sm:table-cell">
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </TableCell>
                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-left">
                        <div className="flex gap-2">
                           <Skeleton className="h-9 w-20" />
                           <Skeleton className="h-9 w-20" />
                        </div>
                    </TableCell>
                </TableRow>
              ))}
              {!loading && users.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                    {isAdmin ? 'لا يوجد مستخدمون لعرضهم في الوقت الحالي.' : 'ليس لديك الصلاحية لعرض هذه البيانات.'}
                    </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="hidden sm:table-cell">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email || 'غير متوفر'}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.phoneNumber || 'غير متوفر'}</TableCell>
                    <TableCell className="font-medium text-accent">{user.role}</TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/users/edit/${user.id}`}>
                            <Pencil className="ml-2 h-4 w-4" />
                            تعديل
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" disabled={user.role === 'مدير النظام' || user.id === currentUser?.id}>
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                              <AlertDialogDescription>
                                هذا الإجراء سيحذف بيانات المستخدم من قاعدة البيانات ولكن لن يحذف حسابه من نظام المصادقة.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(user.id, user.name)}>
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
