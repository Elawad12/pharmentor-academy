"use client";

import { useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Goal } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Target, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFirebase } from "@/firebase/provider";
import { useMemo } from "react";

function GoalsList() {
    const { db } = useFirebase();
    const goalsQuery = useMemo(() => db ? collection(db, 'goals') : null, [db]);
    const { data: goals, loading } = useCollection<Goal>(goalsQuery);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {goals.map(goal => (
                <div key={goal.id} className="flex items-start gap-4">
                    <div className="w-8 h-8 flex-shrink-0 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{goal.text}</p>
                </div>
            ))}
        </div>
    )
}

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 dark:text-white">عن منصة PharMentor</h1>
        <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
          رؤيتنا هي بناء بيئة رقمية متكاملة تكون المرجع الأول والدليل المهني لكل صيدلي وطالب صيدلة، من مقاعد الدراسة وحتى أعلى درجات التخصص المهني.
        </p>
      </section>

      <section className="mb-16">
        <Card className="rounded-2xl custom-shadow p-8">
            <CardHeader className="p-0 mb-6">
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                    <Award className="w-8 h-8 text-primary" />
                    أهدافنا
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <GoalsList />
            </CardContent>
        </Card>
      </section>
      
      <section>
        <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
             <Users className="w-8 h-8 text-primary" />
            فريق العمل
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl mx-auto">
            <Card className="rounded-2xl custom-shadow text-center p-8">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-lg">
                    <AvatarImage src="https://ui-avatars.com/api/?name=Eithar+Karrar&background=0D8ABC&color=fff&size=128" alt="د. إيثار كرار" />
                    <AvatarFallback>EK</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-bold">د. إيثار كرار</CardTitle>
                <p className="text-accent font-semibold mt-1">الإشراف والمحتوى الطبي</p>
            </Card>
             <Card className="rounded-2xl custom-shadow text-center p-8">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-white dark:border-slate-800 shadow-lg">
                    <AvatarImage src="https://ui-avatars.com/api/?name=Alaish+Alawad&background=22C55E&color=fff&size=128" alt="م. عليش العوض" />
                    <AvatarFallback>AA</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl font-bold">م. عليش العوض</CardTitle>
                <p className="text-accent font-semibold mt-1">الملكية الفكرية والبرمجة</p>
            </Card>
        </div>
      </section>
    </div>
  );
}
