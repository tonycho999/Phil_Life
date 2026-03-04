export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-10 min-h-[500px] my-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
        필카페24 (PhilCafe24) 서비스 이용약관
      </h1>
      
      <div className="text-gray-700 space-y-8 leading-relaxed text-sm md:text-base">
        
        {/* 제1조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제1조 (목적)</h2>
          <p>
            본 약관은 '필카페24'(이하 '회사' 또는 '사이트')가 제공하는 인터넷 관련 서비스(이하 '서비스')를 이용함에 있어, 사이트와 회원 간의 권리, 의무 및 책임 사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        {/* 제2조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제2조 (용어의 정의)</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>'회원'이라 함은 사이트에 접속하여 본 약관에 동의하고 가입 절차를 마친 자로서, 사이트가 제공하는 서비스를 이용할 수 있는 자를 말합니다.</li>
            <li>'게시물'이라 함은 회원이 서비스를 이용함에 있어 사이트 상에 게시한 부호, 문자, 음성, 음향, 화상, 동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미합니다.</li>
          </ul>
        </section>

        {/* 제3조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제3조 (회원의 의무 및 활동 규범)</h2>
          <p className="mb-3 text-red-600 font-medium text-sm">
            ※ 회원은 다음 각 호의 행위를 하여서는 안 되며, 적발 시 사전 통보 없이 게시물 삭제, 이용 정지 또는 영구 강제 탈퇴 조치가 취해질 수 있습니다.
          </p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-600 bg-gray-50 p-4 rounded-lg border border-gray-100">
            <li>타인의 정보 도용 및 허위 사실 기재</li>
            <li>
              <strong className="text-red-500">[필리핀 커뮤니티 특화]</strong> 불법 환전, 불법 도박(카지노, 아바타 등), 성매매 알선 등 대한민국 및 필리핀 현지 법률에 위반되는 행위의 조장 및 홍보
            </li>
            <li>사이트 내 중고장터, 부동산 거래 등에서 발생하는 사기 행위</li>
            <li>특정 개인, 단체, 종교, 인종에 대한 비방, 욕설, 명예훼손 및 모욕 행위</li>
            <li>회사의 동의 없는 영리 목적의 광고, 스팸성 게시물 도배 행위</li>
            <li>기타 선량한 풍속, 기타 사회질서에 반하는 행위</li>
          </ol>
        </section>

        {/* 제4조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제4조 (게시물의 권리 및 관리)</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>회원이 작성한 게시물의 저작권은 회원 본인에게 있으며, 게시물로 인해 발생하는 모든 민·형사상의 책임은 작성자 본인에게 있습니다.</li>
            <li>사이트는 회원의 게시물을 서비스 운영, 홍보 등의 목적으로 복제, 전송, 배포할 수 있는 무상 사용권을 가집니다.</li>
            <li>사이트는 제3조(회원의 의무)에 위배되는 게시물이나 신고가 접수된 게시물에 대해 임의로 블라인드 처리, 삭제 등의 조치를 취할 수 있습니다.</li>
          </ul>
        </section>

        {/* 제5조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제5조 (개인 간 거래에 대한 면책 및 손해배상)</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>사이트는 회원 간의 자발적인 통신 및 거래(중고마켓, 구인구직, 부동산 매물 등)에 대하여 어떠한 보증도 하지 않습니다.</li>
            <li>회원 간 발생한 금전적, 정신적 피해 및 분쟁에 대해 사이트는 일체의 법적 책임을 지지 않습니다. 거래 시 발생하는 위험은 당사자들이 부담해야 합니다.</li>
            <li>사이트는 천재지변, 디도스(DDoS) 공격, 서버 장애 등 불가항력적인 사유로 서비스를 제공할 수 없는 경우 서비스 제공에 대한 책임이 면제됩니다.</li>
          </ul>
        </section>

        {/* 제6조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제6조 (서비스의 변경 및 중지)</h2>
          <p>
            사이트는 원활한 서비스 제공을 위해 시스템 점검, 교체 및 고장, 통신두절 등의 사유가 발생한 경우 서비스의 제공을 일시적으로 중단할 수 있으며, 이 경우 사전에 공지사항을 통해 안내합니다.
          </p>
        </section>

        {/* 제7조 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제7조 (기타)</h2>
          <p>
            본 약관에 명시되지 않은 사항은 대한민국의 관계 법령 및 상관례에 따릅니다.
          </p>
        </section>

      </div>
    </div>
  );
}
