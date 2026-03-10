import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyzeWithGemini(textSnippets: string[], apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
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
                personality: ['Analysis', 'Parsing', 'Error'],
                tone: 'neutral',
                targetAudience: 'The AI generated a response, but it was not in the expected format.',
                brandVoiceSummary: 'Raw response: ' + text.substring(0, 200),
            };
        }
    } catch (err: unknown) {
        // Handle Quota (429) and other API errors gracefully
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isQuotaExceeded = errorMessage.includes('429') || errorMessage.includes('quota');

        console.error('Gemini API Error:', errorMessage);

        return {
            personality: isQuotaExceeded ? ['Quota', 'Limit', 'Reached'] : ['Error', 'Analyzing', 'Voice'],
            tone: 'neutral',
            targetAudience: isQuotaExceeded
                ? 'Your Gemini API quota has been exceeded for the moment.'
                : 'API Error: ' + errorMessage.substring(0, 100),
            brandVoiceSummary: isQuotaExceeded
                ? 'Please wait about 60 seconds or upgrade your API key in Google AI Studio to increase your limits.'
                : `Troubleshooting: Check if GEMINI_API_KEY is correctly set in Vercel settings and that your key is valid for gemini-1.5-flash.`,
        };
    }
}
