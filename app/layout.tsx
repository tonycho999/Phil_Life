import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import MainHeader from "@/components/layout/MainHeader"; // ★ 헤더 컴포넌트 임포트 확인하세요
import NicknameGuard from "@/components/auth/NicknameGuard"; // 닉네임 감시자

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Phil Life",
  description: "필리핀 한인 커뮤니티",
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
          {/* 1. 닉네임 감시자: 닉네임 없으면 흰 화면 덮어씌움 */}
          <NicknameGuard />
          
          {/* 2. 메인 헤더: 이게 있어야 상단 메뉴가 나옵니다 (복구됨) */}
          <MainHeader />
          
          {/* 3. 페이지 내용 */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
