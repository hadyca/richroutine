import type { Route } from "../../checkout/screens/+types/standard";

import { Check } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Card } from "~/core/components/ui/card";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { ShineBorder } from "~/core/components/ui/shine-border";
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
  const [couponCode, setCouponCode] = useState("");

  const handleSubscribe = () => {
    // In a real app, this would call an API to activate the free trial/plan
    // For now, we'll just simulate success
    navigate("/payments/success");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          PRO 요금제 안내
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-5">
        {/* Left: Plan Details */}
        <Card className="relative flex flex-col overflow-hidden md:col-span-3 md:h-full">
          <ShineBorder
            className="absolute inset-0 z-0"
            borderWidth={2}
            duration={10}
            shineColor={["#2563EB", "#10B981", "#3B82F6"]}
          />
          <div className="relative z-10 flex flex-1 flex-col rounded-2xl p-6">
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
          </div>
        </Card>

        {/* Right: Subscription Summary & Action */}
        <div className="md:col-span-2">
          <Card className="flex flex-col md:h-full">
            <div className="p-8">
              <h3 className="mb-6 text-xl font-bold">구독 요약</h3>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">선택한 플랜</span>
                  <span className="text-foreground font-medium">
                    {PRICING_PLANS[1].name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">결제 주기</span>
                  <span className="text-foreground font-medium">매월</span>
                </div>

                <div className="my-6 border-t" />

                {/* <div className="space-y-2">
                  <label className="font-semibold">쿠폰 코드</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="코드를 입력하세요"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="h-10"
                    />
                    <Button variant="outline" className="h-10 shrink-0">
                      적용
                    </Button>
                  </div>
                </div> */}

                <div className="space-y-2">
                  <Label className="flex flex-col items-start gap-1">
                    쿠폰 코드
                  </Label>
                  <div className="flex gap-2">
                    <Input placeholder="코드를 입력하세요" />
                    <Button variant="outline">적용</Button>
                  </div>
                </div>

                <div className="my-6 border-t" />

                <div className="flex items-end justify-between">
                  <span className="font-semibold">최종 결제 금액</span>
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
