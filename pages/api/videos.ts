import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

// Types mapping - in a real shared repo, import these
interface VideoEntry {
    videoUrl: string;
    source: string;
    score: number;
}

type VideoIndex = Record<string, VideoEntry[]>;

// Load index once at server startup (cold start)
const INDEX_PATH = path.join(process.cwd(), 'public', 'matignon', 'index.json');
let indexCache: VideoIndex | null = null;

try {
    if (fs.existsSync(INDEX_PATH)) {
        const fileContent = fs.readFileSync(INDEX_PATH, 'utf-8');
        indexCache = JSON.parse(fileContent);
        console.log(`Video Index loaded: ${Object.keys(indexCache || {}).length} entries`);
    } else {
        console.warn(`Video Index not found at ${INDEX_PATH}`);
    }
} catch (error) {
    console.error("Failed to load video index on startup:", error);
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { gloss } = req.query;

    if (!gloss || typeof gloss !== 'string') {
        return res.status(400).json({ message: 'Gloss query parameter is required' });
    }

    if (!indexCache) {
        // Retry loading if it failed initially or wasn't there
        try {
            if (fs.existsSync(INDEX_PATH)) {
                const fileContent = fs.readFileSync(INDEX_PATH, 'utf-8');
                indexCache = JSON.parse(fileContent);
            }
        } catch (e) {
            return res.status(500).json({ message: 'Internal Server Error: Index not available' });
        }
    }

    if (!indexCache) {
        return res.status(503).json({ message: 'Service Unavailable: Dictionary index missing' });
    }

    const upperGloss = gloss.toUpperCase().trim();
    const entries = indexCache[upperGloss];

    if (entries && entries.length > 0) {
        // Sort by score
        const bestMatch = [...entries].sort((a, b) => b.score - a.score)[0];
        return res.status(200).json({ videoUrl: bestMatch.videoUrl });
    }

    return res.status(404).json({ message: 'Video not found', videoUrl: null });
}
