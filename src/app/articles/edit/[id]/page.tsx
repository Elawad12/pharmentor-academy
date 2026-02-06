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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useFirebase, useDoc } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import type { Article } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const articleFormSchema = z.object({
  title: z.string().min(3, { message: "يجب أن يكون عنوان المقال 3 أحرف على الأقل." }),
  excerpt: z.string().min(10, { message: "يجب أن يكون الملخص 10 أحرف على الأقل." }),
  content: z.string().min(50, { message: "يجب أن يكون المحتوى 50 حرفًا على الأقل." }),
  imageUrl: z.string().url({ message: "الرجاء إدخال رابط صورة صحيح." }).optional().or(z.literal('')),
  imageHint: z.string().optional(),
});

type ArticleFormValues = z.infer<typeof articleFormSchema>;

export default function EditArticlePage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: userLoading, db } = useFirebase();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';

  const articleRef = useMemo(() => (db ? doc(db, 'articles', params.id) : null), [db, params.id]);
  const { data: article, loading: articleLoading } = useDoc<Article>(articleRef);
  
  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
    },
  });

  useEffect(() => {
    if (!userLoading && !isAdmin) {
      router.push('/');
    }
  }, [user, userLoading, isAdmin, router]);

  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        imageUrl: article.imageUrl,
        imageHint: article.imageHint
      });
    }
  }, [article, form]);

  function onSubmit(data: ArticleFormValues) {
    if (!articleRef) return;
     updateDoc(articleRef, data)
      .then(() => {
        toast({
          title: "تم تحديث المقال بنجاح!",
          description: `تم تحديث مقال "${data.title}".`,
        });
        router.push("/articles");
      })
      .catch((serverError) => {
        console.error("Firestore 'update' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: articleRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  const loading = userLoading || articleLoading;

  if (loading) {
     return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Skeleton className="h-10 w-48 mb-8" />
            <Card className="rounded-2xl custom-shadow">
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent className="space-y-8">
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
  
  if (!article) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold">المقال غير موجود</h1>
            <p className="mt-2 text-muted-foreground">لم يتم العثور على المقال الذي تبحث عنه.</p>
            <Link href="/articles" className="mt-6 inline-block">
                <Button>
                    <ArrowLeft className="ml-2 h-4 w-4" />
                    العودة إلى المقالات
                </Button>
            </Link>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/articles">
          <Button variant="outline">
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى قائمة المقالات
          </Button>
        </Link>
      </div>
      <Card className="rounded-2xl custom-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">تعديل المقال: {article.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان المقال</FormLabel>
                    <FormControl>
                      <Input placeholder="عنوان المقال..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ملخص المقال</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="ملخص قصير للمقال..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>محتوى المقال الكامل</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="اكتب محتوى المقال هنا..."
                        rows={15}
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
                    <FormLabel>رابط صورة المقال</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                     <FormDescription>
                       أدخل رابطاً لصورة تعبر عن المقال.
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
                      <Input placeholder="مثال: pharmacy research" {...field} />
                    </FormControl>
                     <FormDescription>
                       (اختياري) كلمة أو كلمتين بالإنجليزية لوصف الصورة لمساعدة الذكاء الاصطناعي.
                    </FormDescription>
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
