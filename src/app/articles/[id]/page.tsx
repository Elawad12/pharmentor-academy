"use client";

import { useFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Article } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import placeholderImages from "@/lib/placeholder-images.json";
import { useMemo } from "react";

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  const { db } = useFirebase();
  const articleRef = useMemo(() => db ? doc(db, 'articles', params.id) : null, [db, params.id]);
  const { data: article, loading } = useDoc<Article>(articleRef);

  if (loading) {
    return (
       <div className="max-w-4xl mx-auto px-4 py-12" style={{ minHeight: 'calc(100vh - 400px)' }}>
            <div className="text-center mb-12">
                <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
                <Skeleton className="h-6 w-1/2 mx-auto" />
            </div>
            <Skeleton className="w-full h-96 rounded-lg mb-8" />
            <div className="prose dark:prose-invert lg:prose-xl mx-auto space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-8 w-1/3" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-3/4" />
            </div>
       </div>
    )
  }

  if (!article) {
     return (
        <div className="max-w-4xl mx-auto px-4 py-12 text-center" style={{ minHeight: 'calc(100vh - 400px)' }}>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">المقال غير موجود</h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">عذراً، المقال الذي تبحث عنه غير موجود.</p>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12" style={{ minHeight: 'calc(100vh - 400px)' }}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">{article.title}</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          {article.excerpt}
        </p>
      </div>
        <div className="relative w-full h-96 rounded-lg overflow-hidden mb-8">
            <Image 
                src={article.imageUrl || placeholderImages.article.url}
                alt={article.title} 
                fill 
                className="object-cover" 
                data-ai-hint={article.imageHint || placeholderImages.article.hint}
            />
        </div>
      <div className="prose dark:prose-invert lg:prose-xl mx-auto" dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} />
    </div>
  );
}
