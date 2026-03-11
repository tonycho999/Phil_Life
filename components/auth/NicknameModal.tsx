"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface Props {
  userId: string;
  onComplete: () => void;
}

export default function NicknameModal({ userId, onComplete }: Props) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  // 모달이 떴을 때 뒤에 스크롤 막기
  useEffect(() => {
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

  return (
    // ★ 핵심 수정 1: z- 오타를 완전히 지우고, z- 로 상향!
    // 사이트의 그 어떤 요소도 이 VIP 창 위로 올라오지 못합니다.
    <div className="fixed inset-0 z- bg-white flex flex-col items-center justify-center p-4">
      
      <div className="max-w-md w-full text-center animate-in zoom-in duration-300">
        {/* ★ 핵심 수정 2: 로고 타이틀 색상을 더 어두운 로고 블루로 변경 */}
        <h1 className="text-4xl font-black text-blue-800 mb-6 tracking-tighter">필카페24</h1>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">닉네임 설정</h2>
        <p className="text-gray-500 mb-8">
          서비스 이용을 위해<br/>사용하실 닉네임을 입력해주세요.
        </p>

        <div className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="한글/영문 2~10자"
            className="w-full border-b-2 border-gray-300 px-4 py-4 text-center text-xl font-bold focus:outline-none focus:border-blue-600 transition placeholder:font-normal placeholder:text-gray-300"
            maxLength={10}
            autoFocus
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition shadow-lg mt-4 disabled:bg-gray-300"
          >
            {loading ? "저장 중..." : "시작하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
