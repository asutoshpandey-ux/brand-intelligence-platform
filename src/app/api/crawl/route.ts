import { NextResponse } from 'next/server';
import { crawlUrl } from '@/lib/crawler';
import { extractBrandDNA } from '@/lib/extractors';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, geminiKey } = body;

        if (!url) {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        // Validate URL
        try {
            new URL(url);
        } catch {
            return NextResponse.json(
                { error: 'Invalid URL provided' },
                { status: 400 }
            );
        }

        // Crawl the URL
        const crawlData = await crawlUrl(url);

        // Extract Brand DNA
        const brandDNA = await extractBrandDNA(crawlData, geminiKey);

        return NextResponse.json({
            success: true,
            data: brandDNA,
            crawlData,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
