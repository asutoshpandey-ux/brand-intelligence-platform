import { CrawlResult } from './crawler';
import { analyzeWithGemini } from './gemini';

export interface BrandColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    allColors: string[];
}

export interface BrandFonts {
    families: string[];
    googleFonts: string[];
}

export interface BrandVoice {
    personality: string[];
    tone: string;
    targetAudience: string;
    brandVoiceSummary: string;
}

export interface BrandDNA {
    url: string;
    brandName: string;
    colors: BrandColors;
    fonts: BrandFonts;
    logoUrl: string | null;
    voice: BrandVoice;
    extractedAt: string;
}

// ── Color Extraction ──
export async function extractColors(cssUrls: string[]): Promise<BrandColors> {
    const colorMap = new Map<string, number>();

    for (const cssUrl of cssUrls.slice(0, 5)) {
        try {
            const resp = await fetch(cssUrl, { signal: AbortSignal.timeout(8000) });
            const css = await resp.text();

            // Match hex colors
            const hexMatches = css.match(/#([0-9a-fA-F]{3,8})\b/g) || [];
            hexMatches.forEach((c) => {
                const normalized = normalizeHex(c);
                if (normalized && !isBlackWhiteGray(normalized)) {
                    colorMap.set(normalized, (colorMap.get(normalized) || 0) + 1);
                }
            });

            // Match rgb/rgba colors
            const rgbMatches = css.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g) || [];
            rgbMatches.forEach((c) => {
                const hex = rgbToHex(c);
                if (hex && !isBlackWhiteGray(hex)) {
                    colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
                }
            });
        } catch {
            continue;
        }
    }

    const sorted = Array.from(colorMap.entries()).sort((a, b) => b[1] - a[1]);
    const top5 = sorted.slice(0, 5).map(([c]) => c);

    return {
        primary: top5[0] || '#3B82F6',
        secondary: top5[1] || '#6366F1',
        accent: top5[2] || '#F59E0B',
        background: top5[3] || '#FFFFFF',
        text: top5[4] || '#1F2937',
        allColors: sorted.slice(0, 15).map(([c]) => c),
    };
}

// ── Font Extraction ──
export function extractFonts(cssUrls: string[], htmlText: string): BrandFonts {
    const families = new Set<string>();
    const googleFonts = new Set<string>();

    // Check for Google Fonts links in HTML
    const gfMatches = htmlText.match(/fonts\.googleapis\.com\/css2?\?family=([^"&]+)/g) || [];
    gfMatches.forEach((m) => {
        const familyPart = m.split('family=')[1];
        if (familyPart) {
            familyPart.split('|').forEach((f) => {
                const name = decodeURIComponent(f.split(':')[0].replace(/\+/g, ' '));
                googleFonts.add(name);
                families.add(name);
            });
        }
    });

    // Extract font-family from inline style references in HTML
    const fontFamilyRegex = /font-family:\s*['"]?([^;'"}\n]+)/gi;
    let match;
    while ((match = fontFamilyRegex.exec(htmlText)) !== null) {
        const rawFonts = match[1].split(',').map((f) => f.trim().replace(/['"]/g, ''));
        rawFonts.forEach((f) => {
            if (f && !['inherit', 'initial', 'sans-serif', 'serif', 'monospace', 'cursive'].includes(f.toLowerCase())) {
                families.add(f);
            }
        });
    }

    return {
        families: Array.from(families).slice(0, 8),
        googleFonts: Array.from(googleFonts),
    };
}

// ── Brand Voice Extraction ──
export async function extractBrandVoice(crawlData: CrawlResult, geminiKey?: string): Promise<BrandVoice> {
    const snippets: string[] = [];

    // Add headings
    crawlData.headings.forEach((h) => {
        if (h.text) snippets.push(`[${h.tag.toUpperCase()}] ${h.text}`);
    });

    // Add meta description
    if (crawlData.metaTags['description']) {
        snippets.push(`[META DESCRIPTION] ${crawlData.metaTags['description']}`);
    }

    // Add CTAs
    crawlData.ctaTexts.forEach((t) => {
        snippets.push(`[CTA] ${t}`);
    });

    // Add first 500 chars of text content for context
    if (crawlData.textContent) {
        snippets.push(`[BODY TEXT] ${crawlData.textContent.substring(0, 500)}`);
    }

    if (snippets.length === 0) {
        return {
            personality: ['professional', 'modern', 'approachable'],
            tone: 'casual',
            targetAudience: 'General audience',
            brandVoiceSummary: 'Not enough text content was found to analyze the brand voice.',
        };
    }

    return analyzeWithGemini(snippets, geminiKey);
}

// ── Full Extraction Pipeline ──
export async function extractBrandDNA(crawlData: CrawlResult, geminiKey?: string): Promise<BrandDNA> {
    const [colors, voice] = await Promise.all([
        extractColors(crawlData.cssUrls),
        extractBrandVoice(crawlData, geminiKey),
    ]);

    const fonts = extractFonts(crawlData.cssUrls, crawlData.textContent);

    return {
        url: crawlData.url,
        brandName: crawlData.title.split(/[|\-–—]/)[0].trim() || new URL(crawlData.url).hostname,
        colors,
        fonts,
        logoUrl: crawlData.logoUrl,
        voice,
        extractedAt: new Date().toISOString(),
    };
}

// ── Helpers ──
function normalizeHex(hex: string): string | null {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    if (hex.length !== 6) return null;
    return '#' + hex.toUpperCase();
}

function rgbToHex(rgb: string): string | null {
    const match = rgb.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!match) return null;
    const [, r, g, b] = match.map(Number);
    return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function isBlackWhiteGray(hex: string): boolean {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    return max - min < 15;
}
