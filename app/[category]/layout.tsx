import SidebarLeft from "@/components/layout/SidebarLeft";
import SidebarRight from "@/components/layout/SidebarRight";

// 이 레이아웃은 [category] 하위의 모든 페이지에 적용됩니다.
// 즉, 메뉴를 이동해도 사이드바는 그대로 있고 가운데(children)만 바뀝니다.
export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      {/* 좌측 사이드바 (고정) */}
      <div className="hidden md:block md:col-span-2">
        <SidebarLeft />
      </div>

      {/* 중앙 메인 컨텐츠 (여기가 바뀜) */}
      <main className="md:col-span-7">
        {children}
      </main>

      {/* 우측 사이드바 (고정) */}
      <div className="hidden md:block md:col-span-3">
        <SidebarRight />
      </div>
    </div>
  );
}
