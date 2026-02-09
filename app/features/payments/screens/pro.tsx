import type { Route } from "./+types/pro";

import { Check } from "lucide-react";
import { DateTime } from "luxon";
import { useState } from "react";
import { Form, redirect } from "react-router";
import { useNavigation } from "react-router";

import { SubmitButton } from "~/core/components/submit-button";
import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Card } from "~/core/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/core/components/ui/dialog";
// import { Input } from "~/core/components/ui/input";
// import { Label } from "~/core/components/ui/label";
import { ShineBorder } from "~/core/components/ui/shine-border";
import { PRICING_PLANS } from "~/core/constants/pricing";
import { requireAuthentication } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { getLoggedInUserId } from "~/features/users/queries";

import { createSubscription } from "../mutations";

export const meta: Route.MetaFunction = () => {
  return [{ title: "PRO 요금제 | RichRoutine" }];
};

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAuthentication(client);
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  const [client] = makeServerClient(request);

  const userId = await getLoggedInUserId(client);

  const startedAt = DateTime.now().toJSDate();
  const expiresAt = DateTime.now().plus({ months: 1 }).toJSDate();
  await createSubscription(client, {
    userId,
    subscriptionType: "pro",
    status: "active",
    startedAt,
    expiresAt,
  });
  return redirect("/dashboard");
}

export default function ProPayment() {
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
        <Dialog>
          <Form className="md:col-span-2" method="post" id="subscribe-form">
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
                  <Label className="flex flex-col items-start gap-1">
                    쿠폰 코드
                  </Label>
                  <div className="flex gap-2">
                    <Input placeholder="코드를 입력하세요" />
                    <Button variant="outline">적용</Button>
                  </div>
                </div> */}

                  {/* <div className="my-6 border-t" /> */}

                  <div className="flex items-end justify-between">
                    <span className="font-semibold">최종 결제 금액</span>
                    <span className="text-primary text-2xl font-bold">0원</span>
                  </div>
                </div>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="mt-8 h-14 w-full text-lg font-bold"
                  >
                    구독하기
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle>PRO 구독을 시작하시겠습니까?</DialogTitle>
                    <DialogDescription>
                      PRO 요금제를 1개월 동안 무료로 이용하실 수 있습니다.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">취소</Button>
                    </DialogClose>
                    <SubmitButton form="subscribe-form">구독</SubmitButton>
                  </DialogFooter>
                </DialogContent>
              </div>
            </Card>
          </Form>
        </Dialog>
      </div>
    </div>
  );
}
