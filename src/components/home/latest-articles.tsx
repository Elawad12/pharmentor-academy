"use client";

import { useFirebase, useCollection } from "@/firebase";
import { collection, limit, query } from "firebase/firestore";
import type { Article } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import placeholderImages from "@/lib/placeholder-images.json";
import { useMemo } from "react";

export function LatestArticles() {
    const { db } = useFirebase();
    const articlesQuery = useMemo(() => db ? query(collection(db, 'articles'), limit(3)) : null, [db]);
    const { data: articles, loading } = useCollection<Article>(articlesQuery);

    return (
        <section id="latest-articles" className="mb-16 scroll-mt-24">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white border-r-4 border-accent pr-4">أحدث المقالات</h2>
                <Button asChild variant="outline">
                    <Link href="/articles">
                        <ArrowLeft className="ml-2 h-4 w-4" />
                        عرض كل المقالات
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && [...Array(3)].map((_, i) => (
                    <Card key={i} className="flex flex-col overflow-hidden rounded-2xl custom-shadow">
                        <Skeleton className="w-full h-56" />
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                             <Skeleton className="h-4 w-full" />
                             <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                        <CardFooter>
                             <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
                 {!loading && articles.map((article) => (
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
                        <p className="text-muted-foreground text-sm line-clamp-3">{article.excerpt}</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full font-bold rounded-lg">
                                <Link href={`/articles/${article.id}`}>
                                    <ArrowLeft className="ml-2 h-4 w-4" />
                                    قراءة المقال
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
             {!loading && articles.length === 0 && (
                <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 custom-shadow col-span-full">
                    <h3 className="text-xl font-bold">لا توجد مقالات متاحة حالياً</h3>
                    <p className="text-muted-foreground mt-2">يرجى العودة لاحقاً للتحقق من وجود مقالات جديدة.</p>
                </div>
            )}
        </section>
    )
}
