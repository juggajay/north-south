"use node";

import { Html, Text, Link, Container, Section } from "@react-email/components";
import { render } from "@react-email/render";

interface ProductionStartedProps {
  customerName: string;
  orderNumber: string;
  portalUrl: string;
}

export function ProductionStartedEmail({
  customerName,
  orderNumber,
  portalUrl,
}: ProductionStartedProps) {
  return (
    <Html>
      <Container>
        <Section>
          <Text>Hi {customerName},</Text>
          <Text>
            Your panels are being cut today! We'll send photos as they come together.
          </Text>
          <Text>
            <Link href={portalUrl}>View progress →</Link>
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

export async function renderProductionStarted(props: ProductionStartedProps) {
  return {
    html: await render(<ProductionStartedEmail {...props} />),
    text: await render(<ProductionStartedEmail {...props} />, { plainText: true }),
  };
}
