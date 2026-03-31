"use client"; // 현재 URL을 읽어오려면 클라이언트 컴포넌트여야 합니다.

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function AdBannerTop() {
  const pathname = usePathname();

  // 1. 🎯 메인 홈 화면("/")일 경우: 화려한 쇼피 제휴 배너 렌더링
  if (pathname === "/") {
    return (
      <a 
        href="https://invl.me/clnd1iv" 
        target="_blank" 
        rel="noopener noreferrer"
        className="block w-full bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden border border-orange-600 mb-6"
      >
        <div className="flex items-center justify-between px-6 py-4 md:py-6">
          <div className="flex flex-col text-white">
            <span className="text-xs md:text-sm font-bold text-orange-200 mb-1 animate-pulse">
              🛒 필리핀 교민 쇼핑 필수 코스
            </span>
            <h3 className="text-lg md:text-2xl font-black tracking-tight">
              쇼피(Shopee) 오늘만 이 가격, 타임세일 즉시 확인!
            </h3>
            <p className="text-sm md:text-base text-white/90 mt-1 hidden md:block">
              무료배송 바우처 & 생필품 초특가 할인을 놓치지 마세요 👉
            </p>
          </div>
          <div className="shrink-0 bg-white text-red-500 font-black px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base whitespace-nowrap shadow-inner hover:bg-gray-50 transition">
            할인받기 〉
          </div>
        </div>
      </a>
    );
  }

  // 2. 다른 게시판일 경우: 기존 서브페이지용 배너 데이터
  const adData: any = {
    news: { text: "📰 뉴스/이슈 게시판 전용 배너", color: "bg-green-100 text-green-800" },
    info: { text: "💡 정보/팁 게시판 전용 배너", color: "bg-yellow-100 text-yellow-800" },
    community: { text: "💬 커뮤니티 자유게시판 전용 배너", color: "bg-purple-100 text-purple-800" },
    default: { text: "✨ 필카페24 통합 상단 배너", color: "bg-gray-100 text-gray-800" },
  };

  // 3. 현재 주소(pathname)를 분석해서 어떤 광고를 띄울지 결정
  let currentAd = adData.default;
  
  if (pathname.startsWith("/news")) {
    currentAd = adData.news;
  } else if (pathname.startsWith("/info")) {
    currentAd = adData.info;
  } else if (pathname.startsWith("/community")) {
    currentAd = adData.community;
  }

  // 4. 서브 페이지용 임시 배너 렌더링
  return (
    <div className={`w-full h-[90px] mb-6 rounded-lg flex items-center justify-center font-bold border border-gray-200 shadow-sm transition-all ${currentAd.color}`}>
      <span>
        {currentAd.text} 
        <span className="text-xs font-normal ml-2 text-gray-500">(예: 800x90 사이즈)</span>
      </span>
    </div>
  );
}
