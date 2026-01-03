import { GoogleGenAI, Type } from "@google/genai";
import { TranslationResult, Gloss } from '../types';
import { lookupGlossVideo } from './dictionary';

// Initialize the API client
const apiKey = process.env.API_KEY || ''; // In a real app, this should be handled securely
const ai = new GoogleGenAI({ apiKey });

const TRANSLATION_MODEL = 'gemini-3-flash-preview';
const IMAGE_MODEL = 'gemini-3-pro-image-preview'; // Better quality for sign details

export const translateTextToGloss = async (text: string): Promise<TranslationResult> => {
  let result: TranslationResult;

  if (!apiKey) {
    console.warn("No API Key provided");
    result = await mockTranslation(text);
  } else {
    try {
      const response = await ai.models.generateContent({
        model: TRANSLATION_MODEL,
        contents: `Analyze and translate the following French text into French Sign Language (LSF) Glosses.
        Input Text: "${text}"`,
        config: {
          systemInstruction: `You are an elite linguistic engine specializing in French to French Sign Language (LSF) interpretation.
          
          Your task is to deconstruct the French sentence, extract the meaning, and reconstruct it using strictly LSF grammar and syntax.
          
          ### 1. SYNTAX & WORD ORDER (CRITICAL)
          LSF is not French with signs. You MUST apply these ordering rules:
          - **Standard**: Time -> Location -> Context/Topic -> Subject -> Object -> Verb.
            *Ex: "Je mange une pomme à la maison" -> "MAISON (Place) POMME (Object) MOI (Subject) MANGER (Verb)"*
          - **Adjectives**: Placed AFTER the noun.
            *Ex: "La maison rouge" -> "MAISON ROUGE"*
          - **Negation**: The negation sign (NON, JAMAIS, RIEN, PAS-ENCORE) goes at the VERY END of the phrase.
            *Ex: "Je ne veux pas" -> "MOI VOULOIR NON"*
          - **Questions**: The question word (QUI, QUOI, OÙ, QUAND, COMMENT, POURQUOI) goes at the VERY END.
            *Ex: "Où vas-tu ?" -> "TOI ALLER OÙ ?"*
          
          ### 2. GRAMMATICAL FEATURES
          - **Pro-forms**: Replace pronouns like "il/elle" with pointing (INDEX) or specific reference if the entity was established.
          - **Verbs**:
            - Directional verbs (donner, aller, regarder) must incorporate direction in the 'description' (e.g., "Move from subject to object").
            - Action verbs often omit the subject if context is clear.
          - **Classifiers (CL)**: If the text describes size, shape, or movement of an object, use a Classifier Gloss.
            *Ex: "La voiture roule vite" -> "VOITURE CL-VÉHICULE-RAPIDE"*
          
          ### 3. NON-MANUAL MARKERS (Facial Expressions)
          - **Yes/No Question**: Eyebrows RAISED, head forward.
          - **Wh- Question**: Eyebrows FURROWED (down), chin up.
          - **Negation**: Continuous HEAD SHAKE during the negated phrase.
          - **Topic**: Eyebrows raised slightly when establishing the topic.
          - **Intensity**: Squint eyes or puff cheeks for "very", "a lot", or "hard".
          
          ### 4. GLOSSING CONVENTIONS
          - Use standard French words in UPPERCASE for Glosses.
          - If a word implies multiple concepts, split them.
          - If a concept doesn't exist, use simple synonyms or describe it.
          
          OUTPUT REQUIREMENT:
          Return a JSON object containing the analyze gloss sequence.
          `,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedGlosses: { type: Type.STRING, description: "The full sentence in gloss format (e.g., DEMAIN PARIS MOI ALLER)" },
              grammarNotes: { type: Type.STRING, description: "Detailed explanation of the LSF grammar rules applied (e.g., 'Topic-Comment structure used, Adjective post-positioned')." },
              glosses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    originalWord: { type: Type.STRING, description: "The concept or source word(s) this gloss represents" },
                    gloss: { type: Type.STRING, description: "The LSF Gloss (UPPERCASE)" },
                    type: { type: Type.STRING, enum: ["noun", "verb", "adjective", "syntax", "other"] },
                    description: { type: Type.STRING, description: "Detailed visual description of the sign movement, including spatial start/end points." },
                    facialExpression: { type: Type.STRING, description: "Specific facial expression (e.g., 'Eyebrows Raised', 'Puffed Cheeks')." },
                    duration: { type: Type.NUMBER, description: "Duration in seconds" }
                  },
                  required: ["id", "originalWord", "gloss", "type", "description"]
                }
              }
            },
            required: ["translatedGlosses", "glosses"]
          }
        }
      });

      const jsonStr = response.text || "{}";
      const data = JSON.parse(jsonStr);

      result = {
        originalText: text,
        translatedGlosses: data.translatedGlosses,
        glosses: data.glosses,
        grammarNotes: data.grammarNotes
      };

    } catch (error) {
      console.error("Gemini Translation Error:", error);
      // Fallback to mock if API fails or key is invalid
      result = await mockTranslation(text);
    }
  }

  // ENRICHMENT STEP: Lookup Videos
  // This runs after the AI translation to find matching videos in our dictionary
  const enrichedGlosses = await Promise.all(result.glosses.map(async (gloss) => {
    const videoUrl = await lookupGlossVideo(gloss.gloss);
    return { ...gloss, videoUrl };
  }));

  return { ...result, glosses: enrichedGlosses };
};

export const generateSignImage = async (gloss: Gloss): Promise<string | null> => {
  if (!apiKey) return null;

  try {
    const prompt = `A photorealistic educational illustration of a person performing the French Sign Language (LSF) sign for "${gloss.gloss}". 
    Context: Part of a sentence translating "${gloss.originalWord}".
    Description of movement: ${gloss.description}.
    The person should be neutral, wearing plain dark clothing, against a clean light background. 
    Focus on the hand shape and position relative to the body.
    High quality, clear, instructional style.`;

    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

// Fallback for development without API key
const mockTranslation = async (text: string): Promise<TranslationResult> => {
  // Advanced mock to demonstrate the new logic structure
  return {
    originalText: text,
    translatedGlosses: "SAMEDI SOIR FÊTE OÙ ?",
    grammarNotes: "Interrogative structure: Time (Samedi Soir) + Topic (Fête) + Question Word (Où) at the end. 'Wh-' question face applied.",
    glosses: [
      {
        id: "1",
        originalWord: "Samedi soir",
        gloss: "SAMEDI",
        type: "other",
        description: "Fist with thumb out rubbing circle on palm.",
        facialExpression: "Neutral",
        duration: 1.5
      },
      {
        id: "2",
        originalWord: "la fête",
        gloss: "FÊTE",
        type: "noun",
        description: "Hands up, fingers spread, twisting back and forth (excitement).",
        facialExpression: "Happy / Neutral",
        duration: 1.0
      },
      {
        id: "3",
        originalWord: "est où",
        gloss: "OÙ",
        type: "syntax",
        description: "Hands open palms up, moving side to side slightly.",
        facialExpression: "Eyebrows Furrowed (Question), Chin up",
        duration: 1.0
      }
    ]
  };
};