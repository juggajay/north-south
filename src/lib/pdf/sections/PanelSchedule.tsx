/**
 * Panel Schedule Section
 *
 * Cutting list showing all panels with dimensions and materials
 */

import { View, Text } from '@react-pdf/renderer';
import { Table, TR, TH, TD } from '@ag-media/react-pdf-table';
import { styles } from '../styles';
import type { PanelItem } from '../types';

interface PanelScheduleProps {
  panels: PanelItem[];
}

export function PanelSchedule({ panels }: PanelScheduleProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Panel Schedule (Cutting List)</Text>
      <Table style={styles.table}>
        <TR style={styles.tableHeader}>
          <TH style={styles.tableHeaderCell}>Panel ID</TH>
          <TH style={styles.tableHeaderCell}>Cabinet</TH>
          <TH style={styles.tableHeaderCell}>Type</TH>
          <TH style={styles.tableHeaderCell}>Material</TH>
          <TH style={styles.tableHeaderCell}>W × H (mm)</TH>
          <TH style={styles.tableHeaderCell}>Thick</TH>
          <TH style={styles.tableHeaderCell}>Qty</TH>
          <TH style={styles.tableHeaderCell}>QR</TH>
        </TR>
        {panels.map((panel, index) => (
          <TR
            key={panel.panelId}
            style={[styles.tableRow, ...(index % 2 === 1 ? [styles.tableRowAlt] : [])]}
          >
            <TD style={styles.tableCell}>{panel.panelId}</TD>
            <TD style={styles.tableCell}>{panel.cabinetId}</TD>
            <TD style={styles.tableCell}>{panel.type}</TD>
            <TD style={styles.tableCell}>{panel.material}</TD>
            <TD style={styles.tableCell}>
              {panel.width} × {panel.height}
            </TD>
            <TD style={styles.tableCell}>{panel.thickness}mm</TD>
            <TD style={styles.tableCell}>{panel.quantity}</TD>
            <TD style={styles.tableCellSmall}>{panel.qrCode}</TD>
          </TR>
        ))}
      </Table>
      <View style={styles.spacer} />
    </View>
  );
}
