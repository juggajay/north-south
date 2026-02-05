/**
 * Cabinet Schedule Section
 *
 * Table showing all cabinets in the order with dimensions and quantities
 */

import { View, Text } from '@react-pdf/renderer';
import { Table, TR, TH, TD } from '@ag-media/react-pdf-table';
import { styles } from '../styles';
import type { CabinetItem } from '../types';

interface CabinetScheduleProps {
  cabinets: CabinetItem[];
}

export function CabinetSchedule({ cabinets }: CabinetScheduleProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Cabinet Schedule</Text>
      <Table style={styles.table}>
        <TR style={styles.tableHeader}>
          <TH style={styles.tableHeaderCell}>Cabinet ID</TH>
          <TH style={styles.tableHeaderCell}>Type</TH>
          <TH style={styles.tableHeaderCell}>Width (mm)</TH>
          <TH style={styles.tableHeaderCell}>Height (mm)</TH>
          <TH style={styles.tableHeaderCell}>Depth (mm)</TH>
          <TH style={styles.tableHeaderCell}>Qty</TH>
        </TR>
        {cabinets.map((cabinet, index) => (
          <TR
            key={cabinet.cabinetId}
            style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}
          >
            <TD style={styles.tableCell}>{cabinet.cabinetId}</TD>
            <TD style={styles.tableCell}>{cabinet.type}</TD>
            <TD style={styles.tableCell}>{cabinet.width}</TD>
            <TD style={styles.tableCell}>{cabinet.height}</TD>
            <TD style={styles.tableCell}>{cabinet.depth}</TD>
            <TD style={styles.tableCell}>{cabinet.quantity}</TD>
          </TR>
        ))}
      </Table>
      <View style={styles.spacer} />
    </View>
  );
}
