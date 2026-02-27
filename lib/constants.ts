// lib/constants.ts
export const SITE_NAME = "Phil Life";

export const MENUS = [
  {
    id: "news",
    label: "뉴스/이슈",
    sub: [
      { id: "local", label: "필리핀 뉴스" },
      { id: "notice", label: "교민 소식" },
      { id: "safety", label: "사건/사고" },
    ],
  },
  {
    id: "info",
    label: "정보/팁",
    sub: [
      { id: "visa", label: "비자/이민국" },
      { id: "law", label: "법률/세무" },
      { id: "edu", label: "교육/국제학교" },
      { id: "medical", label: "병원/의료" }, // 신규 추가
      { id: "comm", label: "통신/인터넷" }, // 신규 추가
      { id: "tip", label: "생활 꿀팁" },    // 신규 추가
    ],
  },
  {
    id: "community",
    label: "커뮤니티",
    sub: [
      { id: "free", label: "자유게시판" },
      { id: "qna", label: "질문과 답변" },
      { id: "report", label: "사건사고 제보" }, // 신규 추가
      { id: "couple", label: "코필/다문화" },   // 명칭 확장
      { id: "gallery", label: "포토/영상" },    // 신규 추가
    ],
  },
  {
    id: "estate",
    label: "부동산", // 메인으로 승격
    sub: [
      { id: "sale", label: "매매" },
      { id: "rent", label: "렌트/하숙" },
      { id: "office", label: "상가/사무실" },
      { id: "qna", label: "부동산 Q&A" },
    ],
  },
  {
    id: "market",
    label: "마켓/구인", // 통합됨
    sub: [
      { id: "used", label: "중고장터" },
      { id: "job", label: "구인구직" },
      { id: "exchange", label: "통화/환전" }, // 신규 추가
      { id: "biz", label: "업체 홍보" },
    ],
  },
  {
    id: "travel",
    label: "여행",
    sub: [
      { id: "golf", label: "골프 정보" }, // 여행 하위로 이동
      { id: "hotel", label: "호텔/풀빌라" },
      { id: "food", label: "맛집/마사지" },
      { id: "review", label: "여행 후기" },
    ],
  },
];
