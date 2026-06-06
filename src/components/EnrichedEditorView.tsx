import React, { useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { EnrichedTextInput } from 'react-native-enriched';
import type { EnrichedTextInputInstance } from 'react-native-enriched';
import { GlassView } from 'expo-glass-effect';
import { Save } from 'lucide-react-native';

interface EditorViewProps {
  sourceHtml: string;
  onCommitToDisk: (mutatedHtml: string) => void;
}

export function EnrichedEditorView({ sourceHtml, onCommitToDisk }: EditorViewProps) {
  const currentHtmlState = useRef<string>(sourceHtml);
  const editorInstance = useRef<EnrichedTextInputInstance>(null);

  return (
    <View style={styles.viewportContainer}>
      <View style={styles.editorFrame}>
        <EnrichedTextInput
          ref={editorInstance}
          initialHtml={sourceHtml}
          onChangeHtml={(html) => {
            currentHtmlState.current = html;
          }}
          style={styles.nativeEditorNativeNode}
        />
      </View>

      <GlassView glassEffectStyle="thick" style={styles.actionShelf}>
        <TouchableOpacity style={styles.saveActionRow} onPress={() => onCommitToDisk(currentHtmlState.current)}>
          <Save color="#FFF" size={20} />
          <Text style={styles.saveTxt}>Commit Document to Vault</Text>
        </TouchableOpacity>
      </GlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  viewportContainer: { flex: 1, backgroundColor: '#0D0D11' },
  editorFrame: { flex: 1, padding: 24, paddingTop: 16 },
  nativeEditorNativeNode: { flex: 1, color: '#FFF', fontSize: 16, lineHeight: 24 },
  actionShelf: { position: 'absolute', bottom: 0, width: '100%', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  saveActionRow: { height: 54, backgroundColor: '#007AFF', borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  saveTxt: { color: '#FFF', fontWeight: '600', fontSize: 15 }
});
