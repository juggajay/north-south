"use node";

import { Html, Text, Link, Container, Section, Button } from "@react-email/components";
import { render } from "@react-email/render";

interface PostInstallProps {
  customerName: string;
  orderNumber: string;
  portalUrl: string;
  referralUrl: string;
}

export function PostInstallEmail({
  customerName,
  orderNumber,
  portalUrl,
  referralUrl,
}: PostInstallProps) {
  return (
    <Html>
      <Container>
        <Section>
          <Text>Hi {customerName},</Text>
          <Text>
            Hope your new panels are looking great! If you're happy with how they turned out, a quick review really helps us out.
          </Text>
          <Button
            href={portalUrl}
            style={{
              background: "#000",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "4px",
              textDecoration: "none",
              display: "inline-block",
              fontWeight: "bold",
            }}
          >
            Leave a Review
          </Button>
          <Text>
            Know someone planning a kitchen? Share your referral link:
            <br />
            <Link href={referralUrl}>{referralUrl}</Link>
          </Text>
          <Text>
            Cheers,
            <br />
            North South Carpentry
          </Text>
        </Section>
      </Container>
    </Html>
  );
}

export function renderPostInstall(props: PostInstallProps) {
  return {
    html: render(<PostInstallEmail {...props} />),
    text: render(<PostInstallEmail {...props} />, { plainText: true }),
  };
}
