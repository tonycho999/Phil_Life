"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation"; // 라우터 추가

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
      // 2. 중복 검사 (★ 중요 수정: maybeSingle 사용)
      const { data: existing, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("nickname", nickname.trim())
        .maybeSingle(); // 데이터가 없으면 null 반환 (에러 안 남)

      if (checkError) throw checkError;

      if (existing) {
        setError("이미 누군가 사용 중인 닉네임입니다 😢");
        setLoading(false);
        return;
      }

      // 3. 저장 (내 정보 업데이트)
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ nickname: nickname.trim() })
        .eq("id", userId);

      if (updateError) throw updateError;

      // 4. 성공 처리
      await onComplete(); // 부모 컴포넌트(Guard)에 알림
      router.refresh();   // 데이터 새로고침
      window.location.reload(); // 확실하게 페이지 리로드해서 에러 방지

    } catch (err: any) {
      console.error(err);
      setError("오류가 발생했습니다: " + (err.message || "알 수 없음"));
    } finally {
      setLoading(false);
    }
  };

  // 엔터키 입력 시 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSubmit();
    }
  };

  return (
    // 배경 (어둡게 처리 & 클릭 막기)
    <div className="fixed inset-0 z- flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* 팝업 박스 */}
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
