/**
 * Assembly Groups Section
 *
 * Shows which panels form each cabinet with assembly instructions
 */

import { View, Text } from '@react-pdf/renderer';
import { Table, TR, TH, TD } from '@ag-media/react-pdf-table';
import { styles } from '../styles';
import type { AssemblyGroup } from '../types';

interface AssemblyGroupsProps {
  assembly: AssemblyGroup[];
}

export function AssemblyGroups({ assembly }: AssemblyGroupsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Assembly Groups</Text>
      {assembly.map((group, index) => (
        <View key={`${group.cabinetId}-${index}`} style={{ marginBottom: 20 }}>
          <View style={styles.row}>
            <Text style={[styles.text, styles.textBold]}>
              Cabinet: {group.cabinetId}
            </Text>
            <Text style={styles.textSmall}>Type: {group.cabinetType}</Text>
          </View>

          {/* Panel table */}
          <View style={{ marginTop: 8, marginBottom: 8 }}>
            <Text style={[styles.textSmall, styles.textBold, { marginBottom: 4 }]}>
              Panels:
            </Text>
            <Table style={styles.table}>
              <TR style={styles.tableHeader}>
                <TH style={styles.tableHeaderCell}>Panel ID</TH>
                <TH style={styles.tableHeaderCell}>Role</TH>
              </TR>
              {group.panels.map((panel, panelIndex) => (
                <TR
                  key={panel.panelId}
                  style={[
                    styles.tableRow,
                    ...(panelIndex % 2 === 1 ? [styles.tableRowAlt] : []),
                  ]}
                >
                  <TD style={styles.tableCell}>{panel.panelId}</TD>
                  <TD style={styles.tableCell}>{panel.role}</TD>
                </TR>
              ))}
            </Table>
          </View>

          {/* Hardware list */}
          {group.hardware.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={[styles.textSmall, styles.textBold]}>
                Required Hardware:
              </Text>
              <Text style={styles.textSmall}>
                {group.hardware.join(', ')}
              </Text>
            </View>
          )}

          {/* Assembly order */}
          {group.assemblyOrder && group.assemblyOrder.length > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text style={[styles.textSmall, styles.textBold]}>
                Assembly Order:
              </Text>
              {group.assemblyOrder.map((step, stepIndex) => (
                <Text key={stepIndex} style={styles.textSmall}>
                  {stepIndex + 1}. {step}
                </Text>
              ))}
            </View>
          )}

          {/* Notes */}
          {group.notes && (
            <View style={styles.notes}>
              <Text>Note: {group.notes}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
