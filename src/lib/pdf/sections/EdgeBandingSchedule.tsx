/**
 * Edge Banding Schedule Section
 *
 * Table showing edge banding requirements by material and color
 */

import { View, Text } from '@react-pdf/renderer';
import { Table, TR, TH, TD } from '@ag-media/react-pdf-table';
import { styles } from '../styles';
import type { EdgeBandingItem } from '../types';

interface EdgeBandingScheduleProps {
  edgeBanding: EdgeBandingItem[];
}

export function EdgeBandingSchedule({ edgeBanding }: EdgeBandingScheduleProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Edge Banding Schedule</Text>
      <Table style={styles.table}>
        <TR style={styles.tableHeader}>
          <TH style={styles.tableHeaderCell}>Material</TH>
          <TH style={styles.tableHeaderCell}>Color</TH>
          <TH style={styles.tableHeaderCell}>Thickness</TH>
          <TH style={styles.tableHeaderCell}>Total Length (mm)</TH>
          <TH style={styles.tableHeaderCell}>Total Length (m)</TH>
        </TR>
        {edgeBanding.map((item, index) => (
          <TR
            key={`${item.material}-${item.color}-${index}`}
            style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}
          >
            <TD style={styles.tableCell}>{item.material}</TD>
            <TD style={styles.tableCell}>{item.color}</TD>
            <TD style={styles.tableCell}>{item.thickness}</TD>
            <TD style={styles.tableCell}>{item.totalLength}</TD>
            <TD style={styles.tableCell}>
              {(item.totalLength / 1000).toFixed(2)}
            </TD>
          </TR>
        ))}
      </Table>
      <View style={styles.spacer} />
    </View>
  );
}
