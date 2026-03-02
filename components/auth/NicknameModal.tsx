"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

interface Props {
  userId: string;
  onComplete: () => void;
}

export default function NicknameModal({ userId, onComplete }: Props) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

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

  return (
    // ★ 핵심 수정: fixed로 화면 전체를 꽉 채우고(bg-white), 우선순위를 최상(z-)으로 높임
    // 이렇게 하면 뒤에 있는 사이트 내용이 아예 안 보입니다.
    <div className="fixed top-0 left-0 w-full h-full bg-white z- flex items-center justify-center p-4">
      
      <div className="max-w-sm w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-blue-600 mb-4">Phil Life</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">닉네임 설정</h2>
          <p className="text-gray-500">
            서비스 이용을 위해<br/>사용하실 닉네임을 입력해주세요.
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="한글/영문 2~10자"
            className="w-full border-b-2 border-gray-300 px-4 py-4 text-center text-xl focus:outline-none focus:border-blue-600 transition placeholder:text-gray-300"
            maxLength={10}
            autoFocus
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition disabled:bg-gray-400 mt-6"
          >
            {loading ? "저장 중..." : "시작하기"}
          </button>
        </div>
      </div>

    </div>
  );
}
