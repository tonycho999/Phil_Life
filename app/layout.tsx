import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // ★ 이 파일이 app 폴더 안에 있어야 스타일이 먹힙니다!
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PHIL-INFO | 필리핀 정보 커뮤니티",
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
        {/* ▲ 수정됨: min-h-screen(화면 꽉 채우기), flex-col(세로 정렬) 추가 */}
        
        {/* 상단 정보 띠 */}
        <div className="bg-gray-50 border-b border-gray-200 py-1 text-xs text-center text-gray-500">
          <div className="max-w-7xl mx-auto px-4 flex justify-center gap-4">
             {/* ▲ 수정됨: 중앙 정렬 및 간격 조정 */}
            <span className="text-red-600 font-bold">$1 = 56.5 PHP</span>
            <span className="text-blue-600 font-bold">1 PHP = 23.8 KRW</span>
          </div>
        </div>
        
        <Header />
        
        {/* 메인 콘텐츠 영역 */}
        {/* ▲ 수정됨: main 태그로 감싸서 레이아웃 안정화 */}
        <main className="flex-1 w-full">
          {children}
        </main>
        
      </body>
    </html>
  );
}
