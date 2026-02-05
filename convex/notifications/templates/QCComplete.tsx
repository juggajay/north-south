"use node";

import { Html, Text, Link, Container, Section } from "@react-email/components";
import { render } from "@react-email/render";

interface QCCompleteProps {
  customerName: string;
  orderNumber: string;
  portalUrl: string;
}

export function QCCompleteEmail({
  customerName,
  orderNumber,
  portalUrl,
}: QCCompleteProps) {
  return (
    <Html>
      <Container>
        <Section>
          <Text>Hi {customerName},</Text>
          <Text>
            Your panels passed QC - everything looks great. Getting them ready to ship.
          </Text>
          <Text>
            <Link href={portalUrl}>See photos →</Link>
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

export async function renderQCComplete(props: QCCompleteProps) {
  return {
    html: await render(<QCCompleteEmail {...props} />),
    text: await render(<QCCompleteEmail {...props} />, { plainText: true }),
  };
}
