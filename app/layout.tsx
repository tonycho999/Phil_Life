import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import MainHeader from "@/components/layout/MainHeader";
import NicknameGuard from "@/components/auth/NicknameGuard";
import SidebarLeft from "@/components/layout/SidebarLeft"; // ★ 추가됨
import SidebarRight from "@/components/layout/SidebarRight"; // ★ 추가됨

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
      <body className={`${inter.className} bg-gray-50/30`}>
        <AuthProvider>
          {/* 1. 닉네임 감시자 */}
          <NicknameGuard />
          
          {/* 2. 메인 헤더 (상단 고정) */}
          <MainHeader />
          
          {/* 3. 5단 Grid 레이아웃 (여백광고 - 좌 - 중앙 - 우 - 여백광고) */}
          <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_220px_minmax(auto,800px)_220px_1fr] gap-6 pt-6 px-4 lg:px-0 min-h-screen">
            
            {/* 첫 번째 칸: 좌측 여백 광고 (모바일 숨김) */}
            <div className="hidden lg:block">
              {/* 나중에 이곳에 왼쪽 배너 광고 코드를 넣으세요 */}
            </div>

            {/* 두 번째 칸: 좌측 사이드바 */}
            <aside className="hidden md:block">
              <SidebarLeft />
            </aside>

            {/* 세 번째 칸 (Center): 메인 컨텐츠 (page.tsx 내용이 여기로 들어옵니다) */}
            <main className="w-full">
              {children}
            </main>

            {/* 네 번째 칸: 우측 사이드바 */}
            <aside className="hidden md:block">
              <SidebarRight />
            </aside>

            {/* 다섯 번째 칸: 우측 여백 광고 (모바일 숨김) */}
            <div className="hidden lg:block">
              {/* 나중에 이곳에 오른쪽 배너 광고 코드를 넣으세요 */}
            </div>

          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
