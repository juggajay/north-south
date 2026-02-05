/**
 * Hardware List Section
 *
 * Bill of materials for all hardware items (hinges, handles, etc.)
 */

import { View, Text } from '@react-pdf/renderer';
import { Table, TR, TH, TD } from '@ag-media/react-pdf-table';
import { styles } from '../styles';
import type { HardwareItem } from '../types';

interface HardwareListProps {
  hardware: HardwareItem[];
}

export function HardwareList({ hardware }: HardwareListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Hardware List (BOM)</Text>
      <Table style={styles.table}>
        <TR style={styles.tableHeader}>
          <TH style={styles.tableHeaderCell}>Code</TH>
          <TH style={styles.tableHeaderCell}>Description</TH>
          <TH style={styles.tableHeaderCell}>Supplier</TH>
          <TH style={styles.tableHeaderCell}>Qty</TH>
          <TH style={styles.tableHeaderCell}>Notes</TH>
        </TR>
        {hardware.map((item, index) => (
          <TR
            key={`${item.code}-${index}`}
            style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}
          >
            <TD style={styles.tableCell}>{item.code}</TD>
            <TD style={styles.tableCell}>{item.description}</TD>
            <TD style={styles.tableCell}>{item.supplier}</TD>
            <TD style={styles.tableCell}>{item.quantity}</TD>
            <TD style={styles.tableCellSmall}>{item.notes || '—'}</TD>
          </TR>
        ))}
      </Table>
      <View style={styles.spacer} />
    </View>
  );
}
