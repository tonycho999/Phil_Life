"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { Trash2, Edit2, CornerDownRight, ShieldAlert, XCircle } from "lucide-react";

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  is_hidden: boolean;
  profiles: { nickname: string; level: number; grade: string };
}

export default function CommentSection({ postId }: { postId: string }) {
  const supabase = createClient();
  const { user, profile } = useAuth(); // profile에서 level, grade 확인 가능
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  
  // 상태 관리
  const [replyTo, setReplyTo] = useState<string | null>(null); // 대댓글 작성 중인 부모 ID
  const [editId, setEditId] = useState<string | null>(null); // 수정 중인 댓글 ID
  const [editContent, setEditContent] = useState("");

  const isAdmin = (profile?.level || 0) >= 10 || profile?.grade === "관리자";

  // 댓글 불러오기
  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*, profiles(nickname, level, grade)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
      
    if (data) setComments(data);
  };

  useEffect(() => { fetchComments(); }, [postId]);

  // 1. 댓글 등록 (일반 & 대댓글 공통)
  const handleSubmit = async (parentId: string | null = null, text: string) => {
    if (!user) return alert("로그인 필요");
    if (!text.trim()) return;

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: user.id,
      content: text,
      parent_id: parentId,
    });

    if (!error) {
      setContent("");
      setReplyTo(null);
      fetchComments();
      
      // 댓글 수 증가 (선택사항)
      const { data: p } = await supabase.from("posts").select("comment_count").eq("id", postId).single();
      if(p) await supabase.from("posts").update({comment_count: p.comment_count + 1}).eq("id", postId);
    } else {
      alert("실패: " + error.message);
    }
  };

  // 2. 댓글 수정
  const handleUpdate = async (id: string) => {
    const { error } = await supabase.from("comments").update({ content: editContent }).eq("id", id);
    if (!error) {
      setEditId(null);
      fetchComments();
    }
  };

  // 3. 댓글 삭제 (본인 및 관리자)
  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까? 대댓글이 있다면 함께 삭제될 수 있습니다.")) return;
    await supabase.from("comments").delete().eq("id", id);
    fetchComments();
    
    // 댓글 수 감소
    const { data: p } = await supabase.from("posts").select("comment_count").eq("id", postId).single();
    if(p && p.comment_count > 0) await supabase.from("posts").update({comment_count: p.comment_count - 1}).eq("id", postId);
  };

  // 4. 관리자 기능: 숨김 처리 (읽기 금지)
  const handleToggleHidden = async (id: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    await supabase.from("comments").update({ is_hidden: !currentStatus }).eq("id", id);
    fetchComments();
  };

  // ★ 계층형 렌더링을 위한 데이터 정리
  // 1차 댓글(부모)만 필터링하고, 각 부모 안에서 자식(대댓글)을 찾도록 렌더링
  const rootComments = comments.filter(c => !c.parent_id);

  // 댓글 아이템 렌더링 함수 (재사용)
  const renderCommentItem = (comment: Comment, isReply = false) => {
    const isMine = user?.id === comment.author_id;
    // 숨김 처리된 글: 관리자나 본인만 볼 수 있음
    const isBlind = comment.is_hidden;
    const canRead = !isBlind || isMine || isAdmin;

    return (
      <div key={comment.id} className={`p-4 rounded-lg mb-2 ${isReply ? 'ml-10 bg-gray-50 border-l-4 border-gray-200' : 'bg-white border border-gray-100'}`}>
        
        {/* 헤더: 작성자 / 날짜 / 버튼들 */}
        <div className="flex justify-between items-start mb-2">
           <div className="flex items-center gap-2">
              {isReply && <CornerDownRight size={16} className="text-gray-400" />}
              <span className="font-bold text-sm text-gray-800">{comment.profiles?.nickname || "알 수 없음"}</span>
              <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</span>
           </div>

           <div className="flex items-center gap-2 text-xs">
              {/* 대댓글 버튼 (1차 댓글에만 노출 - 무한 뎁스 방지용으로 보통 1차까지만 허용) */}
              {!isReply && canRead && (
                 <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="text-blue-600 font-bold hover:underline">
                    답글
                 </button>
              )}

              {/* 수정/삭제 (본인) */}
              {isMine && canRead && (
                 <>
                    <button onClick={() => { 
                        setEditId(comment.id); 
                        setEditContent(comment.content); 
                        setReplyTo(null); 
                    }} className="text-gray-500 hover:text-blue-600">
                       <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(comment.id)} className="text-gray-500 hover:text-red-600">
                       <Trash2 size={14} />
                    </button>
                 </>
              )}

              {/* 관리자 버튼 (삭제 / 숨김) */}
              {isAdmin && !isMine && (
                 <>
                    <button onClick={() => handleToggleHidden(comment.id, comment.is_hidden)} className={`flex items-center gap-1 ${comment.is_hidden ? 'text-red-500' : 'text-gray-400'}`}>
                       {comment.is_hidden ? <XCircle size={14} /> : <ShieldAlert size={14} />}
                    </button>
                    <button onClick={() => handleDelete(comment.id)} className="text-red-400 hover:text-red-700">
                       <Trash2 size={14} />
                    </button>
                 </>
              )}
           </div>
        </div>

        {/* 내용 영역 */}
        {editId === comment.id ? (
           // 수정 모드
           <div className="mt-2">
              <textarea 
                 className="w-full border p-2 rounded text-sm" 
                 value={editContent} 
                 onChange={(e) => setEditContent(e.target.value)} 
              />
              <div className="flex gap-2 mt-1 justify-end">
                 <button onClick={() => setEditId(null)} className="text-xs bg-gray-200 px-2 py-1 rounded">취소</button>
                 <button onClick={() => handleUpdate(comment.id)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded">수정완료</button>
              </div>
           </div>
        ) : (
           // 일반 모드
           <p className={`text-sm whitespace-pre-wrap ${!canRead ? 'text-gray-400 italic' : 'text-gray-700'}`}>
              {!canRead ? "🔒 관리자 또는 작성자에 의해 숨김 처리된 댓글입니다." : comment.content}
           </p>
        )}

        {/* 답글 작성 폼 (이 댓글 바로 아래에 열림) */}
        {replyTo === comment.id && (
           <div className="mt-3 ml-4 border-l-2 border-blue-200 pl-3">
              <p className="text-xs text-blue-600 mb-1">↳ 답글 작성 중...</p>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(comment.id, (e.target as any).replyInput.value); }}>
                 <input name="replyInput" type="text" className="w-full border p-2 rounded text-sm mb-2" placeholder="답글 내용을 입력하세요" autoFocus />
                 <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setReplyTo(null)} className="text-xs px-3 py-1 bg-gray-200 rounded">취소</button>
                    <button className="text-xs px-3 py-1 bg-blue-600 text-white rounded">등록</button>
                 </div>
              </form>
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-10 border-t pt-8">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
        댓글 <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">{comments.length}</span>
      </h3>

      <div className="space-y-4 mb-8">
        {rootComments.map((root) => (
           <div key={root.id}>
              {/* 부모 댓글 */}
              {renderCommentItem(root, false)}
              
              {/* 자식 댓글들 (대댓글) */}
              {comments.filter(c => c.parent_id === root.id).map(child => (
                 renderCommentItem(child, true)
              ))}
           </div>
        ))}
      </div>

      {/* 최상위 댓글 작성 폼 */}
      {user ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(null, content); }} className="relative">
          <textarea
            className="w-full border border-gray-300 rounded-xl p-4 pr-24 focus:outline-blue-500 min-h-[100px] resize-none shadow-sm"
            placeholder="댓글을 남겨보세요. (비방, 욕설은 삭제될 수 있습니다)"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="absolute bottom-3 right-3 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition">
            등록
          </button>
        </form>
      ) : (
        <div className="bg-gray-50 border border-gray-200 p-6 text-center text-sm text-gray-500 rounded-xl">
           로그인 후 댓글을 작성할 수 있습니다.
        </div>
      )}
    </div>
  );
}
