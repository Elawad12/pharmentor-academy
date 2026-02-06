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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useFirebase } from "@/firebase";
import { doc, setDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import type { UserProfile, UserRole } from "@/lib/types";

const profileFormSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يكون الاسم 3 أحرف على الأقل." }),
  avatar: z.string().url({ message: "الرجاء إدخال رابط صورة صحيح." }).optional().or(z.literal('')),
  role: z.enum(["طالب", "خريج", "صيدلي"]).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function EditProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, firebaseUser, loading, db } = useFirebase();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      avatar: "",
    },
  });

  useEffect(() => {
    if (!loading && !firebaseUser) {
        router.push('/login');
        return;
    }
    if (user) {
      form.reset({
        name: user.name,
        avatar: user.avatar,
        role: user.role as any,
      });
    } else if (firebaseUser) {
        form.reset({
            name: firebaseUser.displayName || "",
            avatar: firebaseUser.photoURL || "",
        });
    }
  }, [user, firebaseUser, loading, form, router]);

  function onSubmit(data: ProfileFormValues) {
    if (!firebaseUser || !db) return;
    const userRef = doc(db, 'users', firebaseUser.uid);
    
    const updateData: Partial<UserProfile> = {
        name: data.name,
        avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random&color=fff`,
    };

    if (!user) { // This is a new user profile creation
        updateData.email = firebaseUser.email!;
        updateData.phoneNumber = firebaseUser.phoneNumber || null;
        updateData.createdAt = serverTimestamp() as Timestamp;
    }

    let userRole: UserRole | undefined;

    if (firebaseUser.email === 'admin@pharmenor.com') {
      userRole = 'مدير النظام';
    } else if (!user) { // Only assign role from form for new, non-admin users
      if (!data.role) {
        toast({
          variant: 'destructive',
          title: 'مطلوب',
          description: 'الرجاء اختيار دورك لإكمال ملفك الشخصي.',
        });
        return;
      }
      userRole = data.role;
    }

    if (userRole) {
      updateData.role = userRole;
    }

    setDoc(userRef, updateData, { merge: true })
      .then(() => {
        toast({
          title: "تم تحديث ملفك الشخصي!",
          description: "تم حفظ تغييراتك بنجاح.",
        });
        router.push('/profile');
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({
          path: userRef.path,
          operation: user ? 'update' : 'create',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  if (loading || !firebaseUser) {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <Skeleton className="h-10 w-48 mb-8" />
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
      <div className="mb-8">
        <Link href="/profile">
          <Button variant="outline">
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى الملف الشخصي
          </Button>
        </Link>
      </div>
      <Card className="rounded-2xl custom-shadow">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {user ? 'تعديل الملف الشخصي' : 'إكمال الملف الشخصي'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
               <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                      <Input value={firebaseUser.email || ''} disabled />
                  </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input placeholder="اسمك الكامل..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!user && firebaseUser.email !== 'admin@pharmenor.com' && (
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>أنا</FormLabel>
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
              )}
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابط الصورة الرمزية (Avatar)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://example.com/avatar.png" {...field} />
                    </FormControl>
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
