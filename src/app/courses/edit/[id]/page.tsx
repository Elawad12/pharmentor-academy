"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useFirebase, useDoc } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { Course } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { Switch } from "@/components/ui/switch";

const courseFormSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يكون اسم الكورس 3 أحرف على الأقل." }),
  description: z.string().min(10, { message: "يجب أن يكون الوصف 10 أحرف على الأقل." }),
  price: z.coerce.number().positive({ message: "يجب أن يكون السعر رقمًا موجبًا." }),
  currency: z.enum(["SAR", "SDG", "USD", "EUR", "AED", "KWD", "OMR"], {
    required_error: "الرجاء اختيار العملة.",
  }),
  duration: z.string().min(2, { message: "الرجاء إدخال مدة الكورس." }),
  level: z.enum(["مبتدئ", "متوسط", "متقدم"], {
    required_error: "الرجاء اختيار مستوى الكورس.",
  }),
  imageUrl: z.string().url({ message: "الرجاء إدخال رابط صورة صحيح." }).optional().or(z.literal('')),
  imageHint: z.string().optional(),
  isSple: z.boolean().default(false).optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: userLoading, db } = useFirebase();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';

  const courseRef = useMemo(() => db ? doc(db, "courses", params.id) : null, [db, params.id]);
  const { data: course, loading: courseLoading } = useDoc<Course>(courseRef);
  
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push('/');
    }
  }, [user, userLoading, isAdmin, router]);

  useEffect(() => {
    if (course) {
      form.reset({
        name: course.name,
        description: course.description,
        price: course.price,
        currency: course.currency,
        duration: course.duration,
        level: course.level,
        imageUrl: course.imageUrl,
        imageHint: course.imageHint,
        isSple: course.isSple,
      });
    }
  }, [course, form]);

  function onSubmit(data: CourseFormValues) {
    if (!courseRef) return;
    updateDoc(courseRef, data)
      .then(() => {
        toast({
          title: "تم تحديث الكورس بنجاح!",
          description: `تم تحديث كورس "${data.name}".`,
        });
        router.push("/courses");
      })
      .catch((serverError) => {
        console.error("Firestore 'update' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: courseRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }
  
  const loading = userLoading || courseLoading;

  if (loading) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Skeleton className="h-10 w-48 mb-8" />
            <Card className="rounded-2xl custom-shadow">
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    {[...Array(5)].map((_, i) => (
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
  
  if (!course) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold">الكورس غير موجود</h1>
            <p className="mt-2 text-muted-foreground">لم يتم العثور على الكورس الذي تبحث عنه.</p>
            <Link href="/courses" className="mt-6 inline-block">
                <Button>
                    <ArrowLeft className="ml-2 h-4 w-4" />
                    العودة إلى الكورسات
                </Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/courses">
          <Button variant="outline">
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى قائمة الكورسات
          </Button>
        </Link>
      </div>
      <Card className="rounded-2xl custom-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">تعديل الكورس: {course.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الكورس</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: مقدمة في الصيدلة السريرية" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف الكورس</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="صف ما سيتم تغطيته في هذا الكورس..."
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>السعر</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="250" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>العملة</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر العملة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SAR">ريال سعودي</SelectItem>
                          <SelectItem value="SDG">جنيه سوداني</SelectItem>
                          <SelectItem value="USD">دولار أمريكي</SelectItem>
                          <SelectItem value="EUR">يورو</SelectItem>
                          <SelectItem value="AED">درهم إماراتي</SelectItem>
                          <SelectItem value="KWD">دينار كويتي</SelectItem>
                          <SelectItem value="OMR">ريال عماني</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المدة</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: 4 أسابيع" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المستوى</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مستوى الكورس" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                        <SelectItem value="متوسط">متوسط</SelectItem>
                        <SelectItem value="متقدم">متقدم</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط صورة الكورس</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                     <FormDescription>
                       أدخل رابطاً لصورة تعبر عن الكورس.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="imageHint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تلميح الصورة (AI Hint)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: medical lab" {...field} />
                    </FormControl>
                     <FormDescription>
                       (اختياري) كلمة أو كلمتين بالإنجليزية لوصف الصورة لمساعدة الذكاء الاصطناعي.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="isSple"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                        <FormLabel className="text-base">
                        كورس تحضيري لاختبار SPLE؟
                        </FormLabel>
                        <FormDescription>
                        حدد هذا الخيار إذا كان الكورس مخصصًا للتحضير لامتحان رخصة الممارسة الصيدلانية.
                        </FormDescription>
                    </div>
                    <FormControl>
                        <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
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
