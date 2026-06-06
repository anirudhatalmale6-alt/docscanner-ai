import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { EnrichedEditorView } from '../components/EnrichedEditorView';
import { insertDocumentLocally } from '../database/DbEngine';

export default function EditorScreen() {
  const params = useLocalSearchParams<{ rawHtml: string; docType: string; docName: string }>();
  const router = useRouter();

  const handleSaveToDatabaseTransaction = async (mutatedHtml: string) => {
    await insertDocumentLocally({
      id: Math.random().toString(36).substring(7),
      name: params.docName || "Committed Vault Document",
      doc_type: params.docType || "GENERIC",
      raw_html: mutatedHtml,
      created_at: Date.now()
    });
    router.replace('/vault');
  };

  return (
    <EnrichedEditorView
      sourceHtml={params.rawHtml || "<div>Void payload context matrix index interface.</div>"}
      onCommitToDisk={handleSaveToDatabaseTransaction}
    />
  );
}
