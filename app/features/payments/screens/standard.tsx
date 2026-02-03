import type { Route } from "../../checkout/screens/+types/standard";

import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { Button } from "~/core/components/ui/button";
import { Card } from "~/core/components/ui/card";
import { Input } from "~/core/components/ui/input";
import { PRICING_PLANS } from "~/core/constants/pricing";

export const meta: Route.MetaFunction = () => {
  return [{ title: "Standard Checkout | RichRoutine" }];
};

// export async function loader({ request }: Route.LoaderArgs) {
//   const [client] = makeServerClient(request);
//   await requireAuthentication(client);

//   const {
//     data: { user },
//   } = await client.auth.getUser();

//   return {
//     user,
//   };
// }

export default function StandardCheckout() {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    // In a real app, this would call an API to activate the free trial/plan
    // For now, we'll just simulate success
    navigate("/payments/success");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          STANDARD 요금제 안내
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        {/* Left: Plan Details */}
        <Card className="flex flex-col md:col-span-3">
          <div className="flex flex-1 flex-col rounded-2xl p-6">
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
          </div>
        </Card>

        {/* Right: Subscription Summary & Action */}
        <div className="md:col-span-2">
          <Card>
            <div className="p-8">
              <h3 className="mb-6 text-xl font-bold">구독 요약</h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">선택한 플랜</span>
                  <span className="text-foreground font-medium">
                    {PRICING_PLANS[0].name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">결제 주기</span>
                  <span className="text-foreground font-medium">
                    매월 (무료)
                  </span>
                </div>

                <div className="my-6 border-t" />

                <div className="flex items-end justify-between">
                  <span className="text-base font-semibold">
                    최종 결제 금액
                  </span>
                  <span className="text-primary text-2xl font-bold">0원</span>
                </div>
              </div>
              <Button
                onClick={handleSubscribe}
                size="lg"
                className="mt-8 h-14 w-full text-lg font-bold"
              >
                구독하기
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
