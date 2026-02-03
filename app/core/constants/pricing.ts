export const PRICING_PLANS = [
  {
    name: "STANDARD",
    price: "무료",
    description: "매일 아침, 핵심 정보만 가볍게 받아보세요",
    features: [{ text: "과거 국내/외 증시 및 부동산 핵심 뉴스 요약" }],
  },
  {
    name: "PRO",
    price: "9,900원",
    description: "압도적인 정보력으로 투자의 차이를 만드세요",
    features: [
      { text: "매일 아침 국내/외 증시 및 부동산 핵심 뉴스 요약" },
      { text: "메일링 서비스" },
      { text: "뉴스 데이터 기반 종목별 영향력 요약" },
      // { text: "설정한 종목의 변동성이 클 때 긴급 요약 이메일 알림" }, // 추후 추가 예정
    ],
  },
];
