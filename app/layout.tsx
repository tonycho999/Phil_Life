import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import MainHeader from "@/components/layout/MainHeader";
import NicknameGuard from "@/components/auth/NicknameGuard"; // ★ 새로 만든 감시병 컴포넌트

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Phil Life - 필리핀 한인 커뮤니티",
  description: "필리핀 교민들을 위한 정보 공유 및 커뮤니티",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          {/* ★ 닉네임 감시병 배치 (헤더, 사이드바 상관없이 항상 작동) */}
          <NicknameGuard />
          
          <MainHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
