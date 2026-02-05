/**
 * Shared styles for Production Spec PDF
 *
 * Uses zinc color scheme consistent with the app theme
 */

import { StyleSheet } from '@react-pdf/renderer';

/**
 * Zinc color palette (matching tailwind zinc)
 */
const colors = {
  zinc50: '#fafafa',
  zinc100: '#f4f4f5',
  zinc200: '#e4e4e7',
  zinc300: '#d4d4d8',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  zinc600: '#52525b',
  zinc700: '#3f3f46',
  zinc800: '#27272a',
  zinc900: '#18181b',
  white: '#ffffff',
  black: '#000000',
};

/**
 * Shared PDF styles
 */
export const styles = StyleSheet.create({
  // Page layout
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: colors.white,
    color: colors.zinc900,
  },

  // Header section
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: `2pt solid ${colors.zinc900}`,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.zinc900,
  },
  headerSubtitle: {
    fontSize: 10,
    color: colors.zinc600,
    marginBottom: 4,
  },

  // Section layout
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.zinc900,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionDivider: {
    borderBottom: `1pt solid ${colors.zinc300}`,
    marginBottom: 10,
  },

  // Table styles (for @ag-media/react-pdf-table)
  table: {
    width: '100%',
  },
  tableHeader: {
    backgroundColor: colors.zinc800,
    color: colors.white,
    fontWeight: 'bold',
    padding: 6,
  },
  tableHeaderCell: {
    padding: 6,
    fontSize: 9,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `1pt solid ${colors.zinc200}`,
  },
  tableRowAlt: {
    backgroundColor: colors.zinc50,
  },
  tableCell: {
    padding: 6,
    fontSize: 9,
    color: colors.zinc900,
  },
  tableCellSmall: {
    padding: 4,
    fontSize: 8,
    color: colors.zinc700,
  },

  // Text styles
  text: {
    fontSize: 10,
    color: colors.zinc900,
  },
  textSmall: {
    fontSize: 8,
    color: colors.zinc600,
  },
  textBold: {
    fontWeight: 'bold',
  },
  textMuted: {
    color: colors.zinc500,
  },

  // Layout helpers
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  column: {
    flexDirection: 'column',
  },
  spacer: {
    marginBottom: 10,
  },

  // Notes
  notes: {
    backgroundColor: colors.zinc100,
    padding: 8,
    marginTop: 4,
    fontSize: 8,
    color: colors.zinc700,
    fontStyle: 'italic',
  },

  // QR code placeholder
  qrCodePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: colors.zinc200,
    border: `1pt solid ${colors.zinc400}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { colors };
