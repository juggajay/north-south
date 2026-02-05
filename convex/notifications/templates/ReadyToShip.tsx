"use node";

import { Html, Text, Link, Container, Section } from "@react-email/components";
import { render } from "@react-email/render";

interface ReadyToShipProps {
  customerName: string;
  orderNumber: string;
  portalUrl: string;
}

export function ReadyToShipEmail({
  customerName,
  orderNumber,
  portalUrl,
}: ReadyToShipProps) {
  return (
    <Html>
      <Container>
        <Section>
          <Text>Hi {customerName},</Text>
          <Text>
            Your order is packed and ready. You'll receive tracking details shortly.
          </Text>
          <Text>
            <Link href={portalUrl}>Track delivery →</Link>
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

export function renderReadyToShip(props: ReadyToShipProps) {
  return {
    html: render(<ReadyToShipEmail {...props} />),
    text: render(<ReadyToShipEmail {...props} />, { plainText: true }),
  };
}
