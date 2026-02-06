"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
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
import type { Article } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import placeholderImages from "@/lib/placeholder-images.json";
import { useMemo } from "react";

export default function ArticlesPage() {
  const { toast } = useToast();
  const { user, db } = useFirebase();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';

  const articlesQuery = useMemo(() => db ? collection(db, 'articles') : null, [db]);
  const { data: articles, loading } = useCollection<Article>(articlesQuery);

  const handleDelete = (articleId: string, articleTitle: string) => {
    if (!db) return;
    const articleDocRef = doc(db, "articles", articleId);
    deleteDoc(articleDocRef)
      .then(() => {
        toast({
          title: "تم حذف المقال بنجاح!",
          description: `تم حذف مقال "${articleTitle}".`,
        });
      })
      .catch((serverError) => {
        console.error("Firestore 'delete' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: articleDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-12">
        <div className="text-center flex-grow">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">المقالات والأبحاث</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            ابق على اطلاع بأحدث التطورات والمواضيع المهمة في عالم الصيدلة.
            </p>
        </div>
        {isAdmin && (
            <Link href="/articles/new">
                <Button className="rounded-lg font-bold">إضافة مقال جديد</Button>
            </Link>
        )}
      </div>

       {loading && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                    <Card key={i} className="flex flex-col overflow-hidden rounded-2xl custom-shadow">
                        <Skeleton className="w-full h-56" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                        <CardFooter className="grid grid-cols-3 gap-2">
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article) => (
          <Card key={article.id} className="flex flex-col overflow-hidden rounded-2xl custom-shadow">
              <Link href={`/articles/${article.id}`} className="block">
                <div className="relative w-full h-56">
                  <Image
                    src={article.imageUrl || placeholderImages.article.url}
                    alt={article.title}
                    fill
                    className="object-cover"
                    data-ai-hint={article.imageHint || placeholderImages.article.hint}
                  />
                </div>
              </Link>
            <CardHeader>
              <CardTitle className="font-bold text-lg">
                <Link href={`/articles/${article.id}`}>{article.title}</Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground text-sm">{article.excerpt}</p>
            </CardContent>
            <CardFooter className={`grid ${isAdmin ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
              <Button asChild variant="outline" className="w-full rounded-lg font-bold">
                <Link href={`/articles/${article.id}`}>
                  <ArrowLeft className="ml-2 h-4 w-4" />
                  قراءة
                </Link>
              </Button>
              {isAdmin && (
                <>
                  <Button asChild variant="outline" className="w-full rounded-lg font-bold">
                    <Link href={`/articles/edit/${article.id}`}>
                      <Pencil className="ml-2 h-4 w-4" />
                      تعديل
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full rounded-lg font-bold">
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          هذا الإجراء لا يمكن التراجع عنه. سيؤدي هذا إلى حذف المقال بشكل دائم.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>إلغاء</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(article.id, article.title)}>
                          تأكيد الحذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
       {!loading && articles.length === 0 && (
        <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 custom-shadow">
            <h3 className="text-2xl font-bold">لا توجد مقالات متاحة حالياً</h3>
            <p className="text-muted-foreground mt-2 mb-6">
                {isAdmin ? 'يمكنك إضافة أول مقال من خلال الضغط على زر "إضافة مقال جديد".' : 'يرجى العودة لاحقاً للتحقق من وجود مقالات جديدة.'}
            </p>
             {isAdmin && (
                <Link href="/articles/new">
                    <Button className="rounded-lg font-bold">إضافة مقال جديد</Button>
                </Link>
            )}
        </div>
      )}
    </div>
  );
}
