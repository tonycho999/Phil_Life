"use client"; // 현재 URL을 읽어오려면 클라이언트 컴포넌트여야 합니다.

import { usePathname } from "next/navigation";
import Link from "next/link";
// import Image from "next/image"; // 나중에 실제 이미지 넣을 때 주석 해제하세요!

export default function AdBannerTop() {
  const pathname = usePathname();

  // 1. 🎯 광고 데이터 관리 (나중에 광고가 들어오면 여기만 수정하시면 됩니다!)
  // 각 카테고리별로 표시할 텍스트나 색상을 다르게 설정해 두었습니다.
  const adData = {
    main: { text: "🔥 메인 홈 스폰서 프리미엄 배너", color: "bg-blue-100 text-blue-800" },
    news: { text: "📰 뉴스/이슈 게시판 전용 배너", color: "bg-green-100 text-green-800" },
    info: { text: "💡 정보/팁 게시판 전용 배너", color: "bg-yellow-100 text-yellow-800" },
    community: { text: "💬 커뮤니티 자유게시판 전용 배너", color: "bg-purple-100 text-purple-800" },
    default: { text: "✨ 필카페24 통합 상단 배너", color: "bg-gray-100 text-gray-800" },
  };

  // 2. 현재 주소(pathname)를 분석해서 어떤 광고를 띄울지 결정합니다.
  let currentAd = adData.default;
  
  if (pathname === "/") {
    currentAd = adData.main; // 메인 홈화면일 때
  } else if (pathname.startsWith("/news")) {
    currentAd = adData.news; // 뉴스 카테고리일 때
  } else if (pathname.startsWith("/info")) {
    currentAd = adData.info; // 정보 카테고리일 때
  } else if (pathname.startsWith("/community")) {
    currentAd = adData.community; // 커뮤니티 카테고리일 때
  }

  // 3. 실제 화면에 그려지는 부분
  return (
    <div className={`w-full h-[90px] mb-6 rounded-lg flex items-center justify-center font-bold border border-gray-200 shadow-sm transition-all ${currentAd.color}`}>
      
      {/* 💡 나중에 실제 광고 이미지로 교체하실 때는 위 div 안의 내용을 지우고 아래처럼 작성하세요!
        <Link href="광고주사이트URL" target="_blank" className="relative w-full h-full block">
          <Image src="/images/ads/top-banner-news.jpg" alt="광고" fill className="object-cover rounded-lg" />
        </Link>
      */}
      
      <span>
        {currentAd.text} 
        <span className="text-xs font-normal ml-2 text-gray-500">(예: 800x90 사이즈)</span>
      </span>
      
    </div>
  );
}
