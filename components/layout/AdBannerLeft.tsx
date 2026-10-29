// components/layout/AdBannerLeft.tsx
export default function AdBannerLeft() {
  return (
    // h-full: 부모 높이만큼 늘어나야 안쪽 sticky가 스크롤을 따라 움직일 수 있습니다.
    <div className="relative w-[160px] h-full">
      <a
        href="https://tolt.link/assdqxw"
        target="_blank"
        rel="noopener noreferrer"
        className="sticky top-40 w-[160px] h-[600px] flex flex-col items-center justify-between bg-zinc-950 text-white rounded-lg overflow-hidden shadow-sm border border-zinc-800 hover:shadow-xl transition-all group"
      >
        {/* 상단 텍스트 영역 */}
        <div className="pt-12 px-3 text-center w-full">
          <span className="text-[10px] font-bold text-cyan-400 tracking-[0.2em] uppercase mb-3 block">
            AI English Tutor
          </span>
          <h3 className="text-3xl font-black tracking-tighter mb-6 text-white">
            SPEAK
          </h3>
          <div className="w-8 h-0.5 bg-cyan-400 mx-auto mb-8"></div>
          <p className="text-sm font-medium leading-loose break-keep text-zinc-300">
            사람보다 편한<br />
            1:1 AI 영어회화<br />
            <span className="text-cyan-400 font-bold text-base mt-2 block">
              특별 할인 혜택
            </span>
          </p>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="pb-10 w-full px-4">
          <div className="w-full bg-cyan-400 text-zinc-950 text-center py-2.5 rounded-full font-bold text-sm group-hover:bg-cyan-300 group-hover:scale-105 transition-all duration-300 shadow-md">
            무료 체험하기 〉
          </div>
        </div>
      </a>
    </div>
  );
}
