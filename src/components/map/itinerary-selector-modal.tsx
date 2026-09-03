import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../hooks/useTheme';
import { SavedItineraryOption } from '../../mocks/map.mock';

interface ItinerarySelectorModalProps {
  visible: boolean;
  onClose: () => void;
  itineraries: SavedItineraryOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function ItinerarySelectorModal({
  visible,
  onClose,
  itineraries,
  selectedId,
  onSelect,
}: ItinerarySelectorModalProps) {
  const { colors, typography, borderRadius } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalRoot, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.text} strokeWidth={2}>
              <Path d="M18 6L6 18M6 6l12 12" />
            </Svg>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
            Itinerarios Guardados
          </Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
          {itineraries.map((itin) => {
            const isSelected = itin.id === selectedId;
            return (
              <TouchableOpacity
                key={itin.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderRadius: borderRadius.lg,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  onSelect(itin.id);
                  onClose();
                }}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fonts.bold }]}>
                    {itin.title}
                  </Text>
                  {isSelected && (
                    <View style={[styles.activeBadge, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.activeBadgeText, { fontFamily: typography.fonts.bold }]}>
                        Activo
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.cardTagline, { color: colors.textSecondary, fontFamily: typography.fonts.regular }]}>
                  {itin.tagline}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: colors.textSecondary, fontFamily: typography.fonts.medium }]}>
                    {itin.steps.length} paradas • {itin.totalDistance} • {itin.totalTime}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: { padding: 4 },
  headerTitle: { fontSize: 17 },
  listContent: { padding: 20, gap: 14 },
  card: { padding: 16, borderWidth: 1.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16, flex: 1 },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  activeBadgeText: { color: '#FFF', fontSize: 11 },
  cardTagline: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 12 },
});
