// lib/constants.ts
export const SITE_NAME = "Phil Life";

export const GRADE_LEVELS: Record<string, number> = {
  "관리자": 99,
  "운영자": 10,
  "우수회원": 3,
  "정회원": 2,
  "새싹": 1,
};

export type SubMenu = {
  id: string;
  label: string;
};

export type MainMenu = {
  id: string;
  label: string;
  sub: SubMenu[]; // 배열임을 명시
};

export const MENUS = [
  {
    id: "news",
    label: "뉴스/이슈",
    sub: [
      { id: "local", label: "필리핀 뉴스" },
      { id: "notice", label: "교민 소식" }, // 대사관, 한인회
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
      { id: "medical", label: "병원/의료" }, // ★ 강력 추천 반영
      { id: "comm", label: "통신/인터넷" }, // ★ 로드/유심 등
      { id: "tip", label: "생활 꿀팁" },
    ],
  },
  {
    id: "community",
    label: "커뮤니티",
    sub: [
      { id: "free", label: "자유게시판" },
      { id: "qna", label: "질문과 답변" },
      { id: "report", label: "사건제보" },
      { id: "couple", label: "코필/다문화" },
    ],
  },
  {
    id: "estate",
    label: "부동산",
    sub: [
      { id: "sale", label: "매매/분양" },
      { id: "rent", label: "렌트/하숙" },
      { id: "office", label: "상가/사무실" },
      { id: "qna", label: "부동산 Q&A" },
    ],
  },
  {
    id: "market",
    label: "마켓/구인",
    sub: [
      { id: "used", label: "중고장터" },
      { id: "job", label: "구인구직" },
      { id: "exchange", label: "통화/환전" }, // ★ 인기 메뉴
    ],
  },
  {
    id: "travel",
    label: "여행",
    sub: [
      { id: "golf", label: "골프 정보" },
      { id: "hotel", label: "호텔/풀빌라" },
      { id: "food", label: "맛집/마사지" }, // 여행객 관점
      { id: "review", label: "여행 후기" },
    ],
  },
  {
    id: "biz",
    label: "교민업체", // ★ 신규 추가
    sub: [
      { id: "food", label: "식당/식품" },
      { id: "beauty", label: "마사지/뷰티" },
      { id: "service", label: "생활/서비스" },
      { id: "promo", label: "업체 홍보/등록" }, // ★ 추천 명칭 적용
    ],
  },
];
