import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraViewfinder } from '../components/CameraViewfinder';
import { BatchProgressOverlay } from '../components/BatchProgressOverlay';
import { runMultimodalOCR } from '../api/openai';
import { FolderLock } from 'lucide-react-native';

export default function EntryScreen() {
  const router = useRouter();
  const [processingState, setProcessingState] = useState<boolean>(false);

  // SECURE CONFIGURATION NOTE: Insert production token string destination safely here
  const OPENAI_SECRET_KEY = "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";

  const handleCaptureSequenceComplete = async (uris: { dark: string; neutral: string; bright: string }) => {
    setProcessingState(true);
    const output = await runMultimodalOCR({
      apiKey: OPENAI_SECRET_KEY,
      imageUris: [uris.dark, uris.neutral, uris.bright]
    });
    setProcessingState(false);

    if (output.success) {
      router.push({
        pathname: '/editor',
        params: {
          rawHtml: output.structuredHtml,
          docType: output.docType,
          docName: output.documentName
        }
      });
    }
  };

  return (
    <View style={styles.screen}>
      <CameraViewfinder onScanReady={handleCaptureSequenceComplete} />
      <BatchProgressOverlay isVisible={processingState} />
      <TouchableOpacity style={styles.floatingVaultBtn} onPress={() => router.push('/vault')}>
        <FolderLock color="#FFF" size={24} />
        <Text style={styles.vaultBtnTxt}>Access Vault</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  floatingVaultBtn: { position: 'absolute', top: 20, right: 20, backgroundColor: 'rgba(0,122,255,0.85)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8, zIndex: 999 },
  vaultBtnTxt: { color: '#FFF', fontWeight: '600', fontSize: 13 }
});
