"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
// ★ 수정됨: Reply 아이콘 추가
import { Trash2, MailOpen, Mail, ChevronDown, ChevronUp, Reply } from "lucide-react";
// ★ 수정됨: 방금 수정한 모달 컴포넌트 불러오기 (경로는 실제 파일 위치에 맞게 수정해주세요)
import SendMessageModal from "@/components/post/SendMessageModal"; 

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ★ 추가됨: 답장 모달 상태 관리
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyTarget, setReplyTarget] = useState({ id: "", nickname: "" });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      alert("로그인이 필요한 페이지입니다.");
      router.push("/login");
      return;
    }
    fetchMessages();
  }, [user, authLoading]);

  const fetchMessages = async () => {
    setLoading(true);
    const { data: msgs } = await supabase
      .from("messages")
      .select("*")
      .eq("receiver_id", user?.id)
      .order("created_at", { ascending: false });

    if (msgs && msgs.length > 0) {
      const senderIds = [...new Set(msgs.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in("id", senderIds);

      const profileMap: any = {};
        profiles?.forEach(p => { profileMap[p.id] = p; });

      const merged = msgs.map(m => ({
        ...m,
        sender: profileMap[m.sender_id] || { nickname: "알 수 없는 유저" }
      }));
      setMessages(merged);
    }
    setLoading(false);
  };

  const toggleMessage = async (msgId: string, isRead: boolean) => {
    if (expandedId === msgId) {
      setExpandedId(null); 
      return;
    }
    setExpandedId(msgId); 

    if (!isRead) {
      setMessages(messages.map(m => m.id === msgId ? { ...m, is_read: true } : m));
      await supabase.from("messages").update({ is_read: true }).eq("id", msgId);
      router.refresh(); 
    }
  };

  const handleDelete = async (e: any, msgId: string) => {
    e.stopPropagation(); 
    if (!confirm("이 쪽지를 삭제하시겠습니까? (복구할 수 없습니다)")) return;

    setMessages(messages.filter(m => m.id !== msgId));
    await supabase.from("messages").delete().eq("id", msgId);
    router.refresh();
  };

  // ★ 추가됨: 답장 버튼 클릭 시 모달 열기
  const handleReply = (senderId: string, senderNickname: string) => {
    setReplyTarget({ id: senderId, nickname: senderNickname });
    setIsReplyOpen(true);
  };

  if (loading) return <div className="p-10 text-center text-gray-500">쪽지함을 불러오는 중입니다...</div>;

  return (
    <>
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        <div className="bg-blue-600 px-6 py-5 text-white flex items-center gap-3">
          <Mail size={24} />
          <h2 className="text-xl font-bold">내 쪽지함</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {messages.length === 0 ? (
            <div className="p-16 text-center text-gray-400">
              받는 쪽지가 없습니다.
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="group">
                <div 
                  onClick={() => toggleMessage(msg.id, msg.is_read)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition ${msg.is_read ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/30 hover:bg-blue-50/60'}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {msg.is_read ? <MailOpen size={18} className="text-gray-400" /> : <Mail size={18} className="text-blue-600 fill-blue-100" />}
                    <div>
                      <p className={`text-sm ${msg.is_read ? 'text-gray-800' : 'text-blue-900 font-bold'}`}>
                        보낸 사람: {msg.sender.nickname}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(msg.created_at).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {expandedId === msg.id ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                    <button 
                      onClick={(e) => handleDelete(e, msg.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="삭제"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* 본문 내용 (펼쳐졌을 때만 보임) */}
                {expandedId === msg.id && (
                  <div className="p-5 bg-gray-50 border-t border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                    
                    {/* ★ 추가됨: 답장하기 버튼 */}
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                      <button
                        onClick={() => handleReply(msg.sender_id, msg.sender.nickname)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition shadow-sm"
                      >
                        <Reply size={16} className="text-green-600" />
                        답장하기
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ★ 추가됨: 답장 모달 렌더링 */}
      <SendMessageModal
        isOpen={isReplyOpen}
        onClose={() => setIsReplyOpen(false)}
        receiverId={replyTarget.id}
        receiverNickname={replyTarget.nickname}
        isReply={true} 
      />
    </>
  );
}
