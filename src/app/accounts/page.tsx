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
import type { BankAccount } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AccountsPage() {
  const { toast } = useToast();
  const { user, loading: userLoading, db } = useFirebase();
  const router = useRouter();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';

  const bankAccountsQuery = useMemo(() => (db && isAdmin) ? collection(db, 'bankAccounts') : null, [db, isAdmin]);
  const { data: bankAccounts, loading: accountsLoading } = useCollection<BankAccount>(bankAccountsQuery);

  const loading = userLoading || accountsLoading;

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push('/');
    }
  }, [user, userLoading, isAdmin, router]);

  const handleDelete = (accountId: string, accountName: string) => {
    if (!db) return;
    const accountDocRef = doc(db, 'bankAccounts', accountId);
    deleteDoc(accountDocRef)
      .then(() => {
        toast({
          title: "تم حذف الحساب بنجاح!",
          description: `تم حذف حساب "${accountName}".`,
        });
      })
      .catch((serverError) => {
        console.error("Firestore 'delete' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: accountDocRef.path,
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
                    <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-40" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-56" /></TableHead>
                    <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-56" /></TableCell>
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
          <h1 className="text-3xl font-bold">إدارة الحسابات البنكية</h1>
          <p className="mt-2 text-muted-foreground">
            إضافة وتعديل وحذف الحسابات البنكية الخاصة بالمنصة.
          </p>
        </div>
        <Link href="/accounts/new">
          <Button className="rounded-lg font-bold">إضافة حساب جديد</Button>
        </Link>
      </div>

       <Card className="rounded-2xl custom-shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم البنك</TableHead>
                <TableHead>اسم صاحب الحساب</TableHead>
                <TableHead>رقم الحساب</TableHead>
                <TableHead className="text-left w-[200px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    لم يتم إضافة أي حسابات بنكية بعد.
                  </TableCell>
                </TableRow>
              ) : (
                bankAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.bankName}</TableCell>
                    <TableCell>{account.accountHolderName}</TableCell>
                    <TableCell className="break-all">{account.accountNumber}</TableCell>
                    <TableCell className="text-left">
                      <div className="flex gap-2">
                          <Button asChild variant="outline" size="sm">
                              <Link href={`/accounts/edit/${account.id}`}>
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
                                  هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف الحساب البنكي بشكل دائم.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(account.id, account.bankName)}>
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
