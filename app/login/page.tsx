"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [isLoginTab, setIsLoginTab] = useState(true); // true: 로그인 탭, false: 가입 탭
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. 소셜 로그인 (구글)
  const handleOAuthLogin = async (provider: 'google') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: provider === 'google' ? { access_type: 'offline', prompt: 'consent' } : undefined,
      },
    });
  };

  // 2. 이메일 로그인 & 가입
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 6) {
      alert("이메일과 6자리 이상의 비밀번호를 입력해주세요.");
      return;
    }
    
    setLoading(true);

    if (!isLoginTab) {
      // 회원가입
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert("가입 실패: " + error.message);
      } else {
        alert("가입이 완료되었습니다. 발송된 이메일에서 인증을 완료해 주세요.");
        setIsLoginTab(true); // 가입 성공 시 로그인 탭으로 전환
      }
    } else {
      // 로그인
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert("로그인 실패: 이메일이나 비밀번호를 확인해주세요.");
      } else {
        router.push("/"); // 로그인 성공 시 메인 화면으로 이동
        router.refresh();
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        
        {/* 상단 탭 (로그인 / 회원가입) */}
        <div className="flex border-b border-gray-200 text-center font-bold">
          <button 
            onClick={() => setIsLoginTab(true)}
            className={`flex-1 py-4 transition ${isLoginTab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:bg-gray-50"}`}
          >
            로그인
          </button>
          <button 
            onClick={() => setIsLoginTab(false)}
            className={`flex-1 py-4 transition ${!isLoginTab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400 hover:bg-gray-50"}`}
          >
            회원가입
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            {isLoginTab ? "회원 로그인" : "신규 회원가입"}
          </h2>

          {/* 이메일 폼 */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="email" 
                placeholder="이메일 아이디" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
              <input 
                type="password" 
                placeholder="비밀번호 (6자리 이상)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-800 text-white py-3.5 rounded-lg font-bold hover:bg-gray-900 transition mt-2 shadow-sm"
            >
              {loading ? "처리 중..." : (isLoginTab ? "로그인" : "회원가입 완료")}
            </button>
          </form>

          {/* 구분선 */}
          <div className="relative flex items-center py-4 mb-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold">간편 로그인</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="space-y-3">

            {/* 구글 로그인 */}
            <button 
              onClick={() => handleOAuthLogin('google')}
              className="w-full bg-[#EA4335] text-white py-3.5 rounded-lg font-bold hover:bg-[#D93025] transition flex items-center justify-center gap-2 shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="bg-white rounded-full p-0.5"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              구글로 로그인
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
