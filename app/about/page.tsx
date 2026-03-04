import { Target, ShieldCheck, TrendingUp, Compass, Star } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-10 min-h-[500px] my-8">
      {/* 1. 히로 섹션 */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
          필카페24 소개
        </h1>
        <p className="text-xl font-bold text-blue-600 mb-6">
          "연결하고, 나누고, 함께 성장하는 프리미엄 종합 플랫폼"
        </p>
        <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full"></div>
      </div>

      {/* 2. 도입부 전문 */}
      <div className="text-gray-700 space-y-4 mb-16 leading-relaxed text-base md:text-lg">
        <p>
          필리핀 한인 사회와 비즈니스의 새로운 중심, <span className="font-bold text-gray-900">필카페24</span>에 오신 것을 환영합니다!
        </p>
        <p>
          필카페24(PhilCafe24)는 필리핀에 거주하는 교민, 유학생, 주재원뿐만 아니라, 필리핀 진출을 꿈꾸는 사업가와 잊지 못할 여행을 계획하는 모든 분을 위한 가장 빠르고 신뢰할 수 있는 넘버원 종합 커뮤니티입니다.
        </p>
        <p>
          타지에서의 삶과 낯선 곳에서의 비즈니스는 때론 막막하고 외로울 수 있습니다. 정확한 현지 정보가 절실할 때, 믿을 수 있는 파트너와 안심할 수 있는 거래가 필요할 때, 필카페24는 그 모든 순간에 여러분과 가장 가까이 있는 든든한 동반자가 되겠습니다.
        </p>
      </div>

      {/* 3. 4대 핵심 가치 (그리드 레이아웃) */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Star className="text-yellow-500 fill-yellow-500" /> 필카페24가 약속하는 4가지 핵심 가치
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 border border-gray-100 bg-gray-50 rounded-xl">
            <Target className="text-blue-600 mb-3" size={32} />
            <h3 className="font-bold text-gray-900 text-lg mb-2">1. 프리미엄 정보 허브</h3>
            <p className="text-sm text-gray-600">이민국 정책, 현지 뉴스, 비자, 부동산 등 필수 정보부터 골프, 레저 등 고품격 라이프스타일 콘텐츠를 깊이 있게 다룹니다.</p>
          </div>
          <div className="p-6 border border-gray-100 bg-gray-50 rounded-xl">
            <ShieldCheck className="text-green-600 mb-3" size={32} />
            <h3 className="font-bold text-gray-900 text-lg mb-2">2. 투명하고 안전한 네트워크</h3>
            <p className="text-sm text-gray-600">불법 스팸, 사기, 비방을 엄격히 차단합니다. 강력한 보안과 투명한 운영으로 깨끗한 온라인 환경을 제공합니다.</p>
          </div>
          <div className="p-6 border border-gray-100 bg-gray-50 rounded-xl">
            <TrendingUp className="text-purple-600 mb-3" size={32} />
            <h3 className="font-bold text-gray-900 text-lg mb-2">3. 상생의 비즈니스 파트너</h3>
            <p className="text-sm text-gray-600">한-필 비즈니스 교두보로서 창업 정보, 구인구직, 업체 마케팅 지원을 통해 건강한 생태계를 구축합니다.</p>
          </div>
          <div className="p-6 border border-gray-100 bg-gray-50 rounded-xl">
            <Compass className="text-orange-600 mb-3" size={32} />
            <h3 className="font-bold text-gray-900 text-lg mb-2">4. 여행자를 위한 가이드</h3>
            <p className="text-sm text-gray-600">현지인만 아는 명소, 검증된 투어, 실시간 날씨 정보를 통해 여행의 질을 높이는 프리미엄 가이드가 되어드립니다.</p>
          </div>
        </div>
      </div>

      {/* 4. 특별한 경험 섹션 */}
      <div className="bg-blue-900 text-white p-8 rounded-2xl mb-12 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">🗺️ 필카페24에서 누릴 수 있는 특별한 경험</h2>
        <div className="space-y-4 text-blue-100">
          <div className="flex gap-3">
            <span className="font-bold text-blue-300 shrink-0">[프리미엄 라운지]</span>
            <p>최신 이민국 동향, 경제 지표, 심도 있는 칼럼 등 수준 높은 현지 밀착형 정보</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-300 shrink-0">[비즈니스 & 창업]</span>
            <p>안전한 투자 지표, 상가 임대, 노무/세무 상담 및 제휴 네트워크</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-300 shrink-0">[여행 & 레저]</span>
            <p>여행사 제휴 특가, 골프장 부킹, 호캉스 리뷰 및 실시간 Q&A</p>
          </div>
          <div className="flex gap-3">
            <span className="font-bold text-blue-300 shrink-0">[스마트 마켓]</span>
            <p>안심 중고장터, 검증된 교민 업체 디렉토리 및 부동산 매물</p>
          </div>
        </div>
      </div>

      {/* 5. 맺음말 */}
      <div className="text-center pt-8 border-t border-gray-100">
        <p className="text-gray-600 italic mb-6 leading-relaxed">
          필리핀 생활, 비즈니스, 그리고 여행의 모든 해답, 필카페24에 있습니다.<br />
          우리가 함께 만들어가는 이 공간이 한인 사회의 자랑스러운 자산이 되도록 끊임없이 노력하겠습니다.
        </p>
        <p className="font-bold text-gray-900 text-lg">필카페24 운영진 일동 올림</p>
      </div>
    </div>
  );
}
