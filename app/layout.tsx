import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from './providers/ThemeProvider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MyPlanning App',
  description: 'Aplicación para organizar tus tareas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}