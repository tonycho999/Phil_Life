"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { MENUS } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminPage() {
  const supabase = createClient();
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 관리자 권한 체크 (level 10 이상)
  useEffect(() => {
    if (!authLoading) {
      if (!user || (profile?.level || 0) < 10) {
        alert("관리자만 접근 가능합니다.");
        router.push("/");
      } else {
        fetchBoards();
      }
    }
  }, [user, profile, authLoading, router]);

  // 게시판 목록 불러오기
  const fetchBoards = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .order("category_main");
    
    if (data) setBoards(data);
    setLoading(false);
  };

  // 설정 저장 함수
  const handleUpdate = async (id: string, field: "read_level" | "write_level" | "comment_level", value: string) => {
    const numValue = Number(value);
    
    // UI 즉시 반영 (낙관적 업데이트)
    setBoards(prev => prev.map(b => b.id === id ? { ...b, [field]: numValue } : b));

    const { error } = await supabase
      .from("boards")
      .update({ [field]: numValue })
      .eq("id", id);

    if (error) {
      alert("저장 실패: " + error.message);
      fetchBoards(); // 실패 시 되돌리기
    }
  };

  // DB 초기화 (MENUS 상수 -> DB 동기화)
  const initializeBoards = async () => {
    if (!confirm("상수 파일(MENUS) 기준으로 DB를 동기화하시겠습니까?\n(없는 게시판은 생성됩니다)")) return;

    for (const menu of MENUS) {
      for (const sub of menu.sub) {
        const { data } = await supabase
          .from("boards")
          .select("id")
          .eq("category_main", menu.id)
          .eq("category_sub", sub.id)
          .single();
        
        if (!data) {
          await supabase.from("boards").insert({
            category_main: menu.id,
            category_sub: sub.id,
            name: sub.label,
            read_level: 0,      // 읽기 (누구나)
            write_level: 1,     // 글쓰기 (회원)
            comment_level: 1    // 댓글 (회원) - 추가됨
          });
        }
      }
    }
    await fetchBoards();
    alert("동기화 완료");
  };

  if (authLoading || loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">⚙️ 게시판 권한 관리</h1>
        <button 
          onClick={initializeBoards}
          className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition"
        >
          🔄 DB 동기화 (초기화)
        </button>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase font-bold">
            <tr>
              <th className="px-4 py-3">카테고리</th>
              <th className="px-4 py-3">게시판 이름</th>
              <th className="px-4 py-3 text-center">읽기 등급</th>
              <th className="px-4 py-3 text-center">글쓰기 등급</th>
              <th className="px-4 py-3 text-center">댓글 등급</th> {/* 추가됨 */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {boards.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  데이터가 없습니다. 우측 상단 [DB 동기화] 버튼을 눌러주세요.
                </td>
              </tr>
            ) : (
              boards.map((board) => {
                const mainLabel = MENUS.find((m:any) => m.id === board.category_main)?.label || board.category_main;

                return (
                  <tr key={board.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4 font-bold text-gray-800">
                      {mainLabel}
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900">{board.name}</span>
                      <span className="text-xs text-gray-400 block mt-0.5">{board.category_sub}</span>
                    </td>
                    
                    {/* 읽기 권한 */}
                    <td className="px-4 py-4 text-center">
                      <select
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-blue-500"
                        value={board.read_level}
                        onChange={(e) => handleUpdate(board.id, "read_level", e.target.value)}
                      >
                        <option value="0">0 (손님)</option>
                        <option value="1">1 (일반)</option>
                        <option value="5">5 (우수)</option>
                        <option value="10">10 (관리자)</option>
                      </select>
                    </td>

                    {/* 글쓰기 권한 */}
                    <td className="px-4 py-4 text-center">
                      <select
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-blue-500"
                        value={board.write_level}
                        onChange={(e) => handleUpdate(board.id, "write_level", e.target.value)}
                      >
                         <option value="0">0 (손님)</option>
                        <option value="1">1 (일반)</option>
                        <option value="5">5 (우수)</option>
                        <option value="10">10 (관리자)</option>
                      </select>
                    </td>

                    {/* ★ 댓글 쓰기 권한 (추가됨) */}
                    <td className="px-4 py-4 text-center">
                      <select
                        className="border border-gray-300 rounded px-2 py-1 focus:outline-blue-500"
                        value={board.comment_level ?? 1} // 기본값 1
                        onChange={(e) => handleUpdate(board.id, "comment_level", e.target.value)}
                      >
                         <option value="0">0 (손님)</option>
                        <option value="1">1 (일반)</option>
                        <option value="5">5 (우수)</option>
                        <option value="10">10 (관리자)</option>
                      </select>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
