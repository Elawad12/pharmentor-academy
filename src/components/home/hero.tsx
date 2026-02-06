import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <div className="hero-gradient rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
      <div className="relative z-10 max-w-2xl">
        <h2 className="text-4xl font-black mb-4">أهلاً بك في منصة PharMentor</h2>
        <p className="text-blue-50 opacity-90 text-lg leading-relaxed mb-8">
          البيئة الرقمية الأولى المتكاملة لدعم الصيادلة والطلاب. من التدريب والامتياز إلى التوظيف والبورد.
        </p>
        <div className="flex flex-wrap gap-4 font-bold">
          <Button size="lg" asChild className="bg-white text-primary px-8 py-3 h-auto rounded-xl shadow-lg hover:scale-105 transition hover:bg-slate-50">
            <Link href="/courses">
              ابدأ تعلم الآن
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="bg-black/20 backdrop-blur text-white border-white/30 px-8 py-3 h-auto rounded-xl hover:bg-black/30 hover:text-white transition"
          >
            <Link href="/sple">
              امتحان القيد (SPLE)
            </Link>
          </Button>
        </div>
      </div>
      <div className="absolute -left-20 -bottom-20 opacity-10">
        <FileText className="w-96 h-96" strokeWidth={0.5} />
      </div>
    </div>
  );
}
