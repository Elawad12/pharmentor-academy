"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Briefcase, Building, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFirebase, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Job } from "@/lib/types";
import placeholderImages from "@/lib/placeholder-images.json";
import { useMemo } from "react";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { db } = useFirebase();
  const jobRef = useMemo(() => db ? doc(db, 'jobs', params.id) : null, [db, params.id]);
  const { data: job, loading } = useDoc<Job>(jobRef);

  if (loading) {
     return (
       <div className="max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="w-full h-64 rounded-2xl mb-8" />
        <Card className="rounded-2xl custom-shadow overflow-hidden">
          <CardHeader className="p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
             <Skeleton className="h-5 w-1/4" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-3/4" />
          </CardContent>
          <CardFooter className="p-6 bg-slate-50 dark:bg-slate-800/50">
             <Skeleton className="h-12 w-32" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center" style={{ minHeight: 'calc(100vh - 400px)' }}>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">الوظيفة غير موجودة</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          عذراً، لم نتمكن من العثور على تفاصيل هذه الوظيفة.
        </p>
        <Link href="/jobs" className="mt-8 inline-block">
          <Button>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى قائمة الوظائف
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="relative w-full h-64 rounded-2xl overflow-hidden mb-8">
        <Image
          src={job.imageUrl || placeholderImages.job.url}
          alt={job.title}
          fill
          className="object-cover"
          data-ai-hint={job.imageHint || placeholderImages.job.hint}
        />
      </div>
      <Card className="rounded-2xl custom-shadow overflow-hidden">
        <CardHeader className="p-6">
          <CardTitle className="text-3xl font-black">{job.title}</CardTitle>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground mt-4">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span className="font-medium text-slate-700 dark:text-slate-200">{job.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span>{job.type}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {job.tags && job.tags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="font-medium">{tag}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6 prose dark:prose-invert max-w-none">
          <h3>وصف الوظيفة</h3>
          <p>{job.description}</p>
        </CardContent>
        <CardFooter className="p-6 bg-slate-50 dark:bg-slate-800/50">
          <Button size="lg" className="font-bold rounded-lg w-full sm:w-auto">
            تقدم الآن
          </Button>
        </CardFooter>
      </Card>
      <div className="text-center mt-8">
        <Link href="/jobs">
          <Button variant="outline">
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى كل الوظائف
          </Button>
        </Link>
      </div>
    </div>
  );
}
