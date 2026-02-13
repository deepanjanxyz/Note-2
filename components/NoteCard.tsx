import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { Note } from '@/lib/storage';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
}

const categoryIcons: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  Work: { name: 'briefcase', color: '#00E0FF' },
  Personal: { name: 'heart', color: '#F87171' },
  Ideas: { name: 'bulb', color: '#FBBF24' },
  General: { name: 'document-text', color: '#7B61FF' },
  Archive: { name: 'archive', color: '#8B95B0' },
};

export function NoteCard({ note, onPress, onDelete }: NoteCardProps) {
  const catInfo = categoryIcons[note.category] || categoryIcons.General;
  const preview = note.content.length > 80 ? note.content.substring(0, 80) + '...' : note.content;
  const dateStr = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: catInfo.color + '18' }]}>
          <Ionicons name={catInfo.name} size={14} color={catInfo.color} />
          <Text style={[styles.categoryText, { color: catInfo.color }]}>{note.category}</Text>
        </View>
        <Pressable onPress={onDelete} hitSlop={12} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={16} color={Colors.dark.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.title} numberOfLines={1}>{note.title || 'Untitled'}</Text>
      {preview ? <Text style={styles.preview} numberOfLines={2}>{preview}</Text> : null}
      <View style={styles.footer}>
        <Text style={styles.date}>{dateStr}</Text>
        <View style={styles.badges}>
          {note.isBold && <View style={styles.formatBadge}><Text style={styles.formatText}>B</Text></View>}
          {note.isItalic && <View style={styles.formatBadge}><Text style={[styles.formatText, { fontStyle: 'italic' as const }]}>I</Text></View>}
          {note.hasHighlight && <Ionicons name="color-fill" size={12} color={Colors.dark.warning} />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.glass,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.glassBorder,
    padding: 16,
    marginBottom: 12,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
  deleteBtn: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  preview: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    lineHeight: 19,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  formatBadge: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: Colors.dark.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.accent,
  },
});
