export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-10 min-h-[500px] my-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
        필카페24 (PhilCafe24) 개인정보처리방침
      </h1>
      
      <div className="text-gray-700 space-y-8 leading-relaxed text-sm md:text-base">
        
        {/* 도입부 */}
        <p className="font-medium text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-100">
          '필카페24'(이하 '회사' 또는 '사이트')는 회원의 개인정보를 소중하게 생각하며, 관련 법령을 준수하고 있습니다. 본 개인정보처리방침을 통해 사이트가 어떤 목적으로 회원의 개인정보를 수집, 이용, 파기하는지 안내해 드립니다.
        </p>

        {/* 제1조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제1조 (수집하는 개인정보의 항목 및 수집 방법)</h2>
          <p className="mb-2">사이트는 회원가입, 원활한 고객상담, 각종 서비스의 제공을 위해 아래와 같은 개인정보를 수집하고 있습니다.</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100 mt-2">
            <li><strong className="text-gray-800">필수 수집 항목:</strong> 이메일 주소, 비밀번호, 닉네임</li>
            <li><strong className="text-gray-800">소셜 로그인 시 수집 항목 (카카오, 구글, 네이버 등):</strong> 연동된 이메일 주소, 프로필 사진, 닉네임 (제공에 동의한 항목에 한함)</li>
            <li><strong className="text-gray-800">서비스 이용 과정에서 자동 수집되는 항목:</strong> IP 주소, 쿠키(Cookie), 방문 일시, 서비스 이용 기록, 불량 이용 기록</li>
            <li><strong className="text-gray-800">수집 방법:</strong> 홈페이지 회원가입, 게시판 이용, 이벤트 응모, 소셜 로그인 연동</li>
          </ul>
        </section>

        {/* 제2조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제2조 (개인정보의 수집 및 이용 목적)</h2>
          <p className="mb-2">수집한 개인정보는 다음의 목적을 위해 활용됩니다.</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li><strong className="text-gray-800">회원 관리:</strong> 회원제 서비스 이용에 따른 본인 확인, 개인 식별, 불량 회원의 부정 이용 방지와 비인가 사용 방지, 가입 의사 확인, 불만 처리 등 민원 처리, 고지사항 전달</li>
            <li><strong className="text-gray-800">서비스 제공:</strong> 커뮤니티 게시판 이용, 중고장터 및 부동산 매물 등록 등 사이트 내 기본 서비스 제공</li>
            <li><strong className="text-gray-800">마케팅 및 광고 (선택 동의 시):</strong> 이벤트 등 광고성 정보 전달, 접속 빈도 파악 또는 회원의 서비스 이용에 대한 통계</li>
          </ul>
        </section>

        {/* 제3조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제3조 (개인정보의 보유 및 이용 기간)</h2>
          <p className="mb-3">사이트는 원칙적으로 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 단, 다음의 정보에 대해서는 아래의 이유로 명시한 기간 동안 보존합니다.</p>
          <div className="space-y-4 text-gray-600 ml-2">
            <div>
              <h3 className="font-bold text-gray-800 mb-1">■ 사이트 내부 방침에 의한 정보 보유 사유</h3>
              <ul className="list-disc pl-5">
                <li><strong className="text-gray-800">부정이용기록</strong> (가입 및 탈퇴를 반복하거나 스팸 활동을 한 기록): 재가입 방지를 위해 1년간 보존</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">■ 관련 법령에 의한 정보 보유 사유</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-gray-800">소비자의 불만 또는 분쟁 처리에 관한 기록:</strong> 3년</li>
                <li><strong className="text-gray-800">웹사이트 방문 기록 (통신비밀보호법):</strong> 3개월</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 제4조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제4조 (개인정보의 파기절차 및 방법)</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li><strong className="text-gray-800">파기 절차:</strong> 회원이 입력한 정보는 목적이 달성된 후 별도의 DB로 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 의한 정보보호 사유에 따라(보유 및 이용 기간 참조) 일정 기간 저장된 후 파기됩니다.</li>
            <li><strong className="text-gray-800">파기 방법:</strong> 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</li>
          </ul>
        </section>

        {/* 제5조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제5조 (개인정보의 제3자 제공 및 위탁)</h2>
          <p className="mb-2">사이트는 회원의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.</p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>회원이 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        {/* 제6조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제6조 (정보주체의 권리 및 행사 방법)</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>회원은 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며 가입 해지(회원 탈퇴)를 요청할 수 있습니다.</li>
            <li>정보 수정 및 탈퇴는 사이트 내 '마이페이지' 또는 '회원 정보 수정' 메뉴를 통해 직접 처리할 수 있습니다.</li>
          </ul>
        </section>

        {/* 제7조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제7조 (개인정보 보호책임자 및 담당자 연락처)</h2>
          <p className="mb-3">사이트는 고객의 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 관련 부서 및 개인정보 보호책임자를 지정하고 있습니다.</p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 space-y-2 shadow-sm">
            <p><strong className="text-gray-900">책임자 이름:</strong> 이송영</p>
            <p><strong className="text-gray-900">이메일:</strong> <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm font-medium">[일단 보류- 추후 도메인 신청하고 메일 계정 생성]</span></p>
            <p><strong className="text-gray-900">카카오톡:</strong> <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-sm font-medium">[카카오톡채널방 생성 후 안내]</span></p>
          </div>
        </section>

      </div>
    </div>
  );
}
