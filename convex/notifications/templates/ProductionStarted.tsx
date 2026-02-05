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

export function renderProductionStarted(props: ProductionStartedProps) {
  return {
    html: render(<ProductionStartedEmail {...props} />),
    text: render(<ProductionStartedEmail {...props} />, { plainText: true }),
  };
}
