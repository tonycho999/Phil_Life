"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Eye, RotateCcw, Trash2, AlertCircle, AlertTriangle } from "lucide-react";

export default function HiddenPostsPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debugMsg, setDebugMsg] = useState("");

  // 숨긴 글 목록 불러오기
  const fetchHiddenPosts = async () => {
    setLoading(true);
    setDebugMsg("");

    // ★ [핵심 수정] profiles(nickname) 연결을 제거했습니다.
    // 작성자 정보 조회 권한 문제로 글까지 안 보이는 문제를 원천 차단합니다.
    const { data, error } = await supabase
      .from("posts")
      .select("*") 
      .eq("is_hidden", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("에러 발생:", error);
      setDebugMsg(error.message);
    } else {
      console.log("가져온 데이터:", data); // F12 콘솔에서 데이터 확인 가능
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHiddenPosts();
  }, []);

  // 1. 복구 (숨김 해제)
  const handleRestore = async (id: string) => {
    if (!confirm("이 글을 복구하시겠습니까?")) return;
    
    const { error } = await supabase
        .from("posts")
        .update({ is_hidden: false })
        .eq("id", id);

    if (error) alert("복구 실패: " + error.message);
    else fetchHiddenPosts(); 
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
      
      {/* 디버그용 메시지 창 (문제 해결 후 삭제 가능) */}
      {debugMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex items-center gap-2">
            <AlertTriangle size={20}/> 
            <span>에러 코드: {debugMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">데이터 조회 중...</div>
        ) : posts.length === 0 ? (
          <div className="p-10 text-center text-gray-500 flex flex-col items-center gap-2">
            <AlertCircle size={40} className="text-gray-300" />
            <p>숨김 처리된 게시글이 없습니다.</p>
            <p className="text-xs text-red-400 mt-2">
                (DB에는 있는데 안 보인다면, RLS 정책 문제입니다. <br/>
                SQL Editor에서 `posts` 테이블 SELECT 정책을 확인하세요.)
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-3">게시판</th>
                <th className="px-6 py-3">제목</th>
                <th className="px-6 py-3">작성자ID</th>
                <th className="px-6 py-3">작성일</th>
                <th className="px-6 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500 font-bold">
                    {post.category_sub || "-"}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    <span className="line-clamp-1">{post.title}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400 font-mono">
                    {/* 닉네임 대신 ID 앞부분만 보여줌 (에러 방지용) */}
                    {post.author_id ? post.author_id.substring(0, 8) + "..." : "알수없음"}
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
