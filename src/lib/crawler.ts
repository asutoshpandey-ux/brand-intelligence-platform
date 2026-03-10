import * as cheerio from 'cheerio';

export interface CrawlResult {
    url: string;
    title: string;
    metaTags: Record<string, string>;
    textContent: string;
    headings: { tag: string; text: string }[];
    cssUrls: string[];
    imageUrls: string[];
    anchorLinks: string[];
    logoUrl: string | null;
    ctaTexts: string[];
}

export async function crawlUrl(url: string): Promise<CrawlResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        clearTimeout(timeout);

        const $ = cheerio.load(html);

        // Extract title
        const title = $('title').first().text().trim() || '';

        // Extract meta tags
        const metaTags: Record<string, string> = {};
        $('meta').each((_, el) => {
            const name = $(el).attr('name') || $(el).attr('property') || '';
            const content = $(el).attr('content') || '';
            if (name && content) {
                metaTags[name] = content;
            }
        });

        // Extract text content
        $('script, style, noscript').remove();
        const textContent = $('body').text().replace(/\s+/g, ' ').trim();

        // Extract headings
        const headings: { tag: string; text: string }[] = [];
        $('h1, h2, h3').each((_, el) => {
            const tagName = (el as unknown as { tagName: string }).tagName || 'h1';
            headings.push({ tag: tagName, text: $(el).text().trim() });
        });

        // Extract CSS URLs
        const cssUrls: string[] = [];
        $('link[rel="stylesheet"]').each((_, el) => {
            const href = $(el).attr('href');
            if (href) {
                cssUrls.push(resolveUrl(url, href));
            }
        });

        // Extract image URLs
        const imageUrls: string[] = [];
        $('img').each((_, el) => {
            const src = $(el).attr('src');
            if (src) {
                imageUrls.push(resolveUrl(url, src));
            }
        });

        // Extract anchor links
        const anchorLinks: string[] = [];
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                anchorLinks.push(resolveUrl(url, href));
            }
        });

        // Find logo
        let logoUrl: string | null = null;
        // Try og:image first
        if (metaTags['og:image']) {
            logoUrl = resolveUrl(url, metaTags['og:image']);
        }
        // Then look for img with "logo" in src or alt
        if (!logoUrl) {
            $('img').each((_, el) => {
                const src = $(el).attr('src') || '';
                const alt = $(el).attr('alt') || '';
                if ((src.toLowerCase().includes('logo') || alt.toLowerCase().includes('logo')) && src) {
                    logoUrl = resolveUrl(url, src);
                    return false; // break
                }
            });
        }
        // Fallback to favicon
        if (!logoUrl) {
            const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').first().attr('href');
            if (favicon) {
                logoUrl = resolveUrl(url, favicon);
            }
        }

        // Extract CTA texts (buttons and links with action words)
        const ctaTexts: string[] = [];
        $('button, a.btn, a.button, [class*="cta"], [class*="btn"]').each((_, el) => {
            const text = $(el).text().trim();
            if (text && text.length < 50) {
                ctaTexts.push(text);
            }
        });

        return {
            url,
            title,
            metaTags,
            textContent: textContent.substring(0, 5000),
            headings,
            cssUrls,
            imageUrls: imageUrls.slice(0, 20),
            anchorLinks: anchorLinks.slice(0, 30),
            logoUrl,
            ctaTexts,
        };
    } catch (error: unknown) {
        clearTimeout(timeout);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Request timed out after 15 seconds for URL: ${url}`);
        }
        throw error;
    }
}

function resolveUrl(base: string, relative: string): string {
    try {
        return new URL(relative, base).href;
    } catch {
        return relative;
    }
}
