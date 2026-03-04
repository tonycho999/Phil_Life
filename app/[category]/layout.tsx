// ★ Cloudflare 배포를 위한 필수 설정
export const runtime = 'edge';

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 최상위 레이아웃에서 이미 사이드바를 그렸으므로,
  // 여기서는 껍데기 없이 알맹이만 그대로 내보냅니다!
  return <>{children}</>;
}
