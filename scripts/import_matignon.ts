import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIR = path.join(__dirname, '../tools/Matignon-LSF/data'); // User puts data here
const PUBLIC_VIDEO_DIR = path.join(__dirname, '../public/matignon/videos');
const OUTPUT_FILE = path.join(__dirname, '../public/matignon/index.json');

// Types
interface VideoEntry {
    videoUrl: string;
    source: string;
    score: number;
}
type VideoIndex = Record<string, VideoEntry[]>;

// Helper to parse Time (00:00:03,400) to seconds (3.4)
function parseTime(timeStr: string): number {
    const [h, m, s] = timeStr.split(':');
    const [sec, ms] = s.split(',');
    return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(sec) + parseInt(ms) / 1000;
}

// Simple SRT Parser (Block based)
function parseSRT(content: string): { start: number; end: number; text: string }[] {
    const entries: { start: number; end: number; text: string }[] = [];

    // Normalize newlines
    const normalized = content.replace(/\r\n/g, '\n');
    const blocks = normalized.split('\n\n');

    for (const block of blocks) {
        const lines = block.trim().split('\n');
        if (lines.length < 3) continue; // Skip malformed/empty blocks

        // Line 1: Index (skip)
        // Line 2: Time
        const timeLine = lines[1].includes('-->') ? lines[1] : lines[0].includes('-->') ? lines[0] : null;

        if (!timeLine) continue;

        const times = timeLine.split(' --> ');
        if (times.length !== 2) continue;

        const start = parseTime(times[0].trim());
        const end = parseTime(times[1].trim());

        // Remaining lines are text
        // If line 2 was time, text starts at line 3 (index 2)
        // If line 1 was time (no index), text starts at line 2 (index 1)
        const textStartIndex = lines[1].includes('-->') ? 2 : 1;
        const text = lines.slice(textStartIndex).join(' ').trim();

        entries.push({ start, end, text });
    }
    return entries;
}

// Heuristic: Clean French text to "Gloss-like" keys
// In a real pipeline, we'd use Gemini to extract glosses, but for mass indexing, a simple keyword map is a good start.
function extractKeywords(text: string): string[] {
    // Remove punctuation, stop words, uppercase
    return text.toUpperCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 2) // Ignore small words
        .filter(w => !["LES", "DES", "UNE", "POUR", "AVEC", "DANS"].includes(w)); // Basic stop list
}

async function main() {
    console.log("Starting Matignon-LSF Importer...");

    // 1. Check directories
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`Source directory not found: ${SOURCE_DIR}`);
        console.log("Please create it and place .srt and .mp4 files there (downloaded from Matignon scripts).");
        return;
    }

    if (!fs.existsSync(PUBLIC_VIDEO_DIR)) {
        fs.mkdirSync(PUBLIC_VIDEO_DIR, { recursive: true });
    }

    const index: VideoIndex = {};
    const files = fs.readdirSync(SOURCE_DIR);

    // 2. Process pairs (Video + SRT)
    for (const file of files) {
        if (file.endsWith('.srt')) {
            const basename = path.basename(file, '.srt');
            const videoFile = files.find(f => f.startsWith(basename) && f.endsWith('.mp4'));

            if (!videoFile) {
                console.warn(`No video found for subtitle: ${file}`);
                continue;
            }

            console.log(`Processing: ${basename}`);

            // Copy video to public (or symlink if OS supports)
            // Using copy for safety in typical web server setup
            const srcVideoPath = path.join(SOURCE_DIR, videoFile);
            const destVideoPath = path.join(PUBLIC_VIDEO_DIR, videoFile);

            if (!fs.existsSync(destVideoPath)) {
                console.log(`  Copying video to public...`);
                fs.copyFileSync(srcVideoPath, destVideoPath);
            }

            // Parse SRT
            const srtContent = fs.readFileSync(path.join(SOURCE_DIR, file), 'utf-8');
            const subtitles = parseSRT(srtContent);

            // Build Index
            for (const sub of subtitles) {
                const keywords = extractKeywords(sub.text);
                for (const word of keywords) {
                    if (!index[word]) index[word] = [];

                    // Add entry with Media Fragment (#t=start,end)
                    index[word].push({
                        videoUrl: `/matignon/videos/${videoFile}#t=${sub.start},${sub.end}`,
                        source: "Matignon-LSF",
                        score: 1.0 // Simple keyword match
                    });
                }
            }
        }
    }

    // 3. Write Index
    console.log(`Writing index with ${Object.keys(index).length} gloss entries...`);
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
    console.log("Done!");
}

main().catch(err => console.error(err));
