"use client"; // 현재 URL을 읽어오려면 클라이언트 컴포넌트여야 합니다.

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function AdBannerTop() {
  const pathname = usePathname();

  // =========================================================================
  // 🎨 [1] 사용할 광고 배너들을 미리 만들어 둡니다. (디자인/링크 수정은 여기서!)
  // =========================================================================
  
  // 1️⃣ 쇼피(Shopee) 메인 제휴 배너 (찌그러짐 방지 사이즈 완벽 고정)
  const shopeeBanner = (
    <a 
      href="https://invl.me/clnd1iv" 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full h-[90px] mb-6 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-orange-600 bg-gradient-to-r from-orange-500 to-red-500 shrink-0"
    >
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex flex-col justify-center text-white min-w-0 h-full">
          <span className="text-xs md:text-sm font-bold text-orange-200 mb-0.5 animate-pulse">
            🛒 필리핀 교민 쇼핑 필수 코스
          </span>
          <h3 className="text-base md:text-xl font-black tracking-tight truncate">
            쇼피(Shopee) 오늘만 이 가격, 타임세일 즉시 확인!
          </h3>
          <p className="text-xs md:text-sm text-white/90 mt-0.5 hidden md:block truncate">
            생필품 초특가 할인을 놓치지 마세요 👉
          </p>
        </div>
        <div className="shrink-0 bg-white text-red-500 font-black px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm md:text-base whitespace-nowrap shadow-inner hover:bg-gray-50 transition ml-4">
          할인받기 〉
        </div>
      </div>
    </a>
  );

  // 2️⃣ 나중에 추가할 다른 광고 배너 예시 (예: 아고다, 트래블로카 등)
  const tempTravelBanner = (
    <div className="w-full h-[90px] mb-6 rounded-lg flex items-center justify-center font-bold border border-blue-200 shadow-sm bg-blue-100 text-blue-800 shrink-0">
      <span>✈️ 여행 게시판 전용 배너가 들어올 자리입니다 (800x90)</span>
    </div>
  );


  // =========================================================================
  // 🎯 [2] 게시판별로 어떤 배너를 띄울지 매칭해 줍니다. (나중에 여기서 수정!)
  // =========================================================================
  const adData: any = {
    main: shopeeBanner,      // 홈 메인화면
    news: shopeeBanner,      // 뉴스/이슈 게시판
    info: shopeeBanner,      // 정보/팁 게시판
    community: shopeeBanner, // 커뮤니티 게시판
    travel: shopeeBanner,    // 여행 게시판 (나중에 tempTravelBanner로 바꾸면 끝!)
    default: shopeeBanner,   // 그 외 모든 페이지
  };


  // =========================================================================
  // 🚀 [3] 현재 접속한 주소를 분석해서 알맞은 배너를 화면에 출력합니다.
  // =========================================================================
  let currentAd = adData.default;
  
  if (pathname === "/") {
    currentAd = adData.main;
  } else if (pathname.startsWith("/news")) {
    currentAd = adData.news;
  } else if (pathname.startsWith("/info")) {
    currentAd = adData.info;
  } else if (pathname.startsWith("/community")) {
    currentAd = adData.community;
  } else if (pathname.startsWith("/travel")) {
    currentAd = adData.travel;
  }

  // 매칭된 배너를 화면에 그대로 렌더링!
  return currentAd;
}
