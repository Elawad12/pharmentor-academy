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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase, useDoc } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Branding } from "@/lib/types";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const brandingFormSchema = z.object({
  name: z.string().min(2, { message: "يجب أن يكون اسم المنصة حرفين على الأقل." }),
  logoUrl: z.string().url({ message: "الرجاء إدخال رابط شعار صحيح." }).optional().or(z.literal('')),
});

type BrandingFormValues = z.infer<typeof brandingFormSchema>;

const BRANDING_DOC_ID = 'main';

export default function BrandingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user: currentUser, loading: userLoading, db } = useFirebase();
  const isPlatformManager = currentUser?.role === 'مدير النظام';

  const brandingRef = useMemo(() => db ? doc(db, 'branding', BRANDING_DOC_ID) : null, [db]);
  const { data: branding, loading: brandingLoading } = useDoc<Branding>(brandingRef);

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      name: "PharMentor",
      logoUrl: "",
    },
  });

  useEffect(() => {
    if (!userLoading && !isPlatformManager) {
      router.push('/');
    }
  }, [currentUser, userLoading, isPlatformManager, router]);

  useEffect(() => {
    if (branding) {
      form.reset({
        name: branding.name,
        logoUrl: branding.logoUrl,
      });
    }
  }, [branding, form]);

  function onSubmit(data: BrandingFormValues) {
    if (!brandingRef) return;
    setDoc(brandingRef, data, { merge: true })
      .then(() => {
        toast({
          title: "تم تحديث الهوية بنجاح!",
          description: `تم تحديث اسم وشعار المنصة.`,
        });
      })
      .catch((serverError) => {
        console.error("Firestore 'set' error:", serverError);
        const permissionError = new FirestorePermissionError({
          path: brandingRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }
  
  const isLoading = userLoading || brandingLoading;

  if (isLoading || !isPlatformManager) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="rounded-2xl custom-shadow">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {[...Array(2)].map((_, i) => (
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Card className="rounded-2xl custom-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">إدارة هوية المنصة</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المنصة</FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم المنصة..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الشعار (URL)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormDescription>
                      أدخل رابطًا مباشرًا لصورة الشعار.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="font-bold rounded-lg" disabled={form.formState.isSubmitting}>حفظ التغييرات</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
