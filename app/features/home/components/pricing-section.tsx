import { Check } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "~/core/components/ui/button";
import { Card } from "~/core/components/ui/card";

const PRICING_PLANS = [
  {
    id: "standard",
    name: "Standard",
    price: "무료",
    description: "Pay-once license for you.",
    features: [
      { text: "1 macOS device", included: true },
      { text: "Pay once, use forever", included: true },
      { text: "All Screen Studio features", included: true },
      { text: "1 year of updates", included: true },
    ],
    buttonText: "Get Started",
  },
  {
    id: "extended",
    name: "Extended",
    price: "4,900원",
    description: "Great for multi-devices setups &\nsmall teams.",
    features: [
      { text: "3 macOS devices", included: true },
      { text: "Pay once, use forever", included: true },
      { text: "All Screen Studio features", included: true },
      { text: "1 year of updates", included: true },
    ],
    buttonText: "Get Started",
  },
];

export function PricingSection() {
  return (
    <section className="relative w-full px-4 py-16 md:py-24">
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
          {PRICING_PLANS.map((plan, index) => (
            <Card key={plan.id} className="h-full">
              <motion.div
                className="flex h-full flex-col rounded-2xl p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* Plan Name */}
                <h3 className="mb-4 text-sm font-medium">{plan.name}</h3>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-3xl leading-tight font-semibold whitespace-pre-line md:text-4xl">
                    {plan.price}
                  </span>
                </div>

                {/* Description */}
                <p className="mb-6 text-xs whitespace-pre-line md:text-sm">
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
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
                <Button>버튼</Button>
              </motion.div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
