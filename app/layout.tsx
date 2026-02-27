import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import TopInfoBar from "@/components/widget/TopInfoBar"; // <-- 임포트 추가

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Phil Life | 필리핀 교민 생활 정보", // <-- 제목 변경
  description: "필리핀 교민과 여행객을 위한 정보 공유 사이트",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-gray-100 text-gray-800 min-h-screen flex flex-col`}>
        
        {/* 상단 실시간 정보 띠 (교체됨) */}
        <TopInfoBar />
        
        <Header />
        
        <main className="flex-1 w-full">
          {children}
        </main>
        
      </body>
    </html>
  );
}
