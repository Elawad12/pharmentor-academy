"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { LogIn, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFirebase } from "@/firebase/provider";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const loginSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(1, { message: "الرجاء إدخال كلمة المرور." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, auth } = useFirebase();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    // Redirect if user is already logged in and session is loaded
    if (!loading && user) {
        router.push('/profile');
    }
  }, [user, loading, router]);
  
  async function onSubmit(data: LoginFormValues) {
    setError(null);
    setIsSubmitting(true);

    if (!auth) {
        setError("فشل الاتصال بخدمة المصادقة. الرجاء المحاولة مرة أخرى.");
        setIsSubmitting(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({ title: "تم تسجيل الدخول بنجاح!", description: "أهلاً بك مرة أخرى." });
      router.push('/profile');
    } catch (err: any) {
      console.error("Sign in error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else if (err.code === 'auth/configuration-not-found') {
        setError("فشل الاتصال بخدمة المصادقة. الرجاء التحقق من إعدادات مشروع Firebase.");
      } else {
        setError(err.message || "فشل تسجيل الدخول. الرجاء المحاولة مرة أخرى.");
      }
    } finally {
        setIsSubmitting(false);
    }
  }

  if (loading) {
     return (
        <div className="max-w-md mx-auto px-4 py-24" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <Card className="rounded-2xl custom-shadow">
                <CardHeader className="text-center">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-4 w-64 mx-auto mt-2" />
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                     <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-12 w-full mt-6" />
                </CardContent>
                 <CardFooter>
                    <Skeleton className="h-4 w-full" />
                </CardFooter>
            </Card>
        </div>
      )
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <Card className="rounded-2xl custom-shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بريدك الإلكتروني وكلمة المرور للمتابعة</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="example@email.com" {...field} autoComplete="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} autoComplete="current-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="lg" className="w-full font-bold rounded-lg" disabled={isSubmitting || loading}>
                  <LogIn className="ml-2 h-4 w-4" />
                  دخول
                </Button>
              </form>
            </Form>

          {error && (
             <Alert variant="destructive" className="mt-6">
              <Terminal className="h-4 w-4" />
              <AlertTitle>حدث خطأ</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
         <CardFooter className="text-sm text-center block">
              <p className="text-muted-foreground">
                  ليس لديك حساب؟{" "}
                  <Link href="/register" className="font-bold text-primary hover:underline">
                    أنشئ حسابًا جديدًا
                  </Link>
              </p>
          </CardFooter>
      </Card>
    </div>
  );
}
