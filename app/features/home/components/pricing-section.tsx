import { Check } from "lucide-react";
import { motion } from "motion/react";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Card } from "~/core/components/ui/card";
import { ShineBorder } from "~/core/components/ui/shine-border";

const PRICING_PLANS = [
  {
    features: [
      { text: "국내/외 증시 및 부동산 핵심 뉴스 요약" },
      { text: "주요 지표 요약" },
      { text: "메일링 서비스" },
    ],
  },
  {
    features: [
      { text: "국내/외 증시 및 부동산 핵심 뉴스 요약" },
      { text: "주요 지표 요약" },
      { text: "메일링 서비스" },
      { text: "뉴스 데이터 기반 종목별 영향력 요약" },
      { text: "웹 대시보드 FULL 접근 권한" },
      { text: "설정한 종목의 변동성이 클 때 긴급 요약 이메일 알림" },
    ],
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="relative w-full px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          className="mb-12 text-center md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            가장 합리적인 선택
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            필요한 기능만 담았습니다. 지금 바로 시작하세요.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {/* 첫번째 pricing */}
          <Card className="h-full">
            <motion.div
              className="flex h-full flex-col rounded-2xl p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="mb-4 text-sm font-medium">STANDARD</h3>

              <div className="mb-2">
                <span className="text-3xl leading-tight font-semibold whitespace-pre-line md:text-4xl">
                  무료
                </span>
              </div>

              <p className="mb-6 text-xs whitespace-pre-line md:text-sm">
                매일 아침, 핵심 정보만 가볍게 받아보세요
              </p>

              <ul className="mb-8 flex-1 space-y-3">
                {PRICING_PLANS[0].features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <div
                      className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: "#22C55E",
                      }}
                    >
                      <Check size={10} color="#000000" strokeWidth={3} />
                    </div>
                    <span className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line md:text-sm">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Button className="text-md font-semibold">
                기초 루틴 시작하기
              </Button>
            </motion.div>
          </Card>
          {/* 두번째 pricing */}
          <Card className="relative h-full overflow-hidden">
            <ShineBorder
              className="absolute inset-0 z-0"
              borderWidth={2}
              duration={10}
              shineColor={["#2563EB", "#10B981", "#3B82F6"]}
            />
            <motion.div
              className="relative z-10 flex h-full flex-col rounded-2xl p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-sm font-medium">PRO</h3>
                <Badge variant="destructive">Event</Badge>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-semibold whitespace-pre-line md:text-4xl">
                  무료
                </span>
                <span className="text-muted-foreground font-semibold whitespace-pre-line">
                  /월
                </span>
                <span className="text-muted-foreground ml-2 text-lg font-medium whitespace-pre-line line-through md:text-xl">
                  14,900원
                </span>
              </div>

              <p className="mb-6 text-xs whitespace-pre-line md:text-sm">
                압도적인 정보력으로 투자의 차이를 만드세요
              </p>

              <ul className="mb-8 flex-1 space-y-3">
                {PRICING_PLANS[1].features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2">
                    <div
                      className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: "#22C55E",
                      }}
                    >
                      <Check size={10} color="#000000" strokeWidth={3} />
                    </div>
                    <span className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line md:text-sm">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Button className="text-md font-semibold">
                지금 PRO 시작하기
              </Button>
            </motion.div>
          </Card>
        </div>
      </div>
    </section>
  );
}
