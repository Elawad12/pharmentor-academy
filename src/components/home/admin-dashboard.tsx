"use client";

import { ListChecks, Landmark, BookOpen, Briefcase, FileText, Users, Share2, Gem, Mail, Settings, DatabaseBackup } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardStats } from "./dashboard-stats";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft } from "lucide-react";

export function AdminDashboard() {
  return (
    <>
      <DashboardStats />
      <div className="flex items-center justify-between mb-8 leading-none mt-12">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white border-r-4 border-accent pr-4">
          إدارة المنصة
        </h3>
      </div>
       <Alert className="mb-8" variant="default">
          <ArrowLeft className="h-4 w-4" />
          <AlertTitle className="font-bold">كيفية الاستخدام</AlertTitle>
          <AlertDescription>
              هذه اللوحة هي مركز التحكم الخاص بك. لإدارة قسم معين (مثل المقالات)، اضغط على الزر الخاص به للانتقال إلى صفحته، حيث ستجد خيارات التعديل والحذف لكل عنصر.
          </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 custom-shadow hover:shadow-lg transition-shadow">
          <CardHeader className="p-0">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold">إدارة المستخدمين</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              عرض وتعديل صلاحيات المستخدمين.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
              <Button asChild className="w-full rounded-lg text-sm font-bold" size="sm">
                <Link href="/users">إدارة المستخدمين</Link>
              </Button>
          </CardContent>
        </Card>

        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 custom-shadow hover:shadow-lg transition-shadow">
          <CardHeader className="p-0">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
              <Briefcase className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold">إدارة الوظائف</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              إضافة وتعديل وحذف إعلانات الوظائف.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
              <Button asChild className="w-full rounded-lg text-sm font-bold" size="sm">
                <Link href="/jobs">إدارة الوظائف</Link>
              </Button>
          </CardContent>
        </Card>
        
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 custom-shadow hover:shadow-lg transition-shadow">
          <CardHeader className="p-0">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <FileText className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold">إدارة المقالات</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              كتابة وتحرير وحذف المقالات والأخبار.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
              <Button asChild className="w-full rounded-lg text-sm font-bold" size="sm">
                <Link href="/articles">إدارة المقالات</Link>
              </Button>
          </CardContent>
        </Card>

        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 custom-shadow hover:shadow-lg transition-shadow">
          <CardHeader className="p-0">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold">إدارة الكورسات</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              إضافة وتعديل الكورسات التعليمية.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
              <Button asChild className="w-full rounded-lg text-sm font-bold" size="sm">
                <Link href="/courses">إدارة الكورسات</Link>
              </Button>
          </CardContent>
        </Card>

        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 custom-shadow hover:shadow-lg transition-shadow">
          <CardHeader className="p-0">
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
              <ListChecks className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold">أهداف المنصة</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              تحديث وتعديل أهداف ورؤية المنصة.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
              <Button asChild className="w-full rounded-lg text-sm font-bold" size="sm">
                 <Link href="/goals">إدارة الأهداف</Link>
              </Button>
          </CardContent>
        </Card>

        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 custom-shadow hover:shadow-lg transition-shadow">
          <CardHeader className="p-0">
            <div className="w-12 h-12 bg-pink-50 dark:bg-pink-900/20 rounded-xl flex items-center justify-center text-pink-600 dark:text-pink-400 mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold">رسائل التواصل</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              عرض الرسائل الواردة من الزوار.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
              <Button asChild className="w-full rounded-lg text-sm font-bold" size="sm">
                <Link href="/contact-submissions">عرض الرسائل</Link>
              </Button>
          </CardContent>
        </Card>
        
         <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 custom-shadow hover:shadow-lg transition-shadow col-span-1 md:col-span-2">
          <CardHeader className="p-0">
            <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-4">
              <Settings className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold">إعدادات المنصة</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              إدارة هوية المنصة، روابط التواصل، والحسابات البنكية.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Button asChild className="w-full rounded-lg text-sm font-bold" size="sm" variant="outline">
                <Link href="/branding">إدارة الهوية</Link>
              </Button>
              <Button asChild className="w-full rounded-lg text-sm font-bold" size="sm" variant="outline">
                <Link href="/settings">روابط التواصل</Link>
              </Button>
              <Button asChild className="w-full rounded-lg text-sm font-bold" size="sm" variant="outline">
                <Link href="/accounts">الحسابات البنكية</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="p-6 rounded-2xl border-slate-200 dark:border-slate-800 custom-shadow hover:shadow-lg transition-shadow bg-slate-50 dark:bg-slate-800/50 col-span-1 md:col-span-2 lg:col-span-4">
          <CardHeader className="p-0">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
              <DatabaseBackup className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg font-bold">إدارة النسخ الاحتياطي</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              تتم عملية النسخ الاحتياطي بشكل آمن وتلقائي على خوادم Google Cloud. هذا القسم للمراقبة المستقبلية ولا يتطلب أي تدخل يدوي.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4">
              <Button className="w-full rounded-lg text-sm font-bold" size="sm" disabled>
                عرض سجلات النسخ الاحتياطي (قيد التطوير)
              </Button>
          </CardContent>
        </Card>

      </div>
    </>
  );
}
