import { Check } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Card } from "~/core/components/ui/card";
import { ShineBorder } from "~/core/components/ui/shine-border";
import { PRICING_PLANS } from "~/core/constants/pricing";

export function PricingSection() {
  return (
    <section id="pricing" className="mt-20 w-full px-4">
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 첫번째 pricing */}
          <Card className="flex min-h-[520px] flex-col md:h-full">
            <motion.div
              className="flex flex-1 flex-col rounded-2xl p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="mb-4 text-sm font-medium">
                {PRICING_PLANS[0].name}
              </h3>

              <div className="mb-2">
                <span className="text-3xl font-semibold whitespace-pre-line md:text-4xl">
                  {PRICING_PLANS[0].price}
                </span>
              </div>

              <p className="text-muted-foreground mb-6 text-sm">
                {PRICING_PLANS[0].description}
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
                    <span className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/payments/standard" viewTransition>
                <Button className="text-md w-full font-semibold" size="lg">
                  기초 루틴 시작하기
                </Button>
              </Link>
            </motion.div>
          </Card>

          {/* 두번째 pricing */}
          <Card className="relative flex min-h-[520px] flex-col overflow-hidden md:h-full">
            <ShineBorder
              className="absolute inset-0 z-0"
              borderWidth={2}
              duration={10}
              shineColor={["#2563EB", "#10B981", "#3B82F6"]}
            />
            <motion.div
              className="relative z-10 flex flex-1 flex-col rounded-2xl p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-4 flex items-center gap-2">
                <h3 className="text-sm font-medium">{PRICING_PLANS[1].name}</h3>
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
                  {PRICING_PLANS[1].price}
                </span>
              </div>

              <p className="text-muted-foreground mb-6 text-sm">
                {PRICING_PLANS[1].description}
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
                    <span className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link to="/payments/pro" viewTransition>
                <Button className="text-md w-full font-semibold" size="lg">
                  지금 PRO 시작하기
                </Button>
              </Link>
            </motion.div>
          </Card>
        </div>
      </div>
    </section>
  );
}
