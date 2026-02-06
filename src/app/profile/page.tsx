
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RegisteredCourses } from "@/components/profile/registered-courses";
import { UserConsultations } from "@/components/profile/user-consultations";

export default function ProfilePage() {
    const { user, firebaseUser, loading } = useFirebase();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!firebaseUser) {
                router.push('/login');
            } else if (!user) {
                router.push('/profile/edit');
            }
        }
    }, [user, firebaseUser, loading, router]);


    if (loading || !user) {
         return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <Skeleton className="h-10 w-48 mx-auto" />
                    <Skeleton className="h-6 w-72 mx-auto mt-4" />
                </div>
                <Card className="rounded-2xl custom-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-6">
                            <Skeleton className="h-24 w-24 rounded-full"/>
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-40" />
                                <Skeleton className="h-5 w-24" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Skeleton className="h-32 w-full rounded-lg" />
                            <Skeleton className="h-32 w-full rounded-lg" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
             <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white">الملف الشخصي</h1>
                <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
                    إدارة معلومات حسابك وتفضيلاتك.
                </p>
            </div>
            <Card className="rounded-2xl custom-shadow">
                <CardHeader>
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-lg">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
                            <p className="text-accent font-bold mt-1">{user.role}</p>
                        </div>
                         <Button asChild variant="outline" className="mr-auto">
                            <Link href="/profile/edit">
                                <Pencil className="ml-2 h-4 w-4" />
                                تعديل
                            </Link>
                         </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                        <RegisteredCourses />
                        <UserConsultations />
                   </div>
                </CardContent>
            </Card>
        </div>
    );
}
