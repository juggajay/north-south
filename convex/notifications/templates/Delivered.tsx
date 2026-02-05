"use node";

import { Html, Text, Link, Container, Section } from "@react-email/components";
import { render } from "@react-email/render";

interface DeliveredProps {
  customerName: string;
  orderNumber: string;
  portalUrl: string;
}

export function DeliveredEmail({
  customerName,
  orderNumber,
  portalUrl,
}: DeliveredProps) {
  return (
    <Html>
      <Container>
        <Section>
          <Text>Hi {customerName},</Text>
          <Text>
            Your panels have arrived! Check out the installation guides in your portal.
          </Text>
          <Text>
            <Link href={portalUrl}>View guides →</Link>
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

export async function renderDelivered(props: DeliveredProps) {
  return {
    html: await render(<DeliveredEmail {...props} />),
    text: await render(<DeliveredEmail {...props} />, { plainText: true }),
  };
}
