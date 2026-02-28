"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { MENUS } from "@/lib/constants";

export default function AdminBoardsPage() {
  const supabase = createClient();
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 게시판 목록 불러오기
  const fetchBoards = async () => {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .order("category_main");
    
    if (data) setBoards(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // 설정 저장 함수
  const handleSave = async (id: string, field: string, value: any) => {
    const { error } = await supabase
      .from("boards")
      .update({ [field]: value })
      .eq("id", id);

    if (error) alert("저장 실패");
    else fetchBoards(); // 새로고침
  };

  // 초기화 (DB에 없는 게시판이 있으면 생성)
  const initializeBoards = async () => {
    if (!confirm("상수 파일(MENUS) 기준으로 DB를 초기화하시겠습니까?")) return;

    for (const menu of MENUS) {
      for (const sub of menu.sub) {
        // 이미 있는지 확인
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
            read_level: 0,
            write_level: 1 // 기본 쓰기 권한 1
          });
        }
      }
    }
    fetchBoards();
    alert("동기화 완료");
  };

  if (loading) return <div className="p-10">로딩 중...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">게시판 권한 관리</h1>
        <button 
          onClick={initializeBoards}
          className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
        >
          DB 동기화 (초기화)
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 uppercase font-bold">
            <tr>
              <th className="px-6 py-3">메인 카테고리</th>
              <th className="px-6 py-3">서브 카테고리</th>
              <th className="px-6 py-3">읽기 등급 (최소)</th>
              <th className="px-6 py-3">쓰기 등급 (최소)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {boards.map((board) => (
              <tr key={board.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-bold text-gray-800">
                  {MENUS.find((m:any) => m.id === board.category_main)?.label || board.category_main}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {board.name} ({board.category_sub})
                </td>
                
                {/* 읽기 등급 설정 */}
                <td className="px-6 py-4">
                  <select 
                    value={board.read_level}
                    onChange={(e) => handleSave(board.id, "read_level", Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="0">0 (손님)</option>
                    <option value="1">1 (일반회원)</option>
                    <option value="5">5 (우수회원)</option>
                    <option value="10">10 (관리자)</option>
                  </select>
                </td>

                {/* 쓰기 등급 설정 */}
                <td className="px-6 py-4">
                  <select 
                    value={board.write_level}
                    onChange={(e) => handleSave(board.id, "write_level", Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="0">0 (손님)</option>
                    <option value="1">1 (일반회원)</option>
                    <option value="5">5 (우수회원)</option>
                    <option value="10">10 (관리자)</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
