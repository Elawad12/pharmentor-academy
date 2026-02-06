"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare, Trash2 } from "lucide-react";
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
import { addDoc, collection, deleteDoc, doc, orderBy, query, serverTimestamp } from "firebase/firestore";
import type { Inquiry } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useMemo } from "react";

export default function InquiriesPage() {
  const { toast } = useToast();
  const { user, db } = useFirebase();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const inquiriesQuery = useMemo(() => 
    db ? query(collection(db, 'consultations'), orderBy('createdAt', 'desc')) : null
  , [db]);
  const { data: inquiries, loading } = useCollection<Inquiry>(inquiriesQuery);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;
    const form = e.currentTarget;
    const textarea = form.querySelector('textarea');
    if (!user) {
         toast({
            variant: "destructive",
            title: "يجب تسجيل الدخول أولاً",
            description: "الرجاء تسجيل الدخول أو إنشاء حساب لطرح استفسار.",
        });
        return;
    }
    if (textarea && textarea.value.trim() !== "") {
      const inquiryData = {
        question: textarea.value,
        author: user.name,
        authorId: user.id,
        avatar: user.avatar,
        answersCount: 0,
        createdAt: serverTimestamp(),
      };
      const inquiriesCol = collection(db, 'consultations');
      setIsSubmitting(true);
      addDoc(inquiriesCol, inquiryData)
        .then(() => {
          toast({
            title: "تم إرسال استفسارك",
            description: "سيتم مراجعته من قبل المشرفين والرد عليه في أقرب وقت.",
          });
          if(textarea) textarea.value = "";
        })
        .catch((serverError) => {
          console.error("Firestore 'add' error:", serverError);
          const permissionError = new FirestorePermissionError({
            path: inquiriesCol.path,
            operation: 'create',
            requestResourceData: inquiryData,
          });
          errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "الرجاء كتابة استفسارك قبل الإرسال.",
      });
    }
  };
  
  const handleDelete = (inquiryId: string) => {
    if (!db) return;
    const inquiryDocRef = doc(db, 'consultations', inquiryId);
    deleteDoc(inquiryDocRef)
      .then(() => {
        toast({
          title: "تم حذف الاستفسار بنجاح!",
          description: "تم حذف الاستفسار من المنصة.",
        });
      })
      .catch((serverError) => {
        console.error("Firestore 'delete' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: inquiryDocRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">الاستفسارات والتفاعل</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          اطرح استفساراتك وتفاعل مع المشرفين والزملاء من الصيادلة والطلاب.
        </p>
      </div>

      <Card className="mb-12 rounded-2xl custom-shadow">
        <CardHeader>
          <CardTitle>أضف استفسارًا جديدًا</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Textarea
              placeholder={user ? "اكتب استفسارك هنا..." : "الرجاء تسجيل الدخول لطرح استفسار"}
              rows={5}
              className="rounded-lg"
              disabled={!user || isSubmitting}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="font-bold rounded-lg" disabled={!user || isSubmitting}>
              <Send className="ml-2 h-4 w-4" />
              إرسال الاستفسار
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">أحدث الاستفسارات</h2>
        {loading && (
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
               <Card key={i} className="p-6 rounded-2xl custom-shadow">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                       <Skeleton className="h-5 w-24" />
                       <Skeleton className="h-4 w-full" />
                       <Skeleton className="h-4 w-3/4" />
                        <div className="mt-4 flex items-center justify-between">
                            <Skeleton className="h-5 w-20" />
                        </div>
                    </div>
                  </div>
                </Card>
            ))}
          </div>
        )}
        {inquiries.map((inquiry) => (
          <Card key={inquiry.id} className="p-6 rounded-2xl custom-shadow">
            <div className="flex items-start gap-4">
              <Avatar>
                <AvatarImage src={inquiry.avatar} alt={inquiry.author} />
                <AvatarFallback>{inquiry.author.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white">{inquiry.author}</p>
                <p className="mt-2 text-slate-700 dark:text-slate-300">{inquiry.question}</p>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground font-normal p-1 h-auto">
                        <Link href={`/consultations/${inquiry.id}`}>
                            <MessageSquare className="ml-2 h-4 w-4" />
                            <span>{inquiry.answersCount} {inquiry.answersCount === 1 ? 'رد' : 'ردود'}</span>
                        </Link>
                    </Button>
                    {(isAdmin || user?.id === inquiry.authorId) && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="rounded-full w-8 h-8">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                                <AlertDialogDescription>
                                هذا الإجراء سيحذف الاستفسار وكل الردود عليه بشكل دائم ولا يمكن التراجع عنه.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(inquiry.id)}>
                                تأكيد الحذف
                                </AlertDialogAction>
                            </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
              </div>
            </div>
          </Card>
        ))}
         {!loading && inquiries.length === 0 && (
            <div className="text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 custom-shadow">
                <h3 className="text-2xl font-bold">لا توجد استفسارات حالياً</h3>
                <p className="text-muted-foreground mt-2">كن أول من يطرح استفساراً!</p>
            </div>
        )}
      </div>
    </div>
  );
}
