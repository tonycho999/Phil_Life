// app/not-found.tsx
import Link from 'next/link';

export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h2>
      <p className="text-gray-500">주소가 바뀌었거나 삭제된 게시글일 수 있어요.</p>
      <Link href="/" className="text-cyan-600 underline">
        홈으로 돌아가기
      </Link>
    </div>
  );
}
