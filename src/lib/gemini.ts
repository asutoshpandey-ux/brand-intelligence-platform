import { GoogleGenerativeAI } from '@google/generative-ai';
import { SECRETS } from './secrets';

export async function analyzeWithGemini(textSnippets: string[], apiKey?: string) {
    const key = apiKey || SECRETS.GEMINI_API_KEY;
    if (!key) {
        throw new Error('No Gemini API key available. Set GEMINI_API_KEY or provide your own.');
    }

    const genAI = new GoogleGenerativeAI(key);
    // Using gemini-1.5-flash as default for better quota stability in free tier
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Analyze these text snippets from a brand website and return a JSON object with:
- personality (array of exactly 3 adjectives)
- tone (one of: formal, casual, playful, bold, minimal)
- targetAudience (one sentence)
- brandVoiceSummary (2 sentences max)

Return ONLY valid JSON, no markdown or code fences.

Text snippets:
${textSnippets.join('\n')}`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        try {
            const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            return JSON.parse(cleaned);
        } catch {
            return {
                personality: ['Response', 'Format', 'Error'],
                tone: 'neutral',
                targetAudience: 'The AI answered but the response was malformed.',
                brandVoiceSummary: 'Raw AI Output: ' + text.substring(0, 100),
            };
        }
    } catch (err: any) {
        // Capture specific error details for Vercel troubleshooting
        const status = err?.status || 'Unknown Status';
        const msg = err?.message || String(err);
        const keySnippet = key ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : 'MISSING';

        console.error('Gemini API Error Detail:', { status, msg, keyUsed: keySnippet });

        const is403 = msg.includes('403') || msg.toLowerCase().includes('location') || msg.toLowerCase().includes('supported');
        const isQuota = msg.includes('429') || msg.toLowerCase().includes('quota');

        return {
            personality: isQuota ? ['Quota', 'Limit', 'Reached'] : (is403 ? ['Region', 'Access', 'Denied'] : ['Error', 'Analyzing', 'Voice']),
            tone: 'neutral',
            targetAudience: is403
                ? 'GOOGLE ERROR: This Vercel region may not be supported by Gemini API.'
                : `Error (${status}): ${msg.substring(0, 150)}`,
            brandVoiceSummary: is403
                ? 'Try changing your Vercel project region to "Washington, D.C. (iad1)" in Settings > Functions.'
                : `Key used: ${keySnippet}. Check if your Gemini API key is active and supports gemini-1.5-flash.`,
        };
    }
}
