"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // ★ 핵심: 리액트 포털 가져오기
import { createClient } from "@/lib/supabase";

interface Props {
  userId: string;
  onComplete: () => void;
}

export default function NicknameModal({ userId, onComplete }: Props) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false); // ★ 마운트 여부 확인
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    // 모달이 떠있을 때 뒤쪽 스크롤 막기
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

    // 1. 닉네임 중복 체크
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

    // 2. 프로필 업데이트
    const { error } = await supabase
      .from("profiles")
      .update({ nickname })
      .eq("id", userId);

    if (error) {
      alert("오류가 발생했습니다: " + error.message);
    } else {
      alert("환영합니다! 닉네임이 설정되었습니다.");
      onComplete();
    }
    setLoading(false);
  };

  // 서버 사이드 렌더링 중에는 포털을 실행하지 않음
  if (!mounted) return null;

  // ★ 핵심 해결책: createPortal을 사용하여 모달을 document.body로 직접 전송
  // 이렇게 하면 어떤 부모 요소의 방해(z-index, overflow 등)도 받지 않고 무조건 맨 위에 뜹니다.
  return createPortal(
    <div className="fixed inset-0 z- flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-in fade-in zoom-in duration-200">
        
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">닉네임 설정</h2>
          <p className="text-sm text-gray-500 break-keep">
            커뮤니티 활동을 위해<br/>멋진 닉네임을 정해주세요.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="한글/영문 2~10자"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            maxLength={10}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition disabled:bg-gray-400"
          >
            {loading ? "저장 중..." : "시작하기"}
          </button>
        </div>

      </div>
    </div>,
    document.body // 이 부분이 모달을 body 태그 바로 아래로 옮겨줍니다.
  );
}
