"use client";

import { useFirebase, useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import type { Inquiry } from "@/lib/types";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

export function UserConsultations() {
    const { user, db } = useFirebase();
    const userId = user?.id;

    const inquiriesQuery = useMemo(() => {
        if (!userId || !db) return null;
        return query(
            collection(db, 'consultations'),
            where('authorId', '==', userId)
        );
    }, [db, userId]);

    const { data: inquiries, loading } = useCollection<Inquiry>(inquiriesQuery);

    const sortedInquiries = useMemo(() => {
        if (!inquiries) return [];
        return [...inquiries].sort((a, b) => {
            const timeA = a.createdAt?.toDate().getTime() || 0;
            const timeB = b.createdAt?.toDate().getTime() || 0;
            return timeB - timeA;
        });
    }, [inquiries]);

    if (loading) {
        return (
             <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">الاستفسارات المقدمة</h3>
                <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        )
    }

    if (sortedInquiries.length === 0) {
        return (
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">الاستفسارات المقدمة</h3>
                <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg h-full">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="font-bold">لم تقدم أي استفسارات بعد</p>
                    <p className="text-xs text-muted-foreground mt-1">شارك خبراتك أو اطرح استفسارًا جديدًا.</p>
                    <Button size="sm" asChild className="mt-4">
                        <Link href="/consultations">اذهب للاستفسارات</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">الاستفسارات المقدمة ({sortedInquiries.length})</h3>
            <div className="grid grid-cols-1 gap-4">
                {sortedInquiries.map(inquiry => (
                    <Link key={inquiry.id} href={`/consultations/${inquiry.id}`}>
                        <Card className="overflow-hidden h-full transition-shadow hover:shadow-md p-4">
                            <p className="font-semibold text-sm truncate">{inquiry.question}</p>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-xs text-muted-foreground">
                                    {inquiry.createdAt && formatDistanceToNow(inquiry.createdAt.toDate(), { addSuffix: true, locale: ar })}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                     <MessageSquare className="w-3 h-3" />
                                     {inquiry.answersCount}
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}
