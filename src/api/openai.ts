import * as FileSystem from 'expo-file-system';

interface VisionPayload {
  apiKey: string;
  imageUris: string[];
}

export interface VisionOutput {
  success: boolean;
  docType: string;
  documentName: string;
  structuredHtml: string;
  error?: string;
}

export async function runMultimodalOCR({ apiKey, imageUris }: VisionPayload): Promise<VisionOutput> {
  try {
    const contents: any[] = [
      {
        type: "text",
        text: "Analyze the uploaded multi-exposure bracketed image dataset of this document. Remove shadows, maximize clarity, and return a single valid JSON object containing exactly three keys: 'docType' (string matching document category), 'documentName' (string, descriptive title), and 'structuredHtml' (string containing inline-styled semantic raw HTML body markup matching the document format layout). Do not wrap the JSON object in markdown backticks or markdown formatting."
      }
    ];

    for (const uri of imageUris) {
      const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
      contents.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${base64}`, detail: "high" }
      });
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: contents }],
        temperature: 0.1
      })
    });

    if (!res.ok) throw new Error(`OpenAI Endpoint Error: Status ${res.status}`);

    const serverData = await res.json();
    const cleanJsonString = serverData.choices[0].message.content.trim();
    const parsed = JSON.parse(cleanJsonString);

    return {
      success: true,
      docType: parsed.docType || "UNASSIGNED",
      documentName: parsed.documentName || "Scanned Document File",
      structuredHtml: parsed.structuredHtml || "<div>Parsing error fallback container.</div>"
    };
  } catch (err: any) {
    return {
      success: false,
      docType: "ERROR",
      documentName: "Processing Failure",
      structuredHtml: "",
      error: err.message || "Unknown error context processing exception."
    };
  }
}
