import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/Logo';
import Colors from '@/constants/colors';

interface SidebarProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  noteCounts: Record<string, number>;
  onClose: () => void;
}

const categories = [
  { key: 'All', icon: 'layers-outline' as const, color: Colors.dark.accent },
  { key: 'Work', icon: 'briefcase-outline' as const, color: '#00E0FF' },
  { key: 'Personal', icon: 'heart-outline' as const, color: '#F87171' },
  { key: 'Ideas', icon: 'bulb-outline' as const, color: '#FBBF24' },
  { key: 'General', icon: 'document-text-outline' as const, color: '#7B61FF' },
];

export function Sidebar({ selectedCategory, onSelectCategory, noteCounts, onClose }: SidebarProps) {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset + 16 }]}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <Logo size={32} />
          <Text style={styles.brand}>NeuronPad</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={24} color={Colors.dark.textSecondary} />
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>SMART FOLDERS</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const count = cat.key === 'All'
            ? Object.values(noteCounts).reduce((a, b) => a + b, 0)
            : (noteCounts[cat.key] || 0);

          return (
            <Pressable
              key={cat.key}
              onPress={() => onSelectCategory(cat.key)}
              style={[styles.item, isSelected && styles.itemSelected]}
            >
              <View style={[styles.iconWrap, { backgroundColor: cat.color + '18' }]}>
                <Ionicons name={cat.icon} size={18} color={cat.color} />
              </View>
              <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                {cat.key}
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 0) + 16 }]}>
        <View style={styles.footerLine} />
        <Text style={styles.footerText}>AI-Powered Notes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brand: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textMuted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    gap: 12,
  },
  itemSelected: {
    backgroundColor: Colors.dark.accentDim,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.textSecondary,
  },
  itemTextSelected: {
    color: Colors.dark.accent,
  },
  countBadge: {
    backgroundColor: Colors.dark.glassBorder,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textMuted,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: Colors.dark.divider,
  },
  footerText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
});
