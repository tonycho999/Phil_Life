// components/layout/AdBannerLeft.tsx
export default function AdBannerLeft() {
  return (
    <div className="hidden lg:block relative">
      <div className="sticky top-40 w-full h-[600px] bg-gray-200/60 border border-gray-300 rounded-lg flex items-center justify-center text-gray-500 font-bold shadow-inner transition-colors hover:bg-gray-200">
        <span className="text-center">
          좌측 배너<br />
          <span className="text-xs font-normal">160x600 등</span>
        </span>
      </div>
    </div>
  );
}
