"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare, ArrowLeft } from "lucide-react";
import * as React from "react";
import { useFirebase, useCollection, useDoc } from "@/firebase";
import { collection, doc, orderBy, query, runTransaction, serverTimestamp } from "firebase/firestore";
import type { Inquiry, Reply } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useMemo } from "react";

function RepliesList({ inquiryId }: { inquiryId: string }) {
    const { db } = useFirebase();
    const repliesQuery = useMemo(() => 
        db ? query(collection(db, 'consultations', inquiryId, 'answers'), orderBy('createdAt', 'asc')) : null
    , [db, inquiryId]);

    const { data: replies, loading } = useCollection<Reply>(repliesQuery);

    if (loading) {
        return (
             <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                <Card key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                    </Card>
                ))}
            </div>
        )
    }

    if (replies.length === 0) {
        return (
            <div className="text-center p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-bold">لا توجد ردود بعد</h3>
                <p className="text-sm text-muted-foreground">كن أول من يشارك برأيه!</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {replies.map(reply => (
                <Card key={reply.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-start gap-4">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={reply.avatar} alt={reply.author} />
                            <AvatarFallback>{reply.author.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="font-bold text-slate-900 dark:text-white">{reply.author}</p>
                                <p className="text-xs text-muted-foreground">
                                    {reply.createdAt && formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true, locale: ar })}
                                </p>
                            </div>
                            <p className="mt-2 text-slate-700 dark:text-slate-300">{reply.content}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default function InquiryDetailPage({ params }: { params: { id: string } }) {
    const { toast } = useToast();
    const { user, db } = useFirebase();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const inquiryRef = useMemo(() => 
        db ? doc(db, 'consultations', params.id) : null
    , [db, params.id]);

    const { data: inquiry, loading } = useDoc<Inquiry>(inquiryRef);
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!db || !inquiryRef) return;

        const form = e.currentTarget;
        const textarea = form.querySelector('textarea');
        if (!user) {
            toast({
                variant: "destructive",
                title: "يجب تسجيل الدخول أولاً",
                description: "الرجاء تسجيل الدخول للمشاركة في النقاش.",
            });
            return;
        }
        if (textarea && textarea.value.trim() !== "") {
            const replyContent = textarea.value;
            const replyData = {
                content: replyContent,
                author: user.name,
                authorId: user.id,
                avatar: user.avatar,
                createdAt: serverTimestamp()
            };
            setIsSubmitting(true);
            runTransaction(db, async (transaction) => {
                const consDoc = await transaction.get(inquiryRef);
                if (!consDoc.exists()) {
                    throw "Inquiry does not exist!";
                }

                const newAnswersCount = (consDoc.data().answersCount || 0) + 1;
                transaction.update(inquiryRef, { answersCount: newAnswersCount });

                const newAnswerRef = doc(collection(inquiryRef, "answers"));
                transaction.set(newAnswerRef, replyData);
            }).then(() => {
                toast({
                    title: "تمت إضافة ردك بنجاح!",
                });
                if (textarea) textarea.value = "";
            }).catch((error) => {
                console.error("Transaction error:", error);
                const permissionError = new FirestorePermissionError({
                    path: inquiryRef.path,
                    operation: 'update',
                    requestResourceData: { answer: replyData },
                });
                errorEmitter.emit('permission-error', permissionError);
            }).finally(() => {
                setIsSubmitting(false);
            });
        }
    };
    
    if(loading) {
         return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <Skeleton className="h-10 w-48 mb-8" />
                <Card className="p-8 rounded-2xl custom-shadow mb-12">
                     <div className="flex items-start gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                </Card>
                <Skeleton className="h-6 w-32 mb-6" />
                <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
         )
    }

    if (!inquiry) {
        return (
             <div className="max-w-4xl mx-auto px-4 py-12 text-center" style={{ minHeight: 'calc(100vh - 400px)' }}>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white">الاستفسار غير موجود</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">عذراً، الاستفسار الذي تبحث عنه غير موجود.</p>
                 <Link href="/consultations" className="mt-8 inline-block">
                    <Button>
                        <ArrowLeft className="ml-2 h-4 w-4" />
                        العودة إلى كل الاستفسارات
                    </Button>
                </Link>
            </div>
        )
    }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
            <Link href="/consultations">
            <Button variant="outline">
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة إلى كل الاستفسارات
            </Button>
            </Link>
        </div>
      <Card className="p-8 rounded-2xl custom-shadow mb-12">
         <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={inquiry.avatar} alt={inquiry.author} />
                <AvatarFallback>{inquiry.author.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="font-bold text-lg text-slate-900 dark:text-white">{inquiry.author}</p>
                    <p className="text-xs text-muted-foreground">
                        {inquiry.createdAt && formatDistanceToNow(inquiry.createdAt.toDate(), { addSuffix: true, locale: ar })}
                    </p>
                </div>
                <p className="mt-2 text-slate-700 dark:text-slate-300 text-lg">{inquiry.question}</p>
              </div>
            </div>
      </Card>

        <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">الردود ({inquiry.answersCount})</h2>
            
            <RepliesList inquiryId={inquiry.id} />
            
            <Card className="rounded-2xl custom-shadow">
                <CardHeader>
                <CardTitle>أضف ردًا</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                <CardContent>
                    <Textarea
                    placeholder={user ? "اكتب ردك هنا..." : "الرجاء تسجيل الدخول للمشاركة في النقاش"}
                    rows={5}
                    className="rounded-lg"
                    disabled={!user || isSubmitting}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="font-bold rounded-lg" disabled={!user || isSubmitting}>
                    <Send className="ml-2 h-4 w-4" />
                    إرسال الرد
                    </Button>
                </CardFooter>
                </form>
            </Card>
        </div>
    </div>
  );
}
