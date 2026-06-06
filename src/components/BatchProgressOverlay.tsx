import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GlassView } from 'expo-glass-effect';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, interpolate } from 'react-native-reanimated';
import { Cpu } from 'lucide-react-native';

interface OverlayProps {
  isVisible: boolean;
}

export function BatchProgressOverlay({ isVisible }: OverlayProps) {
  const rotationValue = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      rotationValue.value = withRepeat(withTiming(1, { duration: 1800 }), -1, false);
    }
  }, [isVisible]);

  const spinningAnimation = useAnimatedStyle(() => {
    const spin = interpolate(rotationValue.value, [0, 1], [0, 360]);
    return { transform: [{ rotate: `${spin}deg` }] };
  });

  if (!isVisible) return null;

  return (
    <View style={styles.viewportShield}>
      <GlassView glassEffectStyle="thick" style={styles.cardContainer}>
        <Animated.View style={spinningAnimation}>
          <Cpu color="#007AFF" size={36} />
        </Animated.View>
        <View style={styles.metaBlock}>
          <Text style={styles.primeTxt}>Neural Texture Merging</Text>
          <Text style={styles.subTxt}>Executing multi-exposure binarization & alignment...</Text>
        </View>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  viewportShield: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  cardContainer: { padding: 24, borderRadius: 24, width: '85%', flexDirection: 'row', alignItems: 'center', gap: 18 },
  metaBlock: { flex: 1 },
  primeTxt: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  subTxt: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 }
});
