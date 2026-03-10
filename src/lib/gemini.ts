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
        const vRegion = process.env.VERCEL_REGION || 'local';
        console.log(`Running Gemini Analysis in region: ${vRegion}`);

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
    } catch (err: unknown) {
        const error = err as { status?: number | string; message?: string };
        const status = error?.status || 'Unknown Status';
        const msg = error?.message || String(err);
        const vRegion = process.env.VERCEL_REGION || 'unknown';
        const keySnippet = key ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` : 'MISSING';

        console.error('Gemini API Error Detail:', { status, msg, region: vRegion });

        // Check for common regional or permission errors
        const is403 = msg.includes('403') || msg.toLowerCase().includes('location') || msg.toLowerCase().includes('supported');
        const isQuota = msg.includes('429') || msg.toLowerCase().includes('quota');

        return {
            personality: isQuota ? ['Quota', 'Limit', 'Reached'] : (is403 ? ['Region', 'Still', 'Blocked'] : ['Error', 'Analyzing', 'Voice']),
            tone: 'neutral',
            targetAudience: is403
                ? `STILL BLOCKED: Google sees you in "${vRegion}".`
                : `Error (${status}): ${msg.substring(0, 100)}`,
            brandVoiceSummary: is403
                ? 'Wait 5 mins for Vercel DNS to update, then Redeploy ONE MORE TIME. If it fails, your Google account may have a restriction.'
                : `Region: ${vRegion}. Key: ${keySnippet}. Ensure API is enabled in Google AI Studio.`,
        };
    }
}
