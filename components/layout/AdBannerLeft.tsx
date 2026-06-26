// components/layout/AdBannerLeft.tsx
export default function AdBannerLeft() {
  return (
    <div className="hidden lg:block relative w-[160px]">
      {/* sticky를 유지하여 스크롤 시에도 광고가 따라다니게 합니다. */}
      <a
        href="https://miniurl.app/clnl10x?aff_sub=phcafe24&url=https%3A%2F%2Fonelink.shein.com%2F15%2F4wh5j6ktxgqy"
        target="_blank"
        rel="noopener noreferrer"
        className="sticky top-40 w-[160px] h-[600px] flex flex-col items-center justify-between bg-zinc-900 text-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-all group"
      >
        {/* 상단 텍스트 영역 */}
        <div className="pt-12 px-3 text-center w-full">
          <span className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase mb-3 block">
            Global Fashion
          </span>
          <h3 className="text-4xl font-black tracking-tighter mb-6">SHEIN</h3>
          
          <div className="w-8 h-0.5 bg-white mx-auto mb-8"></div>
          
          <p className="text-sm font-medium leading-loose break-keep">
            전 세계가 열광하는<br />
            최신 트렌드 패션<br />
            <span className="text-rose-500 font-black text-base mt-2 block">
              글로벌 특가 세일
            </span>
          </p>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="pb-10 w-full px-4">
          <div className="w-full bg-white text-zinc-900 text-center py-2.5 rounded-full font-bold text-sm group-hover:bg-zinc-200 group-hover:scale-105 transition-all duration-300 shadow-md">
            지금 쇼핑하기 〉
          </div>
        </div>
      </a>
    </div>
  );
}
