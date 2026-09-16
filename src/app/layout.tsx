import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ROI 시뮬레이터",
  description: "장비 도입 수익성과 투자 회수기간을 상담 현장에서 바로 계산합니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
