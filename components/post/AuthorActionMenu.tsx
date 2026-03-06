"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Send } from "lucide-react";
// ★ 추가됨: 방금 전 만든 모달 컴포넌트 불러오기
import SendMessageModal from "@/components/message/SendMessageModal"; 

export default function AuthorActionMenu({ authorId, nickname, badge }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태 관리
  const menuRef = useRef<HTMLDivElement>(null);

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

        {isOpen && (
          <div className="absolute left-0 mt-1 w-44 bg-white border border-gray-200 shadow-lg rounded-lg z-50 py-1 overflow-hidden">
            <Link 
              href={`/search?author=${authorId}`} 
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
              onClick={() => setIsOpen(false)}
            >
              <Search size={14} />
              해당 아이디 작성 글
            </Link>
            <button 
              onClick={() => {
                setIsOpen(false);
                setIsModalOpen(true); // ★ 클릭 시 모달 열기
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
            >
              <Send size={14} />
              메세지 보내기
            </button>
          </div>
        )}
      </div>

      {/* ★ 모달 컴포넌트 실제 렌더링 영역 */}
      <SendMessageModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        receiverId={authorId} 
        receiverNickname={nickname} 
      />
    </>
  );
}
