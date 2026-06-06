import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import { ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface PinPadProps {
  correctPin: string;
  onUnlocked: () => void;
}

export function LiquidGlassPinPad({ correctPin, onUnlocked }: PinPadProps) {
  const [inputDigits, setInputDigits] = useState<string>('');
  const [isValidationFailed, setIsValidationFailed] = useState<boolean>(false);

  const registerKeyTap = async (value: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsValidationFailed(false);

    if (value === '⌫') {
      setInputDigits(inputDigits.slice(0, -1));
      return;
    }

    const nextCombination = inputDigits + value;

    if (nextCombination.length <= 4) {
      setInputDigits(nextCombination);
    }

    if (nextCombination.length === 4) {
      if (nextCombination === correctPin) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onUnlocked();
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setIsValidationFailed(true);
        setInputDigits('');
      }
    }
  };

  return (
    <View style={styles.panelContainer}>
      <GlassView glassEffectStyle="thick" style={styles.card}>
        <ShieldCheck color={isValidationFailed ? '#FF3B30' : '#007AFF'} size={40} />
        <Text style={styles.headerTitle}>{isValidationFailed ? 'Key Mismatch' : 'Input Security Master Key'}</Text>

        <View style={styles.beadsRow}>
          {[0, 1, 2, 3].map((pos) => (
            <View
              key={pos}
              style={[
                styles.bead,
                inputDigits.length > pos ? styles.beadFilled : styles.beadEmpty,
                isValidationFailed && styles.beadError
              ]}
            />
          ))}
        </View>

        <View style={styles.matrixGrid}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((character, pointer) => {
            if (character === '') return <View key={pointer} style={styles.emptyCell} />;
            return (
              <TouchableOpacity key={pointer} style={styles.cellButton} onPress={() => registerKeyTap(character)}>
                <Text style={styles.cellTxt}>{character}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  panelContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { width: '100%', padding: 36, borderRadius: 28, alignItems: 'center', gap: 32 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  beadsRow: { flexDirection: 'row', gap: 20 },
  bead: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  beadFilled: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  beadEmpty: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.25)' },
  beadError: { backgroundColor: '#FF3B30', borderColor: '#FF3B30' },
  matrixGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 250, justifyContent: 'center', gap: 14 },
  cellButton: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  emptyCell: { width: 68, height: 68 },
  cellTxt: { color: '#FFF', fontSize: 22, fontWeight: '500' }
});
