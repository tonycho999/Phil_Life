"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function NicknameModal({ userId, onComplete }: { userId: string, onComplete: () => void }) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async () => {
    // 유효성 검사
    if (!nickname || nickname.trim().length < 2) {
      setError("닉네임은 2글자 이상이어야 합니다.");
      return;
    }
    if (nickname.length > 10) {
      setError("닉네임은 10글자 이하여야 합니다.");
      return;
    }

    setLoading(true);
    setError("");

    // 1. 중복 검사
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname.trim())
      .single();

    if (existing) {
      setError("이미 누군가 사용 중인 닉네임입니다 😢");
      setLoading(false);
      return;
    }

    // 2. 저장 (내 정보 업데이트)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ nickname: nickname.trim() })
      .eq("id", userId);

    if (updateError) {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } else {
      onComplete(); // 성공 시 모달 닫기(부모 컴포넌트 리로드)
    }
    setLoading(false);
  };

  return (
    // 배경 (어둡게 처리)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      {/* 팝업 박스 */}
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl mb-3">
            👋
          </div>
          <h2 className="text-xl font-bold text-gray-800">환영합니다!</h2>
          <p className="text-sm text-gray-500 mt-1">커뮤니티에서 사용할 닉네임을 정해주세요.</p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="한글/영문 2~10자"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center font-bold text-gray-700"
            maxLength={10}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:bg-gray-400 disabled:shadow-none"
          >
            {loading ? "확인 중..." : "시작하기"}
          </button>
        </div>

        {error && (
          <p className="text-red-500 text-xs text-center mt-3 font-medium bg-red-50 py-2 rounded-lg">
            ⚠️ {error}
          </p>
        )}
      </div>
    </div>
  );
}
