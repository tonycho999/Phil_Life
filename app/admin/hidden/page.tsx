"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Eye, RotateCcw, Trash2, AlertCircle } from "lucide-react";

export default function HiddenPostsPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHiddenPosts = async () => {
    setLoading(true);

    // ★ 일반 게시판 불러오는 코드와 완전히 똑같습니다.
    // 조건만 eq("is_hidden", true)로 바꿨습니다.
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(nickname)")
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
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500 font-bold">{post.category_main}</td>
                  <td className="px-6 py-4 font-medium">{post.title}</td>
                  <td className="px-6 py-4">{post.profiles?.nickname || "알수없음"}</td>
                  <td className="px-6 py-4 text-gray-400">{new Date(post.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleRestore(post.id)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded font-bold">복구</button>
                    <button onClick={() => handleDelete(post.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded font-bold">삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
