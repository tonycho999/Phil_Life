"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function AdBannerTop() {
  const pathname = usePathname();

  // ★ 핵심 수정: 서버 빌드 시 pathname이 null이라서 터지는 현상 완벽 방어!
  if (!pathname) return null;

  // =========================================================================
  // 🎨 [1] 사용할 광고 배너들을 미리 만들어 둡니다.
  // =========================================================================
  const shopeeBanner = (
    <a 
      href="https://invl.me/clnd1iv" 
      target="_blank" 
      rel="noopener noreferrer"
      className="block w-full min-w-full h-[90px] mb-6 rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-orange-600 bg-gradient-to-r from-orange-500 to-red-500 shrink-0"
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
            무료배송 바우처 & 생필품 초특가 할인을 놓치지 마세요 👉
          </p>
        </div>
        <div className="shrink-0 bg-white text-red-500 font-black px-4 py-2 md:px-5 md:py-2.5 rounded-full text-sm md:text-base whitespace-nowrap shadow-inner hover:bg-gray-50 transition ml-4">
          할인받기 〉
        </div>
      </div>
    </a>
  );

  // =========================================================================
  // 🎯 [2] 게시판별로 어떤 배너를 띄울지 매칭해 줍니다.
  // =========================================================================
  const adData: any = {
    main: shopeeBanner,      
    news: shopeeBanner,      
    info: shopeeBanner,      
    community: shopeeBanner, 
    travel: shopeeBanner,    
    default: shopeeBanner,   
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

  return currentAd;
}
