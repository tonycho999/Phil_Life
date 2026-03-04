"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
// import Image from "next/image"; // ★ 나중에 실제 이미지 사용할 때 주석 해제하세요!

export default function MobileAdSlider() {
  // 🎯 실제 광고 데이터 세팅 영역
  // 광고주가 생기면 아래 배열에 접속 링크(link)와 이미지 주소(imageUrl)를 채워넣으세요.
  // 배열을 늘리면 알아서 페이지가 계산되어 늘어납니다.
  const ads = [
    { id: 1, link: "#", imageUrl: "", alt: "광고 1" },
    { id: 2, link: "#", imageUrl: "", alt: "광고 2" },
    { id: 3, link: "#", imageUrl: "", alt: "광고 3" },
    { id: 4, link: "#", imageUrl: "", alt: "광고 4" },
  ];

  // 한 화면에 보여줄 광고 개수 (2개씩)
  const itemsPerPage = 2;
  const totalPages = Math.ceil(ads.length / itemsPerPage);
  
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    // 광고가 2개 이하(1페이지)면 롤링을 중지합니다.
    if (totalPages <= 1) return;

    // 3초(3000ms)마다 다음 페이지로 스르륵 넘어갑니다.
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 3000);
    
    return () => clearInterval(timer);
  }, [totalPages]);

  // 등록된 광고가 아예 없으면 이 영역을 통째로 숨깁니다.
  if (!ads || ads.length === 0) return null;

  return (
    <div className="md:hidden w-full mb-6">
      <div className="flex justify-between items-end mb-2 px-1">
        <span className="text-xs font-bold text-gray-400">스폰서 광고</span>
        
        {/* 페이징 동그라미 (광고가 3개 이상일 때만 나타남) */}
        {totalPages > 1 && (
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <div 
                key={idx} 
                className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentPage ? "bg-blue-400 w-3" : "bg-gray-200"}`} 
              />
            ))}
          </div>
        )}
      </div>

      {/* 광고 노출 영역 */}
      <div className="relative w-full h-[100px] overflow-hidden rounded-lg">
        {Array.from({ length: totalPages }).map((_, pageIndex) => (
          <div
            key={pageIndex}
            className={`absolute inset-0 flex gap-3 transition-opacity duration-700 ease-in-out ${
              pageIndex === currentPage ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {ads.slice(pageIndex * itemsPerPage, pageIndex * itemsPerPage + itemsPerPage).map((ad) => (
              // Link 태그로 감싸서 광고를 클릭하면 해당 사이트로 이동하게 합니다.
              <Link 
                key={ad.id} 
                href={ad.link}
                target="_blank" // 새 창으로 열기
                className="flex-1 relative bg-gray-100 border border-gray-200 rounded-lg overflow-hidden flex flex-col items-center justify-center text-gray-400 hover:bg-gray-200 transition"
              >
                {ad.imageUrl ? (
                  // ★ 실제 이미지가 등록되었을 때 보여질 코드
                  // <Image src={ad.imageUrl} alt={ad.alt} fill className="object-cover" />
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${ad.imageUrl})` }}></div>
                ) : (
                  // 이미지가 없을 때 보여질 빈 뼈대 영역
                  <span className="text-xs font-bold text-gray-400">광고 영역<br/>(예: 300x250)</span>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
