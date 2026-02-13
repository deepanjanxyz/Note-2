import { getApiUrl } from '@/lib/query-client';

export async function summarizeText(text: string): Promise<string> {
  try {
    const baseUrl = getApiUrl();
    const url = new URL('/api/ai/summarize', baseUrl);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Failed to summarize');
    }
    const data = await res.json();
    return data.result;
  } catch (e: any) {
    throw new Error(e.message || 'AI summarization failed');
  }
}

export async function correctGrammar(text: string): Promise<string> {
  try {
    const baseUrl = getApiUrl();
    const url = new URL('/api/ai/grammar', baseUrl);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Failed to correct grammar');
    }
    const data = await res.json();
    return data.result;
  } catch (e: any) {
    throw new Error(e.message || 'AI grammar correction failed');
  }
}
