"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function EditPostPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth(); // profile 추가

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.back(); return; }

    const fetchPost = async () => {
      const { data: post } = await supabase.from("posts").select("*").eq("id", params.id).single();
      if (!post) { alert("글이 없습니다."); router.back(); return; }

      // ★ 권한 체크: 작성자 본인 OR 관리자(레벨10 이상)
      const isAdmin = profile?.grade === "관리자" || (profile?.level || 0) >= 10;
      const isAuthor = user.id === post.author_id;

      if (!isAuthor && !isAdmin) {
        alert("수정 권한이 없습니다.");
        router.back();
        return;
      }

      setTitle(post.title);
      setContent(post.content);
      setLoading(false);
    };
    fetchPost();
  }, [params.id, authLoading, user, profile, router]);

  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) return alert("내용을 입력해주세요.");
    
    const { error } = await supabase
      .from("posts")
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq("id", params.id);

    if (error) alert("수정 실패: " + error.message);
    else {
      alert("수정되었습니다.");
      router.push(`/post/${params.id}`);
      router.refresh();
    }
  };

  if (loading) return <div className="p-10 text-center">권한 확인 및 로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">게시글 수정 (관리자 모드 포함)</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
        <input type="text" className="w-full p-3 border rounded font-bold" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full p-4 border rounded min-h-[400px]" value={content} onChange={(e) => setContent(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button onClick={() => router.back()} className="px-4 py-2 bg-gray-200 rounded font-bold">취소</button>
          <button onClick={handleUpdate} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">수정완료</button>
        </div>
      </div>
    </div>
  );
}
