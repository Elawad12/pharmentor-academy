import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider } from '@/firebase/provider';

export const metadata: Metadata = {
  title: 'PharMentor - المنصة المتكاملة للصيادلة',
  description: 'البيئة الرقمية الأولى المتكاملة لدعم الصيادلة والطلاب. من التدريب والامتياز إلى التوظيف والبورد.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased text-slate-800 dark:text-slate-200">
          <FirebaseProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster />
          </FirebaseProvider>
      </body>
    </html>
  );
}
