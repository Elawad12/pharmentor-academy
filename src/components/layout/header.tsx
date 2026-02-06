'use client';

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useFirebase } from "@/firebase/provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { LogOut, User, ShieldCheck, Menu, LayoutDashboard } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "../ui/skeleton";

export function Header() {
  const { user, loading, signOut } = useFirebase();
  const { branding } = useBranding();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const isAdmin = user?.role === "مدير النظام" || user?.role === "مشرف النظام";

  const handleLogout = async () => {
    await signOut();
  };

  const navLinks = [
      { href: "/", label: "الرئيسية" },
      { href: "/about", label: "من نحن" },
      { href: "/courses", label: "الكورسات" },
      { href: "/jobs", label: "الوظائف" },
      { href: "/articles", label: "المقالات" },
      { href: "/consultations", label: "الاستفسارات" },
  ];
  
  const adminLinks = [
      { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard, className: "text-red-600 dark:hover:text-red-500 font-black" },
  ];

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-4">
            <div className="w-12 h-12 hero-gradient rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
              {branding.logoUrl ? (
                <Image src={branding.logoUrl} alt={branding.name} width={40} height={40} className="rounded-lg object-contain" />
              ) : (
                <span className="text-white font-black text-2xl">PM</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{branding.name}</h1>
              <p className="text-[10px] text-accent font-bold uppercase tracking-tighter mt-1 italic">
                Professional Guidance System
              </p>
            </div>
          </Link>
        </div>
        <nav className="hidden lg:flex gap-8 font-bold text-slate-600 dark:text-slate-300">
            {navLinks.map(link => (
                <Link key={link.href} href={link.href} className={cn("hover:text-primary transition-colors")}>
                    {link.label}
                </Link>
            ))}
          {isAdmin && adminLinks.map(link => (
              <Link key={link.href} href={link.href} className={cn("hover:text-primary transition-colors", link.className)}>
                  {link.label}
              </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {loading ? (
             <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-full" />
             </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3">
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-accent font-bold">{user.role}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden">
                    {user.avatar && (
                        <Image
                        src={user.avatar}
                        alt={`Avatar of ${user.name}`}
                        width={40}
                        height={40}
                        />
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="ml-2 h-4 w-4" />
                    ملفي الشخصي
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <ShieldCheck className="ml-2 h-4 w-4" />
                        لوحة التحكم
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="ml-2 h-4 w-4" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
                <Button asChild>
                    <Link href="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/register">إنشاء حساب</Link>
                </Button>
            </div>
          )}
           <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-6">
                      <Link href="/" className="flex items-center gap-4" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="w-12 h-12 hero-gradient rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                           {branding.logoUrl ? (
                              <Image src={branding.logoUrl} alt={branding.name} width={40} height={40} className="rounded-lg object-contain" />
                            ) : (
                              <span className="text-white font-black text-2xl">PM</span>
                            )}
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{branding.name}</h1>
                      </Link>
                    </div>
                    <Separator />
                    <nav className="flex-1 flex flex-col gap-4 p-6 text-lg font-bold">
                        {navLinks.map(link => (
                            <Link key={link.href} href={link.href} className="hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                {link.label}
                            </Link>
                        ))}
                        {isAdmin && adminLinks.map(link => (
                            <Link key={link.href} href={link.href} className={cn("hover:text-primary transition-colors", link.className)} onClick={() => setIsMobileMenuOpen(false)}>
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
        </div>
      </div>
    </header>
  );
}
