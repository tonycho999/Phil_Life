"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Eye, RotateCcw, Trash2, AlertCircle } from "lucide-react";

// ★ 최신 0~10레벨, S등급(99), M(10레벨) 색상 함수 추가
function getLevelBadgeInfo(level: any) {
  const strLevel = String(level);
  if (strLevel === "10") return { label: "M", style: "bg-gray-800 text-white border-gray-900" }; 
  if (strLevel === "S" || strLevel === "99") return { label: "S", style: "bg-yellow-100 text-yellow-700 border-yellow-300" };
  
  if (strLevel === "0") return { label: "Lv.0", style: "bg-gray-100 text-gray-500 border-gray-200" };
  if (strLevel === "1") return { label: "Lv.1", style: "bg-green-100 text-green-700 border-green-200" };
  if (strLevel === "2") return { label: "Lv.2", style: "bg-blue-100 text-blue-700 border-blue-200" };
  if (strLevel === "3") return { label: "Lv.3", style: "bg-purple-100 text-purple-700 border-purple-200" };
  if (strLevel === "4") return { label: "Lv.4", style: "bg-teal-100 text-teal-700 border-teal-200" };
  if (strLevel === "5") return { label: "Lv.5", style: "bg-pink-100 text-pink-700 border-pink-200" };
  
  return { label: `Lv.${strLevel}`, style: "bg-indigo-100 text-indigo-700 border-indigo-200" };
}

export default function HiddenPostsPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHiddenPosts = async () => {
    setLoading(true);

    // ★ profiles(nickname, level)로 level 값도 같이 가져오도록 수정
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(nickname, level)") 
      .eq("is_hidden", true) // 숨긴 글만 가져와라
      .order("created_at", { ascending: false });

    if (error) {
      console.error("에러:", error);
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHiddenPosts();
  }, []);

  // 1. 복구하기
  const handleRestore = async (id: string) => {
    if (!confirm("복구하시겠습니까?")) return;
    await supabase.from("posts").update({ is_hidden: false }).eq("id", id);
    fetchHiddenPosts(); 
  };

  // 2. 삭제하기
  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("posts").delete().eq("id", id);
    fetchHiddenPosts();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Eye size={24}/> 숨김 게시글 관리
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">로딩 중...</div>
        ) : posts.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <AlertCircle size={40} className="mx-auto mb-2 text-gray-300" />
            <p>숨김 글이 없거나, 권한 문제로 안 보입니다.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
              <tr>
                <th className="px-6 py-3">게시판</th>
                <th className="px-6 py-3">제목</th>
                <th className="px-6 py-3">작성자</th>
                <th className="px-6 py-3">날짜</th>
                <th className="px-6 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => {
                // ★ 작성자 레벨 뱃지 가져오기
                const userLevel = post.profiles?.level ?? 1;
                const badge = getLevelBadgeInfo(userLevel);

                return (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500 font-bold">{post.category_main}</td>
                    <td className="px-6 py-4 font-medium">{post.title}</td>
                    <td className="px-6 py-4">
                      {/* ★ 작성자 이름 옆에 뱃지 표시 */}
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${badge.style}`}>
                          {badge.label}
                        </span>
                        <span>{post.profiles?.nickname || "알수없음"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{new Date(post.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => handleRestore(post.id)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded font-bold hover:bg-blue-100">복구</button>
                      <button onClick={() => handleDelete(post.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded font-bold hover:bg-red-100">삭제</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
