import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { GlassCard } from '@/components/GlassCard';
import { summarizeText, correctGrammar } from '@/lib/ai-service';
import Colors from '@/constants/colors';

interface AIPanelProps {
  noteContent: string;
  onApplyText: (text: string) => void;
  onClose: () => void;
}

export function AIPanel({ noteContent, onApplyText, onClose }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState<'summarize' | 'grammar'>('summarize');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAction() {
    if (!noteContent.trim()) {
      setError('Write some content first to use AI features.');
      return;
    }
    setLoading(true);
    setError('');
    setResult('');

    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      const res = activeTab === 'summarize'
        ? await summarizeText(noteContent)
        : await correctGrammar(noteContent);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'AI request failed. Check your API key.');
    } finally {
      setLoading(false);
    }
  }

  function handleApply() {
    if (result) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      onApplyText(result);
    }
  }

  return (
    <GlassCard style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="robot" size={20} color={Colors.dark.accent} />
          <Text style={styles.headerTitle}>AI Assistant</Text>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={20} color={Colors.dark.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => { setActiveTab('summarize'); setResult(''); setError(''); }}
          style={[styles.tab, activeTab === 'summarize' && styles.tabActive]}
        >
          <Ionicons
            name="sparkles"
            size={16}
            color={activeTab === 'summarize' ? Colors.dark.accent : Colors.dark.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'summarize' && styles.tabTextActive]}>
            Summarize
          </Text>
        </Pressable>
        <Pressable
          onPress={() => { setActiveTab('grammar'); setResult(''); setError(''); }}
          style={[styles.tab, activeTab === 'grammar' && styles.tabActive]}
        >
          <MaterialCommunityIcons
            name="spellcheck"
            size={16}
            color={activeTab === 'grammar' ? Colors.dark.secondary : Colors.dark.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'grammar' && styles.tabTextActive]}>
            Grammar
          </Text>
        </Pressable>
      </View>

      <Pressable
        onPress={handleAction}
        disabled={loading}
        style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed, loading && styles.actionBtnDisabled]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.dark.background} />
        ) : (
          <>
            <Ionicons name="flash" size={16} color={Colors.dark.background} />
            <Text style={styles.actionText}>
              {activeTab === 'summarize' ? 'Summarize Note' : 'Fix Grammar'}
            </Text>
          </>
        )}
      </Pressable>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={14} color={Colors.dark.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {result ? (
        <View style={styles.resultBox}>
          <ScrollView style={styles.resultScroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.resultText}>{result}</Text>
          </ScrollView>
          {activeTab === 'grammar' && (
            <Pressable onPress={handleApply} style={styles.applyBtn}>
              <Ionicons name="checkmark" size={16} color={Colors.dark.background} />
              <Text style={styles.applyText}>Apply Changes</Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.dark.inputBg,
  },
  tabActive: {
    backgroundColor: Colors.dark.accentDim,
    borderWidth: 1,
    borderColor: Colors.dark.glassBorder,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.textMuted,
  },
  tabTextActive: {
    color: Colors.dark.accent,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dark.accent,
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionBtnPressed: {
    opacity: 0.85,
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.background,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(248, 113, 113, 0.1)',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.error,
  },
  resultBox: {
    marginTop: 10,
    backgroundColor: Colors.dark.inputBg,
    borderRadius: 12,
    padding: 12,
    maxHeight: 200,
  },
  resultScroll: {
    maxHeight: 150,
  },
  resultText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
    lineHeight: 20,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: Colors.dark.success,
    borderRadius: 10,
    paddingVertical: 8,
  },
  applyText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.background,
  },
});
