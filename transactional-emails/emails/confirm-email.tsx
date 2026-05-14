import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export default function ConfirmEmail() {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body className="bg-white font-sans">
          <Preview>RichRoutine에 오신 것을 환영합니다!</Preview>
          <Container className="mx-auto max-w-[560px] py-5 pb-12">
            <Heading className="pt-4 text-center text-2xl leading-tight font-normal tracking-[-0.5px] text-black">
              RichRoutine에 오신 것을 환영합니다!
            </Heading>
            <Section>
              <Text className="mb-4 text-[15px] leading-relaxed text-black">
                안녕하세요.
              </Text>
              <Text className="mb-4 text-[15px] leading-relaxed text-black">
                매일 아침 RichRoutine과 함께 하세요!
              </Text>
              <Button
                className="block rounded-xl bg-black px-6 py-3 text-center text-[15px] font-semibold text-white no-underline"
                href={`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/`}
              >
                로그인
              </Button>
            </Section>
            <Section>
              <Text className="mb-4 text-[15px] leading-relaxed text-black">
                버튼이 작동하지 않으면 아래 URL을 복사하여 브라우저에
                입력해주세요:
              </Text>
              <Text className="mb-4 text-[15px] leading-relaxed text-blue-500">
                {`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/`}
              </Text>
              <Text className="mb-4 text-[15px] leading-relaxed text-black">
                RichRoutine에 계정을 생성하지 않았다면 이 이메일을 무시해주세요.
              </Text>
              <Text className="mb-4 text-[15px] leading-relaxed text-black">
                RichRoutine Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
