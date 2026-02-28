import SidebarLeft from "@/components/layout/SidebarLeft";
import SidebarRight from "@/components/layout/SidebarRight";

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[calc(100vh-100px)]">
      {/* 좌측 사이드바 (데스크탑만 보임) */}
      <div className="hidden md:block md:col-span-2">
        <SidebarLeft />
      </div>

      {/* 중앙 메인 컨텐츠 */}
      <main className="md:col-span-7 w-full">
        {children}
      </main>

      {/* 우측 사이드바 (데스크탑만 보임) */}
      <div className="hidden md:block md:col-span-3">
        <SidebarRight />
      </div>
    </div>
  );
}
