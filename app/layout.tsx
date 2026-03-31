import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import MainHeader from "@/components/layout/MainHeader";
import NicknameGuard from "@/components/auth/NicknameGuard";
import SidebarLeft from "@/components/layout/SidebarLeft";
import SidebarRight from "@/components/layout/SidebarRight";
import AdBannerLeft from "@/components/layout/AdBannerLeft";
import AdBannerRight from "@/components/layout/AdBannerRight";
import AdBannerTop from "@/components/layout/AdBannerTop";
import MobileAdSlider from "@/components/layout/MobileAdSlider";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://phcafe24.com"),
  title: "필카페24 | 필리핀 실시간 교민·여행·비즈니스 1위 커뮤니티",
  description: "24시간 깨어있는 필리핀 정보, 필카페24! 마닐라, 세부 실시간 뉴스, 벼룩시장, 구인구직, 비자 및 법률 상담까지. 필리핀 생활의 모든 해답을 필카페24에서 확인하세요.",
  icons: {
    icon: "/images/favicon.png", 
  },
  keywords: ["필카페24", "필리핀 커뮤니티", "필리핀 교민", "필리핀", "마닐라", "세부", "보라카이", "보홀", "바기오", "클락", "앙헬레스", "마닐라 뉴스", "필리핀 여행 정보", "필리핀 구인구직", "필리핀 부동산", "PhCafe24"],
  alternates: {
    canonical: "https://phcafe24.com/",
  },
  openGraph: {
    type: "website",
    siteName: "필카페24 (PhCafe24)",
    title: "필카페24 - 필리핀 실시간 정보와 소통의 장",
    description: "필리핀 교민생활, 여행, 비즈니스의 모든 것. 지금 필카페24에서 시작하세요.",
    url: "https://phcafe24.com/",
    images: [
      {
        url: "https://phcafe24.com/images/og-image.png", 
        width: 1200,
        height: 630,
        alt: "필카페24 대표 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "필카페24 | PhCafe24",
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
  verification: {
    other: {
      "naver-site-verification": ["825d6400ab14e5040b27673f52b7a05a9c77998e"],
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
          <NicknameGuard />
          <MainHeader />
          
          {/* ★ 핵심 수정: 오류를 내던 Grid를 완전히 버리고, 절대 찌그러지지 않는 Flexbox 5단 레이아웃으로 교체했습니다! */}
          <div className="w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:justify-center lg:items-start gap-6 pt-6 px-4 lg:px-0 min-h-screen overflow-x-hidden">
            
            {/* 1. 좌측 날개 배너 (남는 공간을 유연하게 채움) */}
            <div className="hidden lg:block flex-1 min-w-[50px] max-w-[250px]">
              <AdBannerLeft />
            </div>

            {/* 2. 좌측 사이드바 (220px 단단하게 고정) */}
            <aside className="hidden lg:block w-[220px] shrink-0">
              <SidebarLeft />
            </aside>

            {/* 3. 메인 컨텐츠 (800px로 완벽 고정, 브라우저가 절대 줄이지 못함) */}
            <main className="w-full lg:w-[800px] shrink-0 min-w-0">
              <AdBannerTop />
              <MobileAdSlider />
              {children}
            </main>

            {/* 4. 우측 사이드바 (220px 단단하게 고정) */}
            <aside className="hidden lg:block w-[220px] shrink-0">
              <SidebarRight />
            </aside>

            {/* 5. 우측 날개 배너 (남는 공간을 유연하게 채움) */}
            <div className="hidden lg:block flex-1 min-w-[50px] max-w-[250px]">
              <AdBannerRight />
            </div>

          </div>

          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
