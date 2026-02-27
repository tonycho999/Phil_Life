"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export default function NicknameForm({ userId, onComplete }: { userId: string, onComplete: () => void }) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const handleSubmit = async () => {
    if (!nickname || nickname.length < 2) {
      setError("닉네임은 2글자 이상이어야 합니다.");
      return;
    }
    setLoading(true);
    setError("");

    // 1. 중복 검사
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("nickname", nickname)
      .single();

    if (existing) {
      setError("이미 사용 중인 닉네임입니다.");
      setLoading(false);
      return;
    }

    // 2. 저장
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ nickname })
      .eq("id", userId);

    if (updateError) {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
    } else {
      onComplete(); // 성공 시 콜백 실행
    }
    setLoading(false);
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
      <h3 className="font-bold text-sm text-blue-900 mb-2">👋 환영합니다! 닉네임을 정해주세요.</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="사용할 닉네임 (2~10자)"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          maxLength={10}
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "확인.." : "저장"}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-2 font-medium">⚠️ {error}</p>}
    </div>
  );
}
