"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function EditPostPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      // 게시글 가져오기
      const { data: post, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !post) {
        alert("게시글을 불러올 수 없습니다.");
        router.back();
        return;
      }

      // 본인 확인 (관리자가 아니면 본인만 수정 가능하게 하려면 여기서 체크)
      // 여기서는 일단 본인 체크는 서버(RLS)나 저장 시점에 맡기거나, 
      // 간단히 클라이언트에서 체크합니다.
      
      setTitle(post.title);
      setContent(post.content);
      setLoading(false);
    };

    if (!authLoading) fetchPost();
  }, [params.id, authLoading, router, supabase]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) return alert("내용을 입력해주세요.");
    
    const { error } = await supabase
      .from("posts")
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("id", params.id);

    if (error) {
      alert("수정 실패: " + error.message);
    } else {
      alert("수정되었습니다.");
      router.push(`/post/${params.id}`);
      router.refresh();
    }
  };

  if (loading) return <div className="p-10 text-center">로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">글 수정하기</h1>
      <div className="space-y-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <input 
          type="text" 
          className="w-full p-3 border border-gray-300 rounded text-lg font-bold"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea 
          className="w-full p-4 border rounded min-h-[400px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded">취소</button>
          <button onClick={handleUpdate} className="px-6 py-2 bg-blue-600 text-white font-bold rounded">수정완료</button>
        </div>
      </div>
    </div>
  );
}
