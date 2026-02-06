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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserPlus, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useFirebase } from "@/firebase/provider";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserProfile } from "@/lib/types";

const registerSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يكون الاسم 3 أحرف على الأقل." }),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
  role: z.enum(["طالب", "خريج", "صيدلي"], { required_error: "الرجاء اختيار دورك الحالي." }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading, auth, db } = useFirebase();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!loading && user) {
        router.push('/profile');
    }
  }, [user, loading, router]);

  async function onSubmit(data: RegisterFormValues) {
    setError(null);
    setIsSubmitting(true);
    
    if (!auth || !db) {
        setError("فشل الاتصال بخدمة المصادقة. الرجاء المحاولة مرة أخرى.");
        setIsSubmitting(false);
        return;
    }

    try {
      // Step 1: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Step 2: Create user profile in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      const isAdmin = data.email === 'admin@pharmenor.com';

      const profileData: Omit<UserProfile, 'id' | 'createdAt'> = {
        name: data.name,
        email: data.email,
        role: isAdmin ? 'مدير النظام' : data.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff&size=128`,
        phoneNumber: null,
      };

      await setDoc(userDocRef, {
          ...profileData,
          createdAt: serverTimestamp()
      });

      toast({ title: "تم إنشاء الحساب بنجاح!", description: "مرحبًا بك في PharMentor." });
      // The onAuthStateChanged listener in the provider will handle the redirect.
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("هذا البريد الإلكتروني مستخدم بالفعل. هل تريد تسجيل الدخول بدلاً من ذلك؟");
      } else if (err.code === 'auth/configuration-not-found') {
        setError("فشل الاتصال بخدمة المصادقة. الرجاء التحقق من إعدادات مشروع Firebase.");
      } else {
        setError(err.message || "فشل إنشاء الحساب. الرجاء المحاولة مرة أخرى.");
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
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
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
    <div className="max-w-md mx-auto px-4 py-16" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <Card className="rounded-2xl custom-shadow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">إنشاء حساب جديد</CardTitle>
          <CardDescription>انضم إلى منصة PharMentor اليوم</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="اسمك الكامل..." {...field} autoComplete="name" />
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
                      <Input type="password" placeholder="********" {...field} autoComplete="new-password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>أنا حاليًا</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر دورك الحالي" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="طالب">طالب صيدلة</SelectItem>
                        <SelectItem value="خريج">صيدلي خريج</SelectItem>
                        <SelectItem value="صيدلي">صيدلي ممارس</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full font-bold rounded-lg" disabled={isSubmitting || loading}>
                <UserPlus className="ml-2 h-4 w-4" />
                إنشاء حساب
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
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              سجل الدخول
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
