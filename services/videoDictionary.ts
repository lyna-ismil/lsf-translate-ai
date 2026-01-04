import { Gloss } from '../types';

interface VideoEntry {
    videoUrl: string;
    source: string;
    score: number;
}

type VideoIndex = Record<string, VideoEntry[]>;

let indexCache: VideoIndex | null = null;
let isFetching = false;

// Function to fetch and cache the index
const ensureIndexLoaded = async (): Promise<VideoIndex | null> => {
    if (indexCache) return indexCache;
    if (isFetching) {
        // Simple wait loop if already fetching to avoid double network requests
        // In a production app, we'd use a proper promise queue
        while (isFetching) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        return indexCache;
    }

    isFetching = true;
    try {
        const response = await fetch('/matignon/index.json');
        if (!response.ok) {
            console.error(`Failed to load video index: ${response.status} ${response.statusText}`);
            return null;
        }
        const data = await response.json();
        indexCache = data as VideoIndex;
        return indexCache;
    } catch (error) {
        console.error("Error loading video index:", error);
        return null;
    } finally {
        isFetching = false;
    }
};

/**
 * Looks up a video URL for a given gloss.
 * This function fetches the static index.json from the public directory
 * and finds the best matching video.
 */
export const lookupGlossVideo = async (gloss: string): Promise<string | null> => {
    const index = await ensureIndexLoaded();
    if (!index) return null;

    const upperGloss = gloss.toUpperCase().trim();
    const entries = index[upperGloss];

    if (entries && entries.length > 0) {
        // Sort by score descending and return the best one
        // In a real scenario, we might want to randomize if multiple have high scores
        // or pick based on other context.
        const sorted = [...entries].sort((a, b) => b.score - a.score);
        return sorted[0].videoUrl;
    }

    return null;
};
