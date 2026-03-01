"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function EditPostPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 인증 로딩 중이면 대기
    if (authLoading) return;

    // 2. 비로그인 유저 튕겨내기
    if (!user) {
      alert("로그인이 필요합니다.");
      router.back();
      return;
    }

    const fetchPost = async () => {
      const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !post) {
        alert("글을 불러올 수 없습니다.");
        router.back();
        return;
      }

      // 3. 권한 체크: 작성자 본인 OR 관리자(레벨 10 이상)
      const isAdmin = profile?.grade === "관리자" || (profile?.level || 0) >= 10;
      const isAuthor = user.id === post.author_id;

      if (!isAuthor && !isAdmin) {
        alert("수정 권한이 없습니다.");
        router.back();
        return;
      }

      // 4. 데이터 채우기
      setTitle(post.title);
      setContent(post.content);
      setLoading(false);
    };

    fetchPost();
  }, [params.id, authLoading, user, profile, router]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) return alert("제목과 내용을 모두 입력해주세요.");
    
    // 업데이트 시도
    const { error } = await supabase
      .from("posts")
      .update({ 
        title, 
        content, 
        updated_at: new Date().toISOString() // ★ 여기서 에러가 났던 것임 (이제 DB에 컬럼이 있어서 해결됨)
      })
      .eq("id", params.id);

    if (error) {
      console.error(error);
      alert("수정 실패: " + error.message);
    } else {
      alert("수정되었습니다.");
      router.push(`/post/${params.id}`); // 상세 페이지로 이동
      router.refresh(); // 데이터 갱신
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">글 정보를 불러오는 중입니다...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">게시글 수정</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
        {/* 제목 입력 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">제목</label>
          <input 
            type="text" 
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-blue-500 focus:ring-2 focus:ring-blue-200 transition font-medium"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
          />
        </div>

        {/* 내용 입력 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">내용</label>
          <textarea 
            className="w-full p-4 border border-gray-300 rounded-lg min-h-[400px] focus:outline-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력하세요"
          />
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <button 
            onClick={() => router.back()} 
            className="px-5 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition"
          >
            취소
          </button>
          <button 
            onClick={handleUpdate} 
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            수정완료
          </button>
        </div>
      </div>
    </div>
  );
}
