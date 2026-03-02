"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Eye, RotateCcw, Trash2, AlertCircle } from "lucide-react";

export default function HiddenPostsPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 숨긴 글 목록 불러오기
  const fetchHiddenPosts = async () => {
    setLoading(true);

    // ★ 수정됨: 테이블 직접 조회가 아니라, 방금 만든 '관리자 전용 함수(RPC)'를 호출합니다.
    // 이 방식은 RLS(보안 정책)를 완전히 무시하고 데이터를 가져옵니다.
    const { data, error } = await supabase.rpc("get_hidden_posts_safe");

    if (error) {
      console.error("함수 호출 에러:", error);
      alert("데이터 로딩 실패: " + error.message);
    } else {
      console.log("가져온 숨긴 글:", data); // F12 콘솔에서 확인 가능
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHiddenPosts();
  }, []);

  // 1. 복구 (숨김 해제)
  const handleRestore = async (id: string) => {
    if (!confirm("이 글을 복구하시겠습니까? 게시판에 다시 보입니다.")) return;
    
    // 수정/삭제는 기존 방식대로 해도 본인 글이거나 관리자 정책이 있으면 동작함
    // 만약 이것도 안 되면 update용 rpc도 만들어야 하지만, 일단 조회부터 해결합시다.
    const { error } = await supabase
        .from("posts")
        .update({ is_hidden: false })
        .eq("id", id);

    if (error) alert("복구 실패: " + error.message);
    else fetchHiddenPosts(); // 목록 갱신
  };

  // 2. 영구 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("정말 영구 삭제하시겠습니까?")) return;
    
    const { error } = await supabase
        .from("posts")
        .delete()
        .eq("id", id);

    if (error) alert("삭제 실패: " + error.message);
    else fetchHiddenPosts();
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
                <th className="px-6 py-3">작성일</th>
                <th className="px-6 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500 font-bold">
                    {post.category_main} / {post.category_sub}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    <span className="line-clamp-1">{post.title}</span>
                  </td>
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
