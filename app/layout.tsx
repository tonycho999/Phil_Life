// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PHIL-INFO | 필리핀 정보 커뮤니티",
  description: "필리핀 교민과 여행객을 위한 정보 공유 사이트",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-100 text-gray-800`}>
        {/* 상단 정보 띠 */}
        <div className="bg-gray-50 border-b border-gray-200 py-1 text-xs text-center text-gray-500">
          <span className="mr-4 text-red-600 font-bold">$1 = 56.5 PHP</span>
          <span className="text-blue-600 font-bold">1 PHP = 23.8 KRW</span>
        </div>
        
        <Header />
        
        {/* 메인 콘텐츠 영역 */}
        {children}
      </body>
    </html>
  );
}
