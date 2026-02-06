"use client";

import Link from "next/link";
import { Facebook, Instagram, Linkedin, Twitter, MessageCircle } from "lucide-react";
import * as React from "react";
import { useFirebase, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";
import type { SocialLink } from "@/lib/types";
import { useBranding } from "@/hooks/useBranding";
import { useMemo } from "react";

export function Footer() {
  const { user, db } = useFirebase();
  const isAdmin = user?.role === 'مشرف النظام' || user?.role === 'مدير النظام';
  const { branding } = useBranding();

  const socialLinksQuery = useMemo(() => db ? collection(db, 'settings') : null, [db]);
  const { data: socialLinksData, loading } = useCollection<SocialLink>(socialLinksQuery);

  const socialLinksMap = useMemo(() => {
    const links: { [key: string]: string } = {
        twitter: '#',
        linkedin: '#',
        facebook: '#',
        instagram: '#',
        whatsapp: '#',
    };
    if (socialLinksData) {
        socialLinksData.forEach(link => {
            const name = link.name.toLowerCase();
            if (name === 'تويتر' || name === 'twitter') links.twitter = link.value;
            if (name === 'لينكدإن' || name === 'linkedin') links.linkedin = link.value;
            if (name === 'فيسبوك' || name === 'facebook') links.facebook = link.value;
            if (name === 'instagram') links.instagram = link.value;
            if (name === 'واتساب' || name === 'whatsapp') links.whatsapp = link.value;
        });
    }
    return links;
  }, [socialLinksData]);


  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <h4 className="text-white text-3xl font-black mb-4 italic tracking-tighter">{branding.name}</h4>
            <p className="text-sm leading-relaxed opacity-60">
              المنصة المهنية الأولى للصيادلة. رؤية تعليمية وبرمجية متكاملة لخدمة المجتمع الطبي.
            </p>
            <div className="flex gap-4 mt-6">
              <Link href={socialLinksMap.twitter} target="_blank" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </Link>
              <Link href={socialLinksMap.linkedin} target="_blank" className="text-slate-400 hover:text-white transition-colors">
                <Linkedin className="w-6 h-6" />
              </Link>
              <Link href={socialLinksMap.facebook} target="_blank" className="text-slate-400 hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </Link>
               <Link href={socialLinksMap.instagram} target="_blank" className="text-slate-400 hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </Link>
              <Link href={socialLinksMap.whatsapp} target="_blank" className="text-slate-400 hover:text-white transition-colors">
                <MessageCircle className="w-6 h-6" />
              </Link>
            </div>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div className="space-y-3">
              <h5 className="text-white font-bold uppercase tracking-widest text-[10px] opacity-40">المنصة</h5>
              <p><Link href="/about" className="hover:text-primary transition-colors">من نحن</Link></p>
              <p><Link href="/courses" className="hover:text-primary transition-colors">الكورسات</Link></p>
              <p><Link href="/articles" className="hover:text-primary transition-colors">المقالات</Link></p>
              <p><Link href="/jobs" className="hover:text-primary transition-colors">الوظائف</Link></p>
              <p><Link href="/consultations" className="hover:text-primary transition-colors">الاستفسارات</Link></p>
            </div>
             <div className="space-y-3">
              <h5 className="text-white font-bold uppercase tracking-widest text-[10px] opacity-40">الدعم</h5>
              <p><Link href="/contact" className="hover:text-primary transition-colors">تواصل معنا</Link></p>
              <p><Link href="/users" className="hover:text-primary transition-colors">المستخدمين</Link></p>
              {isAdmin && <p><Link href="/dashboard" className="hover:text-primary transition-colors">لوحة التحكم</Link></p>}
            </div>
            <div className="space-y-3">
              <h5 className="text-white font-bold uppercase tracking-widest text-[10px] opacity-40">الإشراف والبرمجة</h5>
              <p className="text-white font-bold">د. إيثار كرار</p>
              <p className="text-white font-bold">م. عليش العوض</p>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-medium">
            © {new Date().getFullYear()} جميع الحقوق محفوظة لـ <span className="text-accent font-black italic uppercase">{branding.name}</span>
          </p>
          <div className="flex items-center flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-bold leading-none">
            <p className="border-r border-slate-700 pr-6">بإشراف: <span className="text-white">د. إيثار كرار</span></p>
            <p>الملكية الفكرية والبرمجية: <span className="text-primary">م. عليش العوض</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
