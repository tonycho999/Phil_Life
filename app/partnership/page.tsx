export default function PartnershipPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* 1. 헤더 (Hero Section) */}
      <div className="bg-gradient-to-br from-[#1d4ed8] to-blue-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-block bg-red-500 text-white font-black px-3 py-1 rounded-full text-sm mb-4 animate-pulse">
            선착순 마감 임박
          </div>
          <h1 className="text-2xl md:text-3xl font-black mb-4 leading-snug tracking-tight">
            [필카페24] 타사 1개월 광고비로 '4개월' 송출!<br />
            + 창립 파트너 <span className="text-yellow-300">'평생 반값'</span> 보장
          </h1>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            사장님, 아직도 비싼 광고비 내고 모바일에서는 글씨도 안 보이는 배너를 쓰고 계신가요?<br />
            필리핀 NO.1 프리미엄 커뮤니티 <strong>[필카페24]</strong>가 기존 광고 시장의 거품을 완벽하게 걷어냈습니다.<br />
            표준 광고 단가는 이미 타사 대비 <strong>정확히 반값(50%)</strong>! 여기에 창립 파트너를 위한 역대급 런칭 혜택을 쏩니다.
          </p>
        </div>
        {/* 배경 장식 */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* 2. 트리플 혜택 (Cards) */}
      <div>
        <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
          🎁 런칭 기념 트리플 혜택 <span className="text-sm font-normal text-red-500 bg-red-50 px-2 py-1 rounded-md ml-2">선착순 구좌 한정</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 혜택 1 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-3">1️⃣</div>
            <h3 className="font-bold text-gray-800 mb-2 text-lg leading-tight">3개월 결제 시<br/><span className="text-[#1d4ed8]">1개월 무료 연장</span></h3>
            <p className="text-sm text-gray-600 mb-4">표준가에서 50% 깎아드린 파격가에, 3개월 결제 시 1개월을 얹어 총 4개월을 띄워드립니다.</p>
            <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono space-y-1">
              <p className="text-gray-400 line-through">타사 탑 배너 3개월: 90,000₱</p>
              <p className="text-red-500 font-bold text-sm">👉 당사 4개월(3+1): 22,500₱</p>
            </div>
          </div>
          {/* 혜택 2 */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition relative">
            <div className="absolute top-4 right-4 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">★가장 중요</div>
            <div className="text-3xl mb-3">2️⃣</div>
            <h3 className="font-bold text-gray-800 mb-2 text-lg leading-tight">초기 창립 파트너<br/><span className="text-[#1d4ed8]">'평생 50% 할인'</span> 보장</h3>
            <p className="text-sm text-gray-600">이번 런칭 기간에 입점하시면 추후 재계약 시에도 가격 인상 없이 <strong>'표준 단가의 50% 할인가'</strong>를 평생 보장해 드립니다. 접속자가 100배 늘어도 평생 VVIP 초특가!</p>
          </div>
          {/* 혜택 3 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="text-3xl mb-3">3️⃣</div>
            <h3 className="font-bold text-gray-800 mb-2 text-lg leading-tight">모바일 100%<br/><span className="text-[#1d4ed8]">최적화 노출</span></h3>
            <p className="text-sm text-gray-600">유저 80%가 접속하는 모바일! 글씨가 깨지거나 잘리지 않도록 기기에 맞춰 가장 완벽한 사이즈로 자동 변환되어 사장님의 비즈니스를 돋보이게 합니다.</p>
          </div>
        </div>
      </div>

      {/* 3. 단가표 (Table) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-black text-gray-800">📊 공식 배너 광고 단가 및 이용 안내</h2>
          <p className="text-xs text-gray-500 mt-1">
            ※ 아래 금액은 '표준가 50% 할인'이 적용된 창립 파트너 특별가이며, 결제 시 총 4개월(3+1) 송출 및 재계약 시 평생 보장됩니다.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 bg-gray-100 uppercase">
              <tr>
                <th className="px-4 py-3 border-b">구분 (위치)</th>
                <th className="px-4 py-3 border-b">사이즈 (PC/모바일)</th>
                <th className="px-4 py-3 border-b">노출 방식 및 특징</th>
                <th className="px-4 py-3 border-b text-right text-red-600">프로모션 결제액<br/>(총 4개월 보장)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4 font-bold text-gray-900">탑 배너<br/><span className="text-xs text-gray-400 font-normal">(메인 홈 최상단)</span></td>
                <td className="px-4 py-4 text-xs">PC: 800 x 90<br/>모바일: 320 x 100</td>
                <td className="px-4 py-4">PC/모바일 접속 시 최상단 꽉 찬 노출<br/><span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">최대 3개 업체 롤링 한정</span></td>
                <td className="px-4 py-4 text-right">
                  <div className="font-black text-[#1d4ed8] text-base">22,500 ₱</div>
                  <div className="text-[10px] text-gray-400 line-through">표준 45,000₱</div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4 font-bold text-gray-900">윙 배너<br/><span className="text-xs text-gray-400 font-normal">(메인 홈 좌/우)</span></td>
                <td className="px-4 py-4 text-xs">PC: 160 x 600<br/>모바일: 300 x 250</td>
                <td className="px-4 py-4">PC 스크롤 시 따라다니는 고정 노출<br/>모바일은 본문 중간/하단 최적화 변환<br/><span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">최대 6개 업체 롤링 한정</span></td>
                <td className="px-4 py-4 text-right">
                  <div className="font-black text-[#1d4ed8] text-base">15,000 ₱</div>
                  <div className="text-[10px] text-gray-400 line-through">표준 30,000₱</div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-4 font-bold text-gray-900">메인 게시판<br/><span className="text-xs text-gray-400 font-normal">(트래픽 집중)</span></td>
                <td className="px-4 py-4 text-xs">PC: 800 x 90<br/>모바일: 320 x 100</td>
                <td className="px-4 py-4">부동산, 구인구직, 질문 등 핵심 노출<br/><span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">게시판당 최대 3개 업체 롤링</span></td>
                <td className="px-4 py-4 text-right">
                  <div className="font-black text-[#1d4ed8] text-base">4,500 ₱</div>
                  <div className="text-[10px] text-gray-400 line-through">표준 9,000₱</div>
                </td>
              </tr>
              <tr className="hover:bg-gray-50 bg-gray-50/50">
                <td className="px-4 py-4 font-bold text-gray-900">서브 게시판<br/><span className="text-xs text-gray-400 font-normal">(타겟 맞춤형)</span></td>
                <td className="px-4 py-4 text-xs">PC: 800 x 90<br/>모바일: 320 x 100</td>
                <td className="px-4 py-4">취미, 지역별 맛집 등 세부 타겟팅 가성비<br/><span className="text-xs text-blue-600 bg-blue-50 px-1 rounded">게시판당 최대 3개 업체 롤링</span></td>
                <td className="px-4 py-4 text-right">
                  <div className="font-black text-[#1d4ed8] text-base">1,500 ₱</div>
                  <div className="text-[10px] text-gray-400 line-through">표준 3,000₱</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ★ 4. 추가 할인 풀패키지 (새로 추가됨) */}
      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 md:p-8 border border-yellow-200 shadow-sm relative overflow-hidden">
        <h2 className="text-xl md:text-2xl font-black text-amber-900 mb-3 flex items-center gap-2">
          👑 [강력 추천] 창립 파트너 전용 "추가 할인 풀패키지"
        </h2>
        <p className="text-amber-800 text-sm md:text-base mb-6 leading-relaxed">
          단일 광고도 저렴하지만, <strong>"배너 노출 + 타겟 게시판 상위 고정"</strong>을 동시에 진행하시면 시너지 효과가 극대화됩니다.<br className="hidden md:block" />
          런칭 기간에만 제공하는 특별 결합 추가 할인 패키지를 확인해 보세요. (마찬가지로 결제 시 4개월 보장)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 패키지 1: 프리미엄 올인원 */}
          <div className="bg-white rounded-xl p-6 border-2 border-amber-400 shadow-md relative hover:-translate-y-1 transition duration-300">
            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-bl-lg rounded-tr-lg shadow-sm">
              2,000₱ 추가 할인!
            </div>
            <h3 className="font-black text-lg text-gray-800 mb-4">[프리미엄 올인원 패키지]</h3>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>메인 탑 배너</span><span>22,500 ₱</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>타겟 게시판 상단 고정</span><span>3,000 ₱</span>
              </li>
            </ul>
            <div className="flex justify-between items-end mt-4">
              <div className="text-xs text-gray-400">정상 프로모션가: <span className="line-through">25,500 ₱</span></div>
              <div className="text-2xl font-black text-red-600">🔥 23,500 <span className="text-base font-bold text-gray-800">₱</span></div>
            </div>
          </div>

          {/* 패키지 2: 실속 타겟팅 */}
          <div className="bg-white rounded-xl p-6 border border-amber-200 shadow-sm relative hover:-translate-y-1 transition duration-300">
            <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-bl-lg rounded-tr-lg shadow-sm">
              1,500₱ 추가 할인!
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-4">[실속 타겟팅 패키지]</h3>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>윙 배너</span><span>15,000 ₱</span>
              </li>
              <li className="flex justify-between border-b border-gray-100 pb-2">
                <span>타겟 게시판 상단 고정</span><span>3,000 ₱</span>
              </li>
            </ul>
            <div className="flex justify-between items-end mt-4">
              <div className="text-xs text-gray-400">정상 프로모션가: <span className="line-through">18,000 ₱</span></div>
              <div className="text-2xl font-black text-red-600">🔥 16,500 <span className="text-base font-bold text-gray-800">₱</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. 제작 팁 & 프로세스 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-black text-gray-800 mb-4 border-b pb-2">💡 배너 제작 및 노출 팁</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="text-blue-500">✔</span>
              <span><strong>PC/모바일 반응형 송출:</strong> 접속 환경을 자동 인식하여 화면 깨짐 없이 시인성 좋은 맞춤형 사이즈로 노출됩니다.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">✔</span>
              <span><strong>윙 배너 모바일 최적화:</strong> 좌우 여백이 없는 모바일 특성상, 윙 배너는 시선이 오래 머무는 본문 하단 영역에 가독성 높은 미디엄 레탱글(300x250) 사이즈로 대체되어 깔끔하게 띄워드립니다.</span>
            </li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="font-black text-gray-800 mb-4 border-b pb-2">🔄 광고 진행 프로세스</h3>
          <ol className="space-y-3 text-sm text-gray-600 list-decimal list-inside">
            <li><strong>상담 및 구좌 확인:</strong> 원하시는 배너 위치와 현재 남은 자리(T/O) 확인</li>
            <li><strong>광고비 입금:</strong> 공식 계좌로 런칭 프로모션 비용 선납 입금</li>
            <li><strong>자료 전달 및 제작:</strong> 이미지/문구 전달 시 최적화 디자인 세팅</li>
            <li><strong>광고 송출:</strong> 4개월간 송출 (이후 재계약 시 평생 50% 자동 적용)</li>
          </ol>
        </div>
      </div>

      {/* 6. 연락처 및 결제 정보 */}
      <div className="bg-gray-900 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-xl font-black mb-6 text-center text-yellow-400">📞 공식 광고 및 제휴 문의 창구</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl">👤</div>
              <div>
                <p className="text-gray-400 text-xs">총괄 담당자</p>
                <p className="font-bold text-lg">이송영 관리자</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-xl">📱</div>
              <div>
                <p className="text-gray-400 text-xs">직통 연락처 (카카오톡 및 문자 수신 가능)</p>
                <p className="font-bold text-lg text-blue-300">0977-652-1005</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-sm font-bold text-gray-300 mb-3 border-b border-gray-700 pb-2">💳 공식 결제 계좌 안내</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">BDO은행</span>
                <span className="font-mono font-bold">005680317509</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">GCash</span>
                <span className="font-mono font-bold">0977-652-1005</span>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-700 text-right">
                <span className="text-xs text-gray-500">예금주: </span>
                <span className="font-bold text-yellow-400">SONG YOUNG LEE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
