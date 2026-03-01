"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import { Eye, RotateCcw, Trash2, AlertCircle } from "lucide-react";

export default function HiddenPostsPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 숨김 글 목록 불러오기
  const fetchHiddenPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(nickname)")
      .eq("is_hidden", true) // ★ 숨겨진 글만 조회
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchHiddenPosts();
  }, []);

  // 1. 복구 (숨김 해제)
  const handleRestore = async (id: string) => {
    if (!confirm("이 글을 복구하시겠습니까? 게시판에 다시 보입니다.")) return;
    await supabase.from("posts").update({ is_hidden: false }).eq("id", id);
    fetchHiddenPosts(); // 목록 갱신
  };

  // 2. 영구 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 영구 삭제하시겠습니까? 복구 불가능합니다.")) return;
    await supabase.from("posts").delete().eq("id", id);
    fetchHiddenPosts();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <Eye size={24} className="text-gray-500" /> 숨김 게시글 관리 (휴지통)
      </h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">로딩 중...</div>
        ) : posts.length === 0 ? (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center gap-2">
            <AlertCircle size={40} className="text-gray-300" />
            <p>숨김 처리된 게시글이 없습니다.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">게시판</th>
                <th className="px-6 py-3">제목</th>
                <th className="px-6 py-3">작성자</th>
                <th className="px-6 py-3">작성일</th>
                <th className="px-6 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500 font-bold">
                    {post.category_sub}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    <Link href={`/post/${post.id}`} className="hover:underline hover:text-blue-600">
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{post.profiles?.nickname}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleRestore(post.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-bold transition"
                    >
                      <RotateCcw size={14} /> 복구
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 font-bold transition"
                    >
                      <Trash2 size={14} /> 삭제
                    </button>
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
