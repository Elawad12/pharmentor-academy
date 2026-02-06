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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useFirebase, useDoc } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProfile } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const userFormSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يكون الاسم 3 أحرف على الأقل." }),
  phoneNumber: z.string().optional().or(z.literal('')),
  role: z.enum(["طالب", "خريج", "صيدلي", "مشرف", "مشرف النظام", "مدير النظام"], {
    required_error: "الرجاء اختيار دور المستخدم.",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function EditUserPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const { db, user: currentUser } = useFirebase();

  const userRef = useMemo(() => db ? doc(db, 'users', params.id) : null, [db, params.id]);
  const { data: user, loading } = useDoc<UserProfile>(userRef);
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: "", phoneNumber: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        phoneNumber: user.phoneNumber || "",
        role: user.role,
      });
    }
  }, [user, form]);

  function onSubmit(data: UserFormValues) {
    if (!userRef) return;
    updateDoc(userRef, data)
      .then(() => {
        toast({
          title: "تم تحديث المستخدم بنجاح!",
          description: `تم تحديث بيانات المستخدم "${data.name}".`,
        });
        router.push('/users');
      })
      .catch((serverError) => {
        console.error("Firestore 'update' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: 'update',
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
  
  if (!user) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold">المستخدم غير موجود</h1>
            <p className="mt-2 text-muted-foreground">لم يتم العثور على المستخدم الذي تبحث عنه.</p>
            <Link href="/users" className="mt-6 inline-block">
                <Button>
                    <ArrowLeft className="ml-2 h-4 w-4" />
                    العودة إلى قائمة المستخدمين
                </Button>
            </Link>
        </div>
    )
  }
  
  const isEditingSelf = currentUser?.id === user.id;
  const isTargetManager = user.role === 'مدير النظام';
  const isCurrentUserPlatformManager = currentUser?.role === 'مدير النظام';

  const canEdit = isCurrentUserPlatformManager || !isTargetManager;
  const canChangeRole = !isEditingSelf && (isCurrentUserPlatformManager || !isTargetManager);


  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/users">
          <Button variant="outline">
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى قائمة المستخدمين
          </Button>
        </Link>
      </div>
      <Card className="rounded-2xl custom-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">تعديل المستخدم: {user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                      <Input value={user.email} disabled />
                  </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="الاسم الكامل..." {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف (اختياري)</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="رقم الهاتف..." {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدور</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!canChangeRole}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر دور المستخدم" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="طالب">طالب</SelectItem>
                         <SelectItem value="خريج">خريج</SelectItem>
                        <SelectItem value="صيدلي">صيدلي</SelectItem>
                        <SelectItem value="مشرف">مشرف</SelectItem>
                        <SelectItem value="مشرف النظام">مشرف النظام</SelectItem>
                        {isTargetManager && <SelectItem value="مدير النظام">مدير النظام</SelectItem>}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="font-bold rounded-lg" disabled={!canEdit}>حفظ التعديلات</Button>
              {!canEdit && <p className="text-sm text-destructive font-medium">ليس لديك الصلاحية لتعديل بيانات هذا المستخدم.</p>}
              {canEdit && !canChangeRole && isEditingSelf && <p className="text-sm text-muted-foreground font-medium">لا يمكنك تعديل دورك.</p>}
              {canEdit && !canChangeRole && !isEditingSelf && <p className="text-sm text-muted-foreground font-medium">ليس لديك الصلاحية لتغيير دور هذا المستخدم.</p>}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
