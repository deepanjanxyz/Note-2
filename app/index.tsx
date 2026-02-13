import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { BiometricLock } from '@/components/BiometricLock';
import { Sidebar } from '@/components/Sidebar';
import { NoteCard } from '@/components/NoteCard';
import { Logo } from '@/components/Logo';
import Colors from '@/constants/colors';
import { getAllNotes, deleteNote, type Note } from '@/lib/storage';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;
  const webBottomInset = Platform.OS === 'web' ? 34 : 0;

  const [locked, setLocked] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const sidebarAnim = useSharedValue(0);

  const loadNotes = useCallback(async () => {
    try {
      const data = await getAllNotes();
      setNotes(data);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!locked) {
      loadNotes();
    }
  }, [locked, loadNotes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotes();
  }, [loadNotes]);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (selectedCategory !== 'All') {
      result = result.filter(n => n.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
      );
    }
    return result;
  }, [notes, selectedCategory, search]);

  const noteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach(n => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });
    return counts;
  }, [notes]);

  function handleUnlock() {
    setLocked(false);
  }

  async function handleDelete(id: string) {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }

  function openSidebar() {
    setSidebarVisible(true);
    sidebarAnim.value = withTiming(1, { duration: 250 });
  }

  function closeSidebar() {
    sidebarAnim.value = withTiming(0, { duration: 200 });
    setTimeout(() => setSidebarVisible(false), 200);
  }

  function handleSelectCategory(cat: string) {
    setSelectedCategory(cat);
    closeSidebar();
  }

  function handleCreateNote() {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({ pathname: '/editor', params: { noteId: '' } });
  }

  function handleOpenNote(id: string) {
    router.push({ pathname: '/editor', params: { noteId: id } });
  }

  const sidebarOverlayStyle = useAnimatedStyle(() => ({
    opacity: sidebarAnim.value * 0.5,
  }));

  const sidebarSlideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (1 - sidebarAnim.value) * -280 }],
  }));

  if (locked) {
    return <BiometricLock onUnlock={handleUnlock} />;
  }

  const renderItem = ({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      onPress={() => handleOpenNote(item.id)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  const emptyComponent = (
    <View style={styles.emptyState}>
      <Ionicons name="document-text-outline" size={48} color={Colors.dark.textMuted} />
      <Text style={styles.emptyTitle}>No notes yet</Text>
      <Text style={styles.emptySubtitle}>
        {selectedCategory !== 'All'
          ? `No notes in ${selectedCategory}`
          : 'Tap + to create your first note'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + webTopInset }]}>
      <Animated.View entering={FadeIn.duration(400)}>
        <View style={styles.header}>
          <Pressable onPress={openSidebar} hitSlop={12} style={styles.menuBtn}>
            <Ionicons name="menu" size={24} color={Colors.dark.text} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Logo size={28} />
            <Text style={styles.headerTitle}>NeuronPad</Text>
          </View>
          <Pressable onPress={handleCreateNote} hitSlop={12} style={styles.addBtn}>
            <Ionicons name="add" size={24} color={Colors.dark.background} />
          </Pressable>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={Colors.dark.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor={Colors.dark.textMuted}
            value={search}
            onChangeText={setSearch}
            autoCorrect={false}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.dark.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {selectedCategory !== 'All' && (
          <View style={styles.filterBar}>
            <Text style={styles.filterLabel}>{selectedCategory}</Text>
            <Pressable onPress={() => setSelectedCategory('All')}>
              <Ionicons name="close" size={16} color={Colors.dark.textSecondary} />
            </Pressable>
          </View>
        )}
      </Animated.View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + webBottomInset + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={emptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.dark.accent}
            />
          }
        />
      )}

      <Pressable
        onPress={handleCreateNote}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + webBottomInset + 24 },
          pressed && styles.fabPressed,
        ]}
      >
        <Ionicons name="add" size={28} color={Colors.dark.background} />
      </Pressable>

      <Modal
        visible={sidebarVisible}
        transparent
        animationType="none"
        onRequestClose={closeSidebar}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSidebar}>
            <Animated.View style={[StyleSheet.absoluteFill, styles.overlayBg, sidebarOverlayStyle]} />
          </Pressable>
          <Animated.View style={[styles.sidebarContainer, sidebarSlideStyle]}>
            <Sidebar
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              noteCounts={noteCounts}
              onClose={closeSidebar}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.dark.glass,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.glassBorder,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.text,
    padding: 0,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.dark.accentDim,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  filterLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.accent,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textSecondary,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  overlayBg: {
    backgroundColor: '#000',
  },
  sidebarContainer: {
    width: 280,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
});
