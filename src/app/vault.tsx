import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { LiquidGlassPinPad } from '../components/LiquidGlassPinPad';
import { fetchAllLocalDocuments, deleteDocumentLocally, DBDocument } from '../database/DbEngine';
import { Trash2, FileText, Lock } from 'lucide-react-native';

export default function VaultScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [documentCollection, setDocumentCollection] = useState<DBDocument[]>([]);

  // System security configurations fallbacks parameter definition
  const SECURITY_MASTER_PASSCODE = "1234";

  useEffect(() => {
    runHardwareBiometricAuthenticationGate();
  }, []);

  const runHardwareBiometricAuthenticationGate = async () => {
    const safeHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolledRecord = await LocalAuthentication.isEnrolledAsync();

    if (safeHardware && enrolledRecord) {
      const challenge = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate system secure document storage hardware array access",
        fallbackLabel: "Utilize master interface PIN authentication instead"
      });

      if (challenge.success) {
        setIsAuthenticated(true);
        loadVaultContentFromSQLite();
      }
    }
  };

  const loadVaultContentFromSQLite = async () => {
    const list = await fetchAllLocalDocuments();
    setDocumentCollection(list);
  };

  const executeItemPurgeSequence = async (id: string) => {
    await deleteDocumentLocally(id);
    await loadVaultContentFromSQLite();
  };

  if (!isAuthenticated) {
    return (
      <LiquidGlassPinPad
        correctPin={SECURITY_MASTER_PASSCODE}
        onUnlocked={() => {
          setIsAuthenticated(true);
          loadVaultContentFromSQLite();
        }}
      />
    );
  }

  return (
    <View style={styles.vaultLayout}>
      {documentCollection.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Lock color="rgba(255,255,255,0.2)" size={64} />
          <Text style={styles.emptyTxt}>Vault empty. No local active records stored.</Text>
        </View>
      ) : (
        <FlatList
          data={documentCollection}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => (
            <View style={styles.rowItem}>
              <View style={styles.rowMetadata}>
                <FileText color="#007AFF" size={24} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.docTypeLabel}>{item.doc_type}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => executeItemPurgeSequence(item.id)}>
                <Trash2 color="#FF3B30" size={20} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  vaultLayout: { flex: 1, backgroundColor: '#09090B' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  emptyTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },
  rowItem: { backgroundColor: '#18181B', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, gap: 12 },
  rowMetadata: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  docTitle: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  docTypeLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  deleteBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,59,48,0.1)', justifyContent: 'center', alignItems: 'center' }
});
