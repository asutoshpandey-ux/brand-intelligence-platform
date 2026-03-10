import { GoogleGenerativeAI } from '@google/generative-ai';

export async function analyzeWithGemini(textSnippets: string[], apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
        throw new Error('No Gemini API key available. Set GEMINI_API_KEY or provide your own.');
    }

    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyze these text snippets from a brand website and return a JSON object with:
- personality (array of exactly 3 adjectives)
- tone (one of: formal, casual, playful, bold, minimal)
- targetAudience (one sentence)
- brandVoiceSummary (2 sentences max)

Return ONLY valid JSON, no markdown or code fences.

Text snippets:
${textSnippets.join('\n')}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    try {
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(cleaned);
    } catch {
        return {
            personality: ['professional', 'modern', 'approachable'],
            tone: 'casual',
            targetAudience: 'Could not determine target audience from provided text.',
            brandVoiceSummary: 'Brand voice analysis could not be parsed. Raw response: ' + text,
        };
    }
}
