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
import { useEffect, useMemo } from "react";
import { useFirebase, useDoc } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { SocialLink } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";


const settingFormSchema = z.object({
    name: z.string().min(2, { message: "يجب أن يكون اسم المنصة حرفين على الأقل." }),
    value: z.string().url({ message: "يجب إدخال رابط صحيح." }),
});

type SettingFormValues = z.infer<typeof settingFormSchema>;

export default function EditSettingPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const { user: currentUser, loading: userLoading, db } = useFirebase();
  const isAdmin = currentUser?.role === 'مشرف النظام' || currentUser?.role === 'مدير النظام';

  const settingRef = useMemo(() => db ? doc(db, 'settings', params.id) : null, [db, params.id]);
  const { data: setting, loading: settingLoading } = useDoc<SocialLink>(settingRef);

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingFormSchema),
    defaultValues: {
      name: "",
      value: "",
    },
  });

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push('/');
    }
  }, [currentUser, userLoading, isAdmin, router]);

  useEffect(() => {
    if (setting) {
      form.reset({
        name: setting.name,
        value: setting.value,
      });
    }
  }, [setting, form]);

  function onSubmit(data: SettingFormValues) {
    if (!settingRef) return;
    updateDoc(settingRef, data)
      .then(() => {
        toast({
          title: "تم تحديث الرابط بنجاح!",
          description: `تم تحديث الرابط.`,
        });
        router.push('/settings');
      })
      .catch((serverError) => {
        console.error("Firestore 'update' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: settingRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const loading = userLoading || settingLoading;

  if (loading) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Skeleton className="h-10 w-48 mb-8" />
            <Card className="rounded-2xl custom-shadow">
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                    <Skeleton className="h-12 w-32" />
                </CardContent>
            </Card>
        </div>
    )
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

  if (!setting) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold">الرابط غير موجود</h1>
            <p className="mt-2 text-muted-foreground">لم يتم العثور على الرابط الذي تبحث عنه.</p>
            <Link href="/settings" className="mt-6 inline-block">
                <Button>
                    <ArrowLeft className="ml-2 h-4 w-4" />
                    العودة إلى إدارة الروابط
                </Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/settings">
          <Button variant="outline">
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى إدارة الروابط
          </Button>
        </Link>
      </div>
      <Card className="rounded-2xl custom-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">تعديل الرابط: {setting.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المنصة</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم المنصة..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرابط (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="رابط المنصة..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="font-bold rounded-lg" disabled={form.formState.isSubmitting}>حفظ التعديلات</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
