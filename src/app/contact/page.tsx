"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useFirebase } from "@/firebase";

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "الرجاء إدخال اسم صحيح." }),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صحيح." }),
  message: z.string().min(10, { message: "يجب أن تكون الرسالة 10 أحرف على الأقل." }),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const { db } = useFirebase();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  function onSubmit(data: ContactFormValues) {
    if (!db) return;
    const submissionsCol = collection(db, 'contactSubmissions');
    const submissionData = {
        ...data,
        submittedAt: serverTimestamp(),
    };

    addDoc(submissionsCol, submissionData)
        .then(() => {
            toast({
              title: "تم إرسال رسالتك بنجاح!",
              description: `شكرًا لك ${data.name} على تواصلك معنا. سنقوم بالرد في أقرب وقت ممكن.`,
            });
            form.reset();
        })
        .catch((serverError) => {
            console.error("Firestore 'add' error:", serverError);
            const permissionError = new FirestorePermissionError({
                path: submissionsCol.path,
                operation: 'create',
                requestResourceData: submissionData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">تواصل معنا</h1>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          نسعد باستقبال استفساراتكم ومقترحاتكم.
        </p>
      </div>
      <Card className="rounded-2xl custom-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">إرسال رسالة</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="اسمك..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input placeholder="بريدك الإلكتروني..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الرسالة</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="اكتب رسالتك هنا..."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="font-bold rounded-lg" disabled={form.formState.isSubmitting}>
                <Send className="ml-2 h-4 w-4" />
                إرسال
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
