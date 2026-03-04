export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 최상위 RootLayout에서 이미 전체 뼈대와 양쪽 사이드바를 잡아주었으므로,
  // 여기서는 아무런 껍데기 없이 알맹이(page.tsx)만 그대로 렌더링해서 내보냅니다!
  return <>{children}</>;
}
