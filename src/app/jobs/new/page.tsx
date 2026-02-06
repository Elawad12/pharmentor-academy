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
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useFirebase } from "@/firebase";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const jobFormSchema = z.object({
  title: z.string().min(3, { message: "يجب أن يكون عنوان الوظيفة 3 أحرف على الأقل." }),
  company: z.string().min(2, { message: "الرجاء إدخال اسم الشركة." }),
  location: z.string().min(2, { message: "الرجاء إدخال الموقع." }),
  type: z.enum(["دوام كامل", "دوام جزئي", "عقد"], {
    required_error: "الرجاء اختيار نوع الدوام.",
  }),
  tags: z.string().optional(),
  description: z.string().min(10, { message: "يجب أن يكون الوصف 10 أحرف على الأقل." }),
  imageUrl: z.string().url({ message: "الرجاء إدخال رابط صورة صحيح." }).optional().or(z.literal('')),
  imageHint: z.string().optional(),
});

type JobFormValues = z.infer<typeof jobFormSchema>;

export default function NewJobPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, db } = useFirebase();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';

  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      tags: "",
      description: "",
      imageUrl: "",
      imageHint: "",
    },
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);

  function onSubmit(data: JobFormValues) {
    if (!db) return;
    const jobsCol = collection(db, "jobs");
    const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];
    const jobData = {
        ...data,
        tags: tagsArray,
    };
    addDoc(jobsCol, jobData)
      .then(() => {
        toast({
            title: "تمت إضافة الوظيفة بنجاح!",
            description: `تمت إضافة وظيفة "${data.title}" إلى المنصة.`,
        });
        router.push("/jobs");
      })
      .catch((serverError) => {
        console.error("Firestore 'add' error:", serverError);
        const permissionError = new FirestorePermissionError({
            path: jobsCol.path,
            operation: 'create',
            requestResourceData: jobData,
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
                <CardContent className="space-y-8">
                    {[...Array(6)].map((_, i) => (
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
        <Link href="/jobs">
          <Button variant="outline">
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى قائمة الوظائف
          </Button>
        </Link>
      </div>
      <Card className="rounded-2xl custom-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">إضافة وظيفة جديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسمى الوظيفي</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: صيدلي سريري" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الشركة</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: مستشفى مركزي" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الموقع</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: مدينة كبرى" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع الدوام</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع الدوام" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="دوام كامل">دوام كامل</SelectItem>
                          <SelectItem value="دوام جزئي">دوام جزئي</SelectItem>
                          <SelectItem value="عقد">عقد</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوسوم (Tags)</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: خبرة سنتين, تسجيل ساري" {...field} />
                    </FormControl>
                     <FormDescription>
                      افصل بين الوسوم بفاصلة.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف الوظيفة</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="صف تفاصيل ومتطلبات الوظيفة..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                 <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط صورة الوظيفة</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                     <FormDescription>
                       أدخل رابطاً لصورة تعبر عن الوظيفة.
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
                      <Input placeholder="مثال: company logo" {...field} />
                    </FormControl>
                     <FormDescription>
                       (اختياري) كلمة أو كلمتين بالإنجليزية لوصف الصورة لمساعدة الذكاء الاصطناعي.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="font-bold rounded-lg" disabled={form.formState.isSubmitting}>إضافة الوظيفة</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
