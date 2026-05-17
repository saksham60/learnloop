import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/toast";
import { APP_NAME } from "@/lib/constants";
import { QueryProvider } from "@/providers/QueryProvider";
import { SupabaseProvider } from "@/providers/SupabaseProvider";
import "@/styles/globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: `${APP_NAME} helps learners think, practice, and grow through guided learning.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${display.variable} font-sans`}>
        <QueryProvider>
          <SupabaseProvider>
            {children}
            <Toaster />
          </SupabaseProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
