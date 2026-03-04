export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-10 min-h-[500px] my-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
        필카페24 (PhilCafe24) 게시판 운영원칙
      </h1>
      
      <div className="text-gray-700 space-y-8 leading-relaxed text-sm md:text-base">
        
        {/* 제1장 총칙 */}
        <section>
          <h2 className="text-lg font-bold text-blue-700 mb-3 px-3 py-1 bg-blue-50 inline-block rounded">제1장 총칙</h2>
          <p className="mt-2">
            필카페24는 필리핀 교민, 유학생, 주재원 및 여행객들의 건강하고 유익한 정보 교류와 소통을 위해 만들어진 공간입니다. 본 커뮤니티의 원활한 운영을 위해 아래의 원칙을 규정하며, 모든 회원은 사이트 이용 시 본 원칙을 준수해야 합니다.
          </p>
        </section>

        {/* 제2장 삭제 및 블라인드 기준 */}
        <section>
          <h2 className="text-lg font-bold text-blue-700 mb-3 px-3 py-1 bg-blue-50 inline-block rounded">제2장 게시물 삭제 및 블라인드 기준</h2>
          <p className="mb-4 text-sm text-gray-500">※ 운영진은 다음 각 호에 해당하는 게시물을 발견 시, 사전 통보 없이 삭제 또는 블라인드 처리할 수 있습니다.</p>
          
          <div className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h3 className="font-bold text-red-700 mb-2">1. 불법 행위 조장 및 홍보 (무관용 원칙)</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-red-800">
                <li>불법 환전 (환치기 등) 요구 및 알선 글</li>
                <li>불법 도박 (카지노 에이전트, 아바타, 온라인 도박 사이트 등) 홍보 및 관련 은어 사용</li>
                <li>성매매, 유흥업소 관련 노골적인 홍보 및 후기</li>
                <li>필리핀 현지 및 대한민국 법률에 위반되는 모든 행위의 모의 및 조장</li>
              </ul>
            </div>

            <div className="ml-2 space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">2. 상업적 스팸 및 도배</h3>
                <p className="text-sm text-gray-600">무단 광고(업체/상품), 동일 내용 반복 게시, 추천인 코드 삽입 및 다단계 홍보 등</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">3. 비방, 욕설 및 명예훼손</h3>
                <p className="text-sm text-gray-600">인신공격, 차별적 발언(지역/종교/인종/성별), 교민 사회 내 허위 사실 유포 등</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">4. 개인정보 노출 및 사생활 침해</h3>
                <p className="text-sm text-gray-600">본인/타인의 여권번호, 연락처 노출, 동의 없는 초상권 침해 사진 게시 등</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">5. 기타 커뮤니티 분위기 저해</h3>
                <p className="text-sm text-gray-600">과도한 파벌 형성 및 타 회원 배척, 게시판 성격에 맞지 않는 게시물 작성 등</p>
              </div>
            </div>
          </div>
        </section>

        {/* 제3장 회원 제재 기준 */}
        <section>
          <h2 className="text-lg font-bold text-blue-700 mb-4 px-3 py-1 bg-blue-50 inline-block rounded">제3장 회원 제재 기준</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">주의 및 경고</h3>
              <p className="text-xs text-gray-500 mb-2">1차 적발 시</p>
              <p className="text-sm text-gray-600">가벼운 규정 위반 등. 해당 글 삭제 및 쪽지/알림을 통한 경고.</p>
            </div>
            <div className="p-4 border border-orange-200 bg-orange-50/30 rounded-lg">
              <h3 className="font-bold text-orange-700 border-b border-orange-100 pb-2 mb-2">이용 정지</h3>
              <p className="text-xs text-orange-500 mb-2">2차 적발 또는 중대 위반</p>
              <p className="text-sm text-gray-600">일정 기간(3~30일) 글쓰기, 댓글 및 쪽지 기능 제한.</p>
            </div>
            <div className="p-4 border border-red-200 bg-red-50/30 rounded-lg">
              <h3 className="font-bold text-red-700 border-b border-red-100 pb-2 mb-2">영구 강제 탈퇴</h3>
              <p className="text-xs text-red-500 mb-2">즉시 적용</p>
              <p className="text-sm text-gray-600 font-medium">불법 행위 조장, 사기 정황, 시스템 해킹 시도 시 즉시 IP 차단.</p>
            </div>
          </div>
        </section>

        {/* 제4장 신고 제도 및 분쟁 조정 */}
        <section>
          <h2 className="text-lg font-bold text-blue-700 mb-3 px-3 py-1 bg-blue-50 inline-block rounded">제4장 신고 제도 및 분쟁 조정</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>회원은 위반 게시물 발견 시 하단의 '신고' 버튼을 통해 운영진에게 알릴 수 있습니다.</li>
            <li>회원 간 분쟁에 운영진은 원칙적으로 개입하지 않으나, 커뮤니티 분위기를 심각하게 저해할 경우 직권 조치할 수 있습니다.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
