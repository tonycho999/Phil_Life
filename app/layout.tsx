import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import TopInfoBar from "@/components/widget/TopInfoBar";
import { AuthProvider } from "@/components/auth/AuthProvider"; // ★ 추가

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Phil Life | 필리핀 교민 생활 정보",
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
        {/* ★ AuthProvider로 전체를 감싸줍니다 */}
        <AuthProvider>
          <TopInfoBar />
          <Header />
          <main className="flex-1 w-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
