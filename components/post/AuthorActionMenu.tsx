"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Send } from "lucide-react";
// ★ 우리가 만든 쪽지 팝업 모달 불러오기
import SendMessageModal from "@/components/message/SendMessageModal"; 

export default function AuthorActionMenu({ authorId, nickname, badge }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // ★ 팝업 열림/닫힘 상태 관리
  const menuRef = useRef<HTMLDivElement>(null);

  // 팝업 외부 클릭 시 닫힘 처리
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
    <>
      <div className="relative inline-block" ref={menuRef}>
        {/* 닉네임 버튼 */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // 부모 링크 클릭 방지
            setIsOpen(!isOpen);
          }}
          className="flex items-center gap-1.5 hover:bg-gray-50 px-1 -ml-1 rounded transition cursor-pointer"
        >
          <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${badge.style}`}>
            {badge.label}
          </span>
          <span className="font-bold text-gray-800 hover:text-blue-600 transition">
            {nickname || "알 수 없음"}
          </span>
        </button>

        {/* 드롭다운 메뉴 */}
        {isOpen && (
          <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 shadow-lg rounded-lg z-50 py-1 overflow-hidden">
            <Link 
              href={`/search?author=${authorId}`} 
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              <Search size={14} />
              해당 아이디 작성 글
            </Link>
            
            {/* ★ 수정됨: <Link> 대신 <button>으로 변경하여 페이지 이동 없이 팝업만 띄웁니다! */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation(); // 클릭 충돌 완벽 방지
                setIsOpen(false);    // 메뉴는 닫고
                setIsModalOpen(true); // 팝업창은 열기!
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <Send size={14} />
              메세지 보내기
            </button>
          </div>
        )}
      </div>

      {/* ★ 실제 화면 중앙에 뜨는 메세지 작성 팝업창 */}
      <SendMessageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        receiverId={authorId} 
        receiverNickname={nickname} 
      />
    </>
  );
}
