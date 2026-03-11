"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { createPortal } from "react-dom";

interface Props {
  userId: string;
  onComplete: () => void;
}

export default function NicknameModal({ userId, onComplete }: Props) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  // 모달이 떴을 때 뒤에 스크롤 막기 (배경 고정)
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async () => {
    if (!nickname.trim() || nickname.length < 2) {
      alert("닉네임은 2글자 이상 입력해주세요.");
      return;
    }
    setLoading(true);

    // 중복 체크
    const { data: exist } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname)
      .single();

    if (exist) {
      alert("이미 사용 중인 닉네임입니다.");
      setLoading(false);
      return;
    }

    // 업데이트
    const { error } = await supabase
      .from("profiles")
      .update({ nickname })
      .eq("id", userId);

    if (error) {
      alert("오류: " + error.message);
    } else {
      alert("환영합니다!");
      onComplete(); // 완료 시 새로고침
    }
    setLoading(false);
  };

  if (!mounted) return null;

  // ★ 진짜 팝업 디자인: 배경은 반투명 검은색(bg-black/60), 내용물은 둥근 하얀 상자(bg-white rounded-2xl)
  return createPortal(
    <div className="fixed inset-0 z- bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      
      {/* 팝업 상자 본체 */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200">
        
        <h1 className="text-2xl font-black text-[#1d4ed8] mb-2 tracking-tighter">필카페24</h1>
        <h2 className="text-lg font-bold text-gray-800 mb-2">닉네임 설정</h2>
        <p className="text-sm text-gray-500 mb-6">
          커뮤니티에서 활동할<br/>멋진 닉네임을 만들어주세요.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="한글/영문 2~10자"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-lg font-bold focus:outline-none focus:border-[#1d4ed8] focus:ring-2 focus:ring-blue-100 transition placeholder:font-normal placeholder:text-gray-300 placeholder:text-sm"
            maxLength={10}
            autoFocus
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#1d4ed8] hover:bg-blue-800 text-white font-bold py-3.5 rounded-lg text-md transition shadow-md disabled:bg-gray-300 flex justify-center items-center"
          >
            {loading ? "저장 중..." : "시작하기"}
          </button>
        </div>
      </div>
      
    </div>,
    document.body
  );
}
