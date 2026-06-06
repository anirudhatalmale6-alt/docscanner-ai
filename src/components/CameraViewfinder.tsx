import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';

interface ViewfinderProps {
  onScanReady: (files: { dark: string; neutral: string; bright: string }) => void;
}

export function CameraViewfinder({ onScanReady }: ViewfinderProps) {
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const animationPosition = useSharedValue(-100);

  useEffect(() => {
    if (permission?.granted) {
      animationPosition.value = withRepeat(
        withSequence(withTiming(450, { duration: 2200 }), withTiming(-100, { duration: 2200 })),
        -1,
        false
      );
    }
  }, [permission]);

  const laserStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: animationPosition.value }]
  }));

  if (!permission) return <View style={styles.blackout} />;

  if (!permission.granted) {
    return (
      <View style={styles.blackout}>
        <Text style={styles.alertTxt}>Provide camera peripheral authorizations to operate scanning array.</Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantTxt}>Initialize Hardware</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const fireBracketingShutterBurst = async () => {
    if (!camera.current) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    try {
      const img1 = await camera.current.takePictureAsync({ quality: 0.7, skipProcessing: false });
      const img2 = await camera.current.takePictureAsync({ quality: 0.7 });
      const img3 = await camera.current.takePictureAsync({ quality: 0.7 });
      if (img1 && img2 && img3) {
        onScanReady({ dark: img1.uri, neutral: img2.uri, bright: img3.uri });
      }
    } catch (e) {
      console.error("Camera transaction pipeline collision: ", e);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFill} ref={camera} facing="back">
        <Animated.View style={[styles.laserNode, laserStyle]} />
        <View style={styles.controlShelf}>
          <TouchableOpacity style={styles.triggerCircle} onPress={fireBracketingShutterBurst} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  blackout: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 32 },
  alertTxt: { color: '#FFF', fontSize: 15, textAlign: 'center', marginBottom: 20 },
  grantBtn: { backgroundColor: '#007AFF', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 14 },
  grantTxt: { color: '#FFF', fontWeight: '700' },
  laserNode: { height: 3, backgroundColor: '#FF3B30', width: '100%', position: 'absolute', opacity: 0.8 },
  controlShelf: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  triggerCircle: { width: 84, height: 84, borderRadius: 42, borderWidth: 5, borderColor: '#FFF', backgroundColor: 'rgba(255,255,255,0.2)' }
});
