import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import MainHeader from "@/components/layout/MainHeader";
import NicknameGuard from "@/components/auth/NicknameGuard";
import SidebarLeft from "@/components/layout/SidebarLeft"; // ★ 추가됨
import SidebarRight from "@/components/layout/SidebarRight"; // ★ 추가됨

const inter = Inter({ subsets: ["latin"] });

// ★ 기존의 짧았던 메타데이터가 SEO 최적화 메타데이터로 완벽히 교체되었습니다.
export const metadata: Metadata = {
  title: "필카페24 | 필리핀 실시간 교민·여행·비즈니스 1위 커뮤니티",
  description: "24시간 깨어있는 필리핀 정보, 필카페24! 마닐라, 세부 실시간 뉴스, 벼룩시장, 구인구직, 비자 및 법률 상담까지. 필리핀 생활의 모든 해답을 필카페24에서 확인하세요.",
  keywords: ["필카페24", "필리핀 커뮤니티", "필리핀 교민", "마닐라 뉴스", "필리핀 여행 정보", "필리핀 구인구직", "필리핀 부동산", "PhilCafe24"],
  alternates: {
    canonical: "https://www.philcafe24.com/",
  },
  openGraph: {
    type: "website",
    siteName: "필카페24 (PhilCafe24)",
    title: "필카페24 - 필리핀 실시간 정보와 소통의 장",
    description: "필리핀 교민생활, 여행, 비즈니스의 모든 것. 지금 필카페24에서 시작하세요.",
    url: "https://www.philcafe24.com/",
    images: [
      {
        url: "https://www.philcafe24.com/images/og-main.jpg",
        width: 1200,
        height: 630,
        alt: "필카페24 대표 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "필카페24 | PhilCafe24",
    description: "24시간 생생한 필리핀 현지 소식을 전합니다.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
