"use node";

import { Html, Text, Link, Container, Section } from "@react-email/components";
import { render } from "@react-email/render";

interface OrderConfirmedProps {
  customerName: string;
  orderNumber: string;
  portalUrl: string;
}

export function OrderConfirmedEmail({
  customerName,
  orderNumber,
  portalUrl,
}: OrderConfirmedProps) {
  return (
    <Html>
      <Container>
        <Section>
          <Text>Hi {customerName},</Text>
          <Text>
            Thanks for your order! Deposit received, and your panels are scheduled for production.
          </Text>
          <Text>
            <Link href={portalUrl}>Track your order →</Link>
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

export async function renderOrderConfirmed(props: OrderConfirmedProps) {
  return {
    html: await render(<OrderConfirmedEmail {...props} />),
    text: await render(<OrderConfirmedEmail {...props} />, { plainText: true }),
  };
}
