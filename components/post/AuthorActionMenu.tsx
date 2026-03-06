"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Send } from "lucide-react";

export default function AuthorActionMenu({ authorId, nickname, badge }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 팝업 외부를 클릭하면 닫히게 만드는 마법의 코드
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* 닉네임 버튼 */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 hover:bg-gray-50 px-1 -ml-1 rounded transition cursor-pointer"
      >
        <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${badge.style}`}>
          {badge.label}
        </span>
        <span className="font-bold text-gray-800 hover:text-blue-600 transition">
          {nickname || "알 수 없음"}
        </span>
      </button>

      {/* 팝업 메뉴 */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 shadow-lg rounded-lg z-50 py-1 overflow-hidden">
          {/* 주의: 아래 href 경로는 회원님의 실제 프로젝트 주소에 맞게 수정이 필요할 수 있습니다! */}
          <Link 
            href={`/search?author=${authorId}`} 
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
            onClick={() => setIsOpen(false)}
          >
            <Search size={14} />
            해당 아이디 작성 글
          </Link>
          <Link 
            href={`/message/send?to=${authorId}`} 
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
            onClick={() => setIsOpen(false)}
          >
            <Send size={14} />
            메세지 보내기
          </Link>
        </div>
      )}
    </div>
  );
}
