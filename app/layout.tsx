import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import MainHeader from "@/components/layout/MainHeader";
import NicknameGuard from "@/components/auth/NicknameGuard";
import SidebarLeft from "@/components/layout/SidebarLeft";
import SidebarRight from "@/components/layout/SidebarRight";
// ★ 방금 만든 2개의 광고 컴포넌트를 불러옵니다.
import AdBannerLeft from "@/components/layout/AdBannerLeft";
import AdBannerRight from "@/components/layout/AdBannerRight";
// ★ 추가된 부분: 상단 배너 컴포넌트를 불러옵니다.
import AdBannerTop from "@/components/layout/AdBannerTop";
// ★ 추가된 부분: 모바일 롤링 배너 컴포넌트를 불러옵니다.
import MobileAdSlider from "@/components/layout/MobileAdSlider";

const inter = Inter({ subsets: ["latin"] });

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
          
          {/* 3. 5단 Grid 레이아웃 (좌측광고 - 좌 - 중앙 - 우 - 우측광고) */}
          <div className="w-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_220px_minmax(auto,800px)_220px_1fr] gap-6 pt-6 px-4 lg:px-0 min-h-screen">
            
            {/* 첫 번째 칸: 좌측 날개 배너 */}
            <AdBannerLeft />

            {/* 두 번째 칸: 좌측 사이드바 */}
            <aside className="hidden md:block">
              <SidebarLeft />
            </aside>

            {/* 세 번째 칸 (Center): 메인 컨텐츠 */}
            <main className="w-full">
              {/* ★ 추가된 부분: 실시간 인기 게시글(children) 바로 위에 상단 배너 추가 */}
              <AdBannerTop />
              {/* ★ 추가됨: 모바일에서만 보이는 3초 간격 2열 광고 슬라이더 */}
              <MobileAdSlider />
              {children}
            </main>

            {/* 네 번째 칸: 우측 사이드바 */}
            <aside className="hidden md:block">
              <SidebarRight />
            </aside>

            {/* 다섯 번째 칸: 우측 날개 배너 */}
            <AdBannerRight />

          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
