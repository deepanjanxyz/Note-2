import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Colors from '@/constants/colors';

interface RichTextToolbarProps {
  isBold: boolean;
  isItalic: boolean;
  hasBullets: boolean;
  hasHighlight: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleBullets: () => void;
  onToggleHighlight: () => void;
}

function ToolbarButton({
  active,
  onPress,
  children,
}: {
  active: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.btn, active && styles.btnActive]}
    >
      {children}
    </Pressable>
  );
}

export function RichTextToolbar({
  isBold,
  isItalic,
  hasBullets,
  hasHighlight,
  onToggleBold,
  onToggleItalic,
  onToggleBullets,
  onToggleHighlight,
}: RichTextToolbarProps) {
  return (
    <View style={styles.toolbar}>
      <ToolbarButton active={isBold} onPress={onToggleBold}>
        <MaterialCommunityIcons
          name="format-bold"
          size={20}
          color={isBold ? Colors.dark.accent : Colors.dark.textSecondary}
        />
      </ToolbarButton>
      <ToolbarButton active={isItalic} onPress={onToggleItalic}>
        <MaterialCommunityIcons
          name="format-italic"
          size={20}
          color={isItalic ? Colors.dark.accent : Colors.dark.textSecondary}
        />
      </ToolbarButton>
      <ToolbarButton active={hasBullets} onPress={onToggleBullets}>
        <Ionicons
          name="list"
          size={20}
          color={hasBullets ? Colors.dark.accent : Colors.dark.textSecondary}
        />
      </ToolbarButton>
      <ToolbarButton active={hasHighlight} onPress={onToggleHighlight}>
        <Ionicons
          name="color-fill"
          size={20}
          color={hasHighlight ? Colors.dark.warning : Colors.dark.textSecondary}
        />
      </ToolbarButton>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Colors.dark.glass,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.dark.glassBorder,
  },
  btn: {
    width: 38,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: Colors.dark.accentDim,
  },
});
