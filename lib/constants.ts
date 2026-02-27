// lib/constants.ts
export const SITE_NAME = "PHIL-LIFE";

export const MENUS = [
  {
    id: "info",
    label: "필리핀 정보",
    sub: [
      { id: "news", label: "뉴스 (종합)" },
      { id: "visa", label: "비자/이민국" },
      { id: "law", label: "법률/세무" },
      { id: "estate", label: "부동산/렌트" },
      { id: "edu", label: "교육/국제학교" },
    ],
  },
  {
    id: "community",
    label: "커뮤니티",
    sub: [
      { id: "free", label: "자유게시판" },
      { id: "qna", label: "질문과 답변" },
      { id: "couple", label: "필코커플" },
      { id: "photo", label: "포토 갤러리" },
    ],
  },
  {
    id: "travel",
    label: "여행/골프",
    sub: [
      { id: "golf", label: "골프/조인" },
      { id: "hotel", label: "호텔/풀빌라" },
      { id: "tour", label: "여행 후기" },
      { id: "food", label: "맛집 탐방" },
    ],
  },
  {
    id: "biz",
    label: "비즈니스/장터",
    sub: [
      { id: "market", label: "중고장터" },
      { id: "job", label: "구인구직" },
      { id: "biz-promo", label: "업체 홍보" },
    ],
  },
];
