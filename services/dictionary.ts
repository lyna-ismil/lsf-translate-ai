// services/dictionary.ts

// ==========================================
// MATIGNON-LSF INTEGRATION STRATEGY
// ==========================================
// Source: https://github.com/JulieLascar/Matignon-LSF
// Description: 39 hours of interpreted LSF from French government speeches.
//
// IMPLEMENTATION GUIDE:
// 1. This dataset consists of long video files (speeches) + ELAN (.eaf) annotation files.
// 2. Unlike a dictionary, you cannot just "lookup" a word file. You must EXTRACT it.
// 3. PIPELINE:
//    a. Parse .eaf files to map Gloss -> { VideoFile, StartTime, EndTime }
//    b. Use ffmpeg to slice the specific sign: 
//       `ffmpeg -i speech_01.mp4 -ss 00:05:12.000 -to 00:05:13.500 -c copy gloss_bonjour.mp4`
//    c. Upload these slices to your CDN (S3/Cloudinary).
//    d. Index them in the format below.
// ==========================================

export interface DictionaryEntry {
  key: string; // The lookup key (Normalized Gloss)
  videoUrl: string;
  source: 'Matignon-LSF' | 'Mediapi-RGB' | 'Wiki' | 'Simulated';
  confidence: number;
}

// ---------------------------------------------------------------------------
// 1. LOCAL INDEX (Simulating the sliced clips from Matignon-LSF)
// ---------------------------------------------------------------------------
// Since we don't have the sliced Matignon files hosted yet, we use high-quality
// Wikimedia Commons alternatives for the MVP demo.
const LOCAL_INDEX: Record<string, string> = {
  // COMMON GOVERNMENT/FORMAL TERMS (Simulated matches)
  "FRANCE": "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c2/LSF_France.webm/LSF_France.webm.480p.vp9.webm",
  "BONJOUR": "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/16/LSF_Bonjour.webm/LSF_Bonjour.webm.480p.vp9.webm",
  "OUI": "https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f9/LSF_Oui.webm/LSF_Oui.webm.480p.vp9.webm",
  "NON": "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/36/LSF_Non.webm/LSF_Non.webm.480p.vp9.webm",
  "MERCI": "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/2f/LSF_Merci.webm/LSF_Merci.webm.480p.vp9.webm",
  
  // VERBS
  "AIDER": "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/23/LSF_Aider.webm/LSF_Aider.webm.480p.vp9.webm",
  "ALLER": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6d/LSF_Aller.webm/LSF_Aller.webm.480p.vp9.webm",
  "MANGER": "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9b/LSF_Manger.webm/LSF_Manger.webm.480p.vp9.webm",
  "BOIRE": "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/45/LSF_Boire.webm/LSF_Boire.webm.480p.vp9.webm",
  "DORMIR": "https://upload.wikimedia.org/wikipedia/commons/transcoded/e/e0/LSF_Dormir.webm/LSF_Dormir.webm.480p.vp9.webm",
  "AIMER": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/05/LSF_Aimer.webm/LSF_Aimer.webm.480p.vp9.webm",
  
  // NOUNS & PLACES
  "MAISON": "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/21/LSF_Maison.webm/LSF_Maison.webm.480p.vp9.webm",
  "PARIS": "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/87/LSF_Paris.webm/LSF_Paris.webm.480p.vp9.webm",
  "TRAVAIL": "https://upload.wikimedia.org/wikipedia/commons/transcoded/7/73/LSF_Travail.webm/LSF_Travail.webm.480p.vp9.webm",
  "FAMILLE": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6e/LSF_Famille.webm/LSF_Famille.webm.480p.vp9.webm",
  
  // TIME
  "DEMAIN": "https://media.spreadthesign.com/video/mp4/13/49199.mp4",
  "HIER": "https://media.spreadthesign.com/video/mp4/13/49198.mp4",
  "MAINTENANT": "https://media.spreadthesign.com/video/mp4/13/61225.mp4"
};

/**
 * Normalizes text to match dataset keys
 * Removes accents, special chars, and converts to uppercase.
 * Example: "L'été" -> "ETE"
 */
const normalizeKey = (text: string): string => {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .trim();
};

/**
 * PRODUCTION MODE:
 * When you have processed Matignon-LSF and hosted the clips:
 * 1. Set USE_REAL_API = true
 * 2. Point API_ENDPOINT to your index service
 */
const USE_REAL_API = false;
const API_ENDPOINT = "https://api.your-lsf-project.com/v1/matignon/gloss"; 

export const lookupGlossVideo = async (gloss: string): Promise<string | null> => {
  const normalizedKey = normalizeKey(gloss);

  // 1. Try Local Index first (Fastest)
  if (LOCAL_INDEX[normalizedKey]) {
    return LOCAL_INDEX[normalizedKey];
  }

  // 2. Try Real API (If enabled)
  if (USE_REAL_API) {
    try {
      const response = await fetch(`${API_ENDPOINT}/${normalizedKey}`);
      if (response.ok) {
        const data = await response.json();
        return data.videoUrl;
      }
    } catch (e) {
      console.warn("API Lookup failed", e);
    }
  }

  // 3. Fallback
  return null;
};

export const getDatasetStats = () => {
  return {
    source: "Matignon-LSF (Simulated)",
    availableVideos: Object.keys(LOCAL_INDEX).length, // Currently mocked
    totalHours: 39,
    interpreters: 15,
    description: "Interpreted French Government Speeches"
  };
};