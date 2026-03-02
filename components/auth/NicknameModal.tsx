"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function NicknameModal({ userId, onComplete }: { userId: string, onComplete: () => void }) {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async () => {
    // 1. 유효성 검사
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

    try {
      // 2. 중복 검사
      const { data: existing, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("nickname", nickname.trim())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        setError("이미 누군가 사용 중인 닉네임입니다 😢");
        setLoading(false);
        return;
      }

      // 3. 저장
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ nickname: nickname.trim() })
        .eq("id", userId);

      if (updateError) throw updateError;

      // 4. 성공 처리
      await onComplete(); 
      router.refresh();   
      window.location.reload(); 

    } catch (err: any) {
      console.error(err);
      setError("오류가 발생했습니다: " + (err.message || "알 수 없음"));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSubmit();
    }
  };

  return (
    // ★ 수정됨: bg-black/70 -> bg-black/40 (배경이 은은하게 비치도록 변경)
    <div className="fixed inset-0 z- flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      
      {/* 팝업 박스 디자인 */}
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-[90%] max-w-sm border border-gray-100 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4">
            👋
          </div>
          <h2 className="text-2xl font-bold text-gray-800">환영합니다!</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            커뮤니티 활동을 위해<br/>멋진 닉네임을 정해주세요.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="한글/영문 2~10자"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center font-bold text-gray-800 placeholder:font-normal"
                maxLength={10}
                autoFocus
            />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:bg-gray-400 disabled:shadow-none active:scale-[0.98]"
          >
            {loading ? "저장 중..." : "시작하기"}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-500 text-xs font-bold text-center rounded-lg animate-in slide-in-from-top-1">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
}
