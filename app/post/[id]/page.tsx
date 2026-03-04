import { createClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import CommentSection from "@/components/post/CommentSection";
import PostControls from "@/components/post/PostControls";
import { Eye } from "lucide-react";
// ★ 주의: components/post/PostViewCounter.tsx 파일이 실제로 만들어져 있어야 에러가 안 납니다!
import PostViewCounter from "@/components/post/PostViewCounter";

export const runtime = 'edge';
export const dynamic = "force-dynamic";

function getLevelBadgeInfo(level: any) {
  const strLevel = String(level);
  if (strLevel === "10") return { label: "M", style: "bg-gray-800 text-white border-gray-900" }; 
  if (strLevel === "S" || strLevel === "99") return { label: "S", style: "bg-yellow-100 text-yellow-700 border-yellow-300" };
  
  if (strLevel === "0") return { label: "Lv.0", style: "bg-gray-100 text-gray-500 border-gray-200" };
  if (strLevel === "1") return { label: "Lv.1", style: "bg-green-100 text-green-700 border-green-200" };
  if (strLevel === "2") return { label: "Lv.2", style: "bg-blue-100 text-blue-700 border-blue-200" };
  if (strLevel === "3") return { label: "Lv.3", style: "bg-purple-100 text-purple-700 border-purple-200" };
  if (strLevel === "4") return { label: "Lv.4", style: "bg-teal-100 text-teal-700 border-teal-200" };
  if (strLevel === "5") return { label: "Lv.5", style: "bg-pink-100 text-pink-700 border-pink-200" };
  
  return { label: `Lv.${strLevel}`, style: "bg-indigo-100 text-indigo-700 border-indigo-200" };
}

export default async function PostDetailPage({ params }: { params: any }) {
  // ★ 수정됨: Next.js 최신 버전 에러 방지를 위해 params를 안전하게 풀어줍니다.
  const resolvedParams = await params;
  const postId = resolvedParams.id;

  const supabase = createClient();
  
  const { data: post, error } = await supabase
    .from("posts")
    .select("*, profiles(nickname, grade, level)")
    .eq("id", postId)
    .single();

  if (error || !post) {
    return notFound();
  }

  const renderContent = () => {
    if (post.format === 'html') {
      return (
        <div 
            className="prose max-w-none prose-img:rounded-lg prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: post.content }} 
        />
      );
    }
    return <p className="whitespace-pre-wrap leading-relaxed text-gray-800">{post.content}</p>;
  };

  const userLevel = post.profiles?.level ?? 1;
  const badge = getLevelBadgeInfo(userLevel);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      <PostViewCounter postId={postId} />

      <div className="mb-6 border-b pb-4">
        <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {post.category_sub}
            </span>
            {post.is_hidden && (
               <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">비공개(숨김)</span>
            )}
            {post.is_pinned && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                    {post.pinned_reason || "공지"}
                </span>
            )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight flex-1">
                {post.title}
            </h1>
            
            <PostControls 
              postId={post.id}
              authorId={post.author_id}
              categoryMain={post.category_main}
              categorySub={post.category_sub}
              isHidden={post.is_hidden}
              isPinned={post.is_pinned}
            />
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 mt-3">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className={`px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold border ${badge.style}`}>
                    {badge.label}
                  </span>
                  <span className="font-bold text-gray-800">{post.profiles?.nickname || "알 수 없음"}</span>
                </div>
                <span suppressHydrationWarning className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</span>
            </div>
            <span className="flex items-center gap-1 text-xs">
                <Eye size={14} /> {(post.view_count || 0) + 1}
            </span>
        </div>
      </div>

      <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-h-[300px] mb-8 ${post.is_hidden ? 'opacity-50 grayscale' : ''}`}>
        {renderContent()}
      </div>

      <CommentSection postId={post.id} />

      <div className="mt-10 text-center border-t pt-8">
        <Link 
            href={`/${post.category_main}/${post.category_sub}`}
            className="px-8 py-2.5 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition inline-block text-sm shadow-sm"
        >
            목록으로
        </Link>
      </div>
    </div>
  );
}
