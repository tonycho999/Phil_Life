"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { Trash2 } from "lucide-react";

export default function CommentSection({ postId }: { postId: string }) {
  const supabase = createClient();
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  // 댓글 불러오기
  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(nickname)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (data) setComments(data);
  };

  useEffect(() => { fetchComments(); }, [postId]);

  // 댓글 등록
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("로그인이 필요합니다.");
    if (!content.trim()) return;

    setLoading(true);
    // 1. 댓글 저장
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: user.id,
      content,
    });

    if (error) alert("실패: " + error.message);
    else {
      setContent("");
      fetchComments();
      // 2. 게시글의 comment_count 증가 (RPC 혹은 단순 업데이트)
      await supabase.rpc('increment_comment_count', { row_id: postId }); 
    }
    setLoading(false);
  };

  // 댓글 삭제
  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    await supabase.from("comments").delete().eq("id", id);
    fetchComments();
    await supabase.rpc('decrement_comment_count', { row_id: postId });
  };

  return (
    <div className="mt-10 border-t pt-6">
      <h3 className="font-bold text-lg mb-4">댓글 <span className="text-blue-600">{comments.length}</span></h3>
      
      {/* 댓글 리스트 */}
      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-sm text-gray-800">
                {comment.profiles?.nickname || "익명"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
                {user?.id === comment.author_id && (
                  <button onClick={() => handleDelete(comment.id)} className="text-gray-400 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
        ))}
      </div>

      {/* 작성 폼 */}
      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-blue-500 text-sm"
            placeholder="댓글을 남겨보세요."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">
            등록
          </button>
        </form>
      ) : (
        <div className="bg-gray-100 p-3 text-center text-sm text-gray-500 rounded">
          로그인 후 댓글을 작성할 수 있습니다.
        </div>
      )}
    </div>
  );
}
