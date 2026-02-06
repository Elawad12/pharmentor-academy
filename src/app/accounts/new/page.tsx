"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useFirebase } from "@/firebase";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const accountFormSchema = z.object({
  bankName: z.string().min(2, { message: "يجب أن يكون اسم البنك حرفين على الأقل." }),
  accountHolderName: z.string().min(2, { message: "يجب أن يكون اسم صاحب الحساب حرفين على الأقل." }),
  accountNumber: z.string().min(10, { message: "الرجاء إدخال رقم حساب صحيح." }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export default function NewAccountPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, db } = useFirebase();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
    },
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);

  function onSubmit(data: AccountFormValues) {
    if (!db) return;
    const bankAccountsCol = collection(db, 'bankAccounts');

    addDoc(bankAccountsCol, data)
      .then(() => {
        toast({
          title: "تمت إضافة الحساب بنجاح!",
          description: `تمت إضافة حساب '${data.bankName}' جديد للمنصة.`,
        });
        router.push('/accounts');
      })
      .catch((serverError) => {
        console.error("Firestore 'add' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: bankAccountsCol.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  if (loading) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Skeleton className="h-10 w-48 mb-8" />
            <Card className="rounded-2xl custom-shadow">
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                    <Skeleton className="h-12 w-32" />
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
      <div className="mb-8">
        <Link href="/accounts">
          <Button variant="outline">
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى إدارة الحسابات
          </Button>
        </Link>
      </div>
      <Card className="rounded-2xl custom-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">إضافة حساب بنكي جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="bankName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم البنك</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: البنك الأهلي السعودي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="accountHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم صاحب الحساب</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: شركة المنصة الرقمية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الحساب (IBAN)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: SA1234567890123456789012" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="font-bold rounded-lg" disabled={form.formState.isSubmitting}>إضافة الحساب</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
