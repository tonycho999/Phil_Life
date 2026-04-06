// components/layout/AdBannerRight.tsx
export default function AdBannerRight() {
  return (
    <div className="hidden lg:block relative w-[160px]">
      {/* sticky를 유지하여 스크롤 시에도 광고가 따라다니게 합니다. */}
      <div className="sticky top-40 w-[160px] h-[600px] flex items-center justify-center bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <iframe
          src="https://ads-partners.coupang.com/widgets.html?id=977715&template=carousel&trackingCode=AF7694250&subId=&width=160&height=600"
          width="160"
          height="600"
          frameBorder="0"
          scrolling="no"
          referrerPolicy="unsafe-url"
          className="border-none bg-transparent"
        ></iframe>
      </div>
    </div>
  );
}
