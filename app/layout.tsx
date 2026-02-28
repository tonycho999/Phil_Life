import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth/AuthProvider";
// ★ 중요: 이름을 MainHeader로 바꿨으므로 여기서도 MainHeader를 불러옵니다.
import MainHeader from "@/components/layout/MainHeader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Phil Life - 필리핀 생활 정보 커뮤니티",
  description: "필리핀 교민을 위한 뉴스, 정보, 커뮤니티, 부동산, 구인구직 플랫폼",
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
          <div className="min-h-screen bg-gray-50">
            {/* ★ 중요: 여기서 MainHeader 컴포넌트를 사용합니다. */}
            <MainHeader />
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
