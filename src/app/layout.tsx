import type { Metadata } from "next";
import { Geist } from "next/font/google";
import './globals.css';
import { ClientLayout } from "./client-layout";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Outfit - 智能旅行穿搭助手",
  description: "AI 驅動的旅行穿搭建議，為您的旅程打造完美造型",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={geist.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
