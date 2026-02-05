/**
 * Header Section for Production Spec PDF
 *
 * Displays order information at the top of the document
 */

import { View, Text } from '@react-pdf/renderer';
import { styles } from '../styles';
import type { OrderInfo } from '../types';

interface HeaderSectionProps {
  order: OrderInfo;
}

export function HeaderSection({ order }: HeaderSectionProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Production Specification</Text>
      <View style={styles.row}>
        <Text style={styles.headerSubtitle}>Order: {order.orderNumber}</Text>
        <Text style={styles.headerSubtitle}>Date: {order.orderDate}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.headerSubtitle}>Customer: {order.customerName}</Text>
        {order.dueDate && (
          <Text style={styles.headerSubtitle}>Due: {order.dueDate}</Text>
        )}
      </View>
    </View>
  );
}
