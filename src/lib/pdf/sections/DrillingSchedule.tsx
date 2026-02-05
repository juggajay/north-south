/**
 * Drilling Schedule Section
 *
 * Shows drilling requirements for each panel with hole positions
 */

import { View, Text } from '@react-pdf/renderer';
import { Table, TR, TH, TD } from '@ag-media/react-pdf-table';
import { styles } from '../styles';
import type { DrillingItem } from '../types';

interface DrillingScheduleProps {
  drilling: DrillingItem[];
}

export function DrillingSchedule({ drilling }: DrillingScheduleProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Drilling Schedule</Text>
      {drilling.map((item, index) => (
        <View key={`${item.panelId}-${index}`} style={{ marginBottom: 15 }}>
          <View style={styles.row}>
            <Text style={[styles.text, styles.textBold]}>
              Panel: {item.panelId}
            </Text>
            <Text style={styles.textSmall}>
              Cabinet: {item.cabinetId} | Type: {item.panelType}
            </Text>
          </View>

          <Table style={styles.table}>
            <TR style={styles.tableHeader}>
              <TH style={styles.tableHeaderCell}>Hole #</TH>
              <TH style={styles.tableHeaderCell}>X (mm)</TH>
              <TH style={styles.tableHeaderCell}>Y (mm)</TH>
              <TH style={styles.tableHeaderCell}>Ø (mm)</TH>
              <TH style={styles.tableHeaderCell}>Depth (mm)</TH>
              <TH style={styles.tableHeaderCell}>Type</TH>
            </TR>
            {item.holes.map((hole, holeIndex) => (
              <TR
                key={holeIndex}
                style={[
                  styles.tableRow,
                  ...(holeIndex % 2 === 1 ? [styles.tableRowAlt] : []),
                ]}
              >
                <TD style={styles.tableCell}>{holeIndex + 1}</TD>
                <TD style={styles.tableCell}>{hole.x}</TD>
                <TD style={styles.tableCell}>{hole.y}</TD>
                <TD style={styles.tableCell}>{hole.diameter}</TD>
                <TD style={styles.tableCell}>{hole.depth}</TD>
                <TD style={styles.tableCell}>{hole.type}</TD>
              </TR>
            ))}
          </Table>

          {item.notes && (
            <View style={styles.notes}>
              <Text>Note: {item.notes}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
