import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Resilient helper to handle temporary load spikes across eligible Gemini Free Tier multimodal models
async function generateWithModelFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
): Promise<{ responseText: string; modelUsed: string }> {
  // Free Tier eligible multimodal models for understanding, transcription & text generation:
  const modelsToTry = [
    params.primaryModel || 'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        const text = result?.text;
        if (text && typeof text === 'string') {
          return { responseText: text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);

        const isTemporary =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('overloaded') ||
          errMsg.includes('temporarily');

        if (isTemporary && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error('AI analysis unavailable.');
}

function parseGeminiJson(rawText: string): any {
  if (!rawText) throw new Error('Empty response received from AI model');
  let clean = rawText.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/i, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/i, '');
  }
  if (clean.endsWith('```')) {
    clean = clean.replace(/```\s*$/i, '');
  }
  clean = clean.trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(clean.slice(firstBrace, lastBrace + 1));
    }
    throw e;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Ensure JSON response header for all API endpoints
  app.use('/api', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      time: new Date().toISOString(),
    });
  });

  // Module 1 — KalaStudio: Gemini Free Tier multimodal image understanding
  app.post('/api/gemini/analyze-product', async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType = 'image/jpeg',
        requestId = `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        imageId,
        productDraftId,
      } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ success: false, error: 'No image data provided. Please upload an image.' });
      }

      let rawBase64 = imageBase64;
      let detectedMimeType = mimeType;
      if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
        const fetchRes = await fetch(imageBase64);
        const arrayBuf = await fetchRes.arrayBuffer();
        rawBase64 = Buffer.from(arrayBuf).toString('base64');
        detectedMimeType = fetchRes.headers.get('content-type') || 'image/jpeg';
      } else if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        const header = parts[0];
        rawBase64 = parts[1];
        if (header.includes(':')) {
          detectedMimeType = header.split(':')[1];
        }
      }

      const prompt = `You are a visual understanding expert in Indian artisan handicrafts, traditional craftsmanship, handlooms, and home decor.
Examine this product photograph carefully and objectively.
Describe ONLY what is actually visible in THIS specific image.
Never use: demo products, sample products, previous image analysis, hardcoded product descriptions, or fallback textile descriptions.

Return a valid JSON object matching this exact schema:
{
  "productType": string, // Accurate specific name of the craft item shown (e.g. "Carved Wooden Decorative Pot", "Terracotta Pitcher", "Brass Diya", "Madhubani Painting")
  "category": string, // Marketplace category (e.g. "Woodwork & Carving", "Pottery & Ceramics", "Metal Craft & Brassware", "Textiles & Handloom", "Folk Art & Paintings")
  "colors": string[], // List of 2 to 4 dominant visible colors (e.g. ["Walnut Brown", "Warm Amber"])
  "material": string, // Visually identifiable primary material (e.g. "Solid Wood", "Terracotta Clay", "Brass", "Cotton Fabric")
  "technique": string, // Visually identifiable craft technique (e.g. "Hand Wood Carving", "Wheel Pottery", "Lost-Wax Casting", "Handloom Weaving")
  "lightingQuality": string, // Objective lighting assessment (e.g. "Even diffuse lighting", "Harsh directional shadow on left")
  "backgroundQuality": string, // Objective background assessment (e.g. "Neutral table surface", "Cluttered workshop floor")
  "compositionQuality": string, // Framing assessment (e.g. "Centered front view", "Angled close-up")
  "qualityScore": number, // Integer from 40 to 90 representing commercial photo readiness
  "recommendations": string[] // 2-4 actionable photo enhancement suggestions (e.g. ["Seamless studio backdrop", "Balanced exposure", "Soft contact shadow"])
}

Strict Rules:
- If the image shows a wooden craft, DO NOT mention saree, brass, or clay.
- If the image shows pottery, DO NOT mention wood or textile.
- Output ONLY the JSON object.`;

      const ai = getGeminiClient();
      const { responseText, modelUsed } = await generateWithModelFallback(ai, {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: detectedMimeType,
                  data: rawBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsedAnalysis = parseGeminiJson(responseText);

      return res.json({
        success: true,
        requestId,
        imageId,
        productDraftId,
        modelUsed,
        analysis: parsedAnalysis,
      });
    } catch (error: any) {
      console.error('[KalaStudio] Product analysis error:', error?.message || error);
      return res.status(200).json({
        success: false,
        error: 'AI analysis unavailable.',
      });
    }
  });

  // Backward compatibility alias for /api/gemini/analyze-image
  app.post('/api/gemini/analyze-image', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg', requestId, imageId, productDraftId } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ success: false, error: 'No image data provided.' });
      }

      let rawBase64 = imageBase64;
      let detectedMimeType = mimeType;
      if (imageBase64.includes(';base64,')) {
        const parts = imageBase64.split(';base64,');
        rawBase64 = parts[1];
        if (parts[0].includes(':')) {
          detectedMimeType = parts[0].split(':')[1];
        }
      }

      const prompt = `Analyze this product photograph and return a valid JSON object matching:
{
  "productType": string,
  "category": string,
  "colors": string[],
  "material": string,
  "technique": string,
  "lightingQuality": string,
  "backgroundQuality": string,
  "compositionQuality": string,
  "qualityScore": number,
  "recommendations": string[]
}
Output ONLY the JSON object. Describe ONLY what is visible.`;

      const ai = getGeminiClient();
      const { responseText, modelUsed } = await generateWithModelFallback(ai, {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: detectedMimeType,
                  data: rawBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsedAnalysis = parseGeminiJson(responseText);
      return res.json({ success: true, requestId, imageId, productDraftId, modelUsed, analysis: parsedAnalysis });
    } catch (error: any) {
      console.error('Image analysis request failure:', error);
      return res.status(200).json({
        success: false,
        error: 'AI analysis unavailable.',
      });
    }
  });

  // Module 2 — KalaCatalog: Multilingual AI Catalog Generator (English + Natural Indian Hindi + Grounded Specs)
  app.post('/api/gemini/generate-catalog', async (req, res) => {
    try {
      const {
        imageBase64,
        mimeType = 'image/jpeg',
        analysisData,
        voiceOrTextInput = '',
        audioBase64,
        audioMimeType = 'audio/webm',
        inputLang = 'hi',
      } = req.body;

      const ai = getGeminiClient();
      const parts: any[] = [];

      // If user passed recorded audio voice note, attach inline audio data
      if (audioBase64) {
        let cleanAudio = audioBase64;
        let cleanMime = audioMimeType;
        if (audioBase64.includes(';base64,')) {
          const splitA = audioBase64.split(';base64,');
          cleanAudio = splitA[1];
          if (splitA[0].includes(':')) cleanMime = splitA[0].split(':')[1];
        }
        parts.push({
          inlineData: {
            mimeType: cleanMime,
            data: cleanAudio,
          },
        });
      }

      // If image is attached, include it for visual ground truth
      if (imageBase64) {
        let rawBase64 = imageBase64;
        let detectedMimeType = mimeType;
        if (imageBase64.includes(';base64,')) {
          const splitParts = imageBase64.split(';base64,');
          rawBase64 = splitParts[1];
          if (splitParts[0].includes(':')) {
            detectedMimeType = splitParts[0].split(':')[1];
          }
        }
        parts.push({
          inlineData: {
            mimeType: detectedMimeType,
            data: rawBase64,
          },
        });
      }

      const existingAnalysisContext = analysisData
        ? `Existing Verified Visual Analysis:
Product Type: ${analysisData.productType || 'Handcrafted Item'}
Category: ${analysisData.category || 'Handicrafts'}
Primary Material: ${analysisData.material || 'Natural Eco Material'}
Craft Technique: ${analysisData.technique || 'Handmade'}
Colors: ${Array.isArray(analysisData.colors) ? analysisData.colors.join(', ') : 'Natural tones'}
`
        : '';

      const prompt = `You are KalaCatalog, an expert multilingual product catalog generator for traditional Indian artisans and craftspeople.

Context:
${existingAnalysisContext}
Artisan Spoken / Written Notes: "${voiceOrTextInput ? voiceOrTextInput.trim() : 'None provided'}"
Artisan Input Language: "${inputLang}"

GOAL:
Generate a professional e-commerce product catalog in both ENGLISH and natural, culturally authentic INDIAN HINDI.

CRITICAL ANTI-HALLUCINATION RULES:
1. Ground strictly in the photo and artisan notes.
2. Do NOT invent: specific certifications (e.g. Silk Mark, GI tag), awards, exact timber species, historical dates, or geographic origins unless explicitly provided by the artisan.
3. If dimensions or weight are not provided: use "Not provided" or "Needs confirmation".
4. Hindi must be fluent, natural Indian Hindi suitable for real buyers (e.g. "पारंपरिक डिज़ाइन वाली हाथ से तैयार की गई कलाकृति") — NOT awkward word-for-word machine translation. Preserve authentic craft terminology where appropriate.

Return a valid JSON object matching this exact schema:
{
  "productTitleEnglish": string, // Professional English e-commerce title (e.g. "Handcrafted Carved Wooden Peacock Sculpture")
  "productTitleHindi": string, // Natural authentic Hindi product title (e.g. "पारंपरिक हस्तनिर्मित नक्काशीदार लकड़ी का मोर")
  "shortDescriptionEnglish": string, // 1-2 engaging English sentences highlighting craft and aesthetic
  "shortDescriptionHindi": string, // 1-2 natural Hindi sentences highlighting the craft
  "detailedDescriptionEnglish": string, // 2-3 detailed English paragraphs covering craftsmanship, materials, styling & care
  "detailedDescriptionHindi": string, // 2-3 natural Hindi paragraphs covering craft, material & care
  "category": string, // Marketplace category (e.g. "Woodwork & Carving", "Pottery & Ceramics", "Brass & Metalware", "Handloom & Textiles")
  "material": string, // Primary material identified or "Natural Wood / Brass / Clay (Needs confirmation)"
  "craftTechnique": string, // Craft technique (e.g. "Hand Chiseling & Wood Carving", "Wheel Throwing & Terracotta Kiln Firing")
  "colors": string[], // 2-4 dominant visible colors (e.g. ["Walnut Brown", "Golden Amber"])
  "dimensions": {
    "length": string, // e.g. "6 inches" or "Not provided"
    "width": string, // e.g. "4 inches" or "Not provided"
    "height": string // e.g. "10 inches" or "Not provided"
  },
  "weight": string, // e.g. "approx. 450g" or "Not provided"
  "artisanStoryEnglish": string, // Meaningful heritage narrative highlighting traditional Indian artisanal craftsmanship
  "artisanStoryHindi": string, // Authentic Hindi narrative about the heritage of handcrafted art
  "keywordsEnglish": string[], // 5-8 high-volume English SEO search terms
  "keywordsHindi": string[], // 5-8 natural Hindi search terms (e.g. ["हस्तनिर्मित लकड़ी की मूर्ति", "भारतीय हस्तशिल्प"])
  "tags": string[], // 4-6 marketplace tags (e.g. ["Handmade", "HomeDecor", "ArtisanCraft", "EcoFriendly"])
  "confidence": {
    "product": number, // integer 75-98 representing visual identification confidence
    "material": number, // integer 70-95
    "technique": number // integer 70-95
  },
  "status": "AI_DRAFT"
}

Output ONLY the JSON object.`;

      parts.push({ text: prompt });

      const { responseText, modelUsed } = await generateWithModelFallback(ai, {
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsedCatalog = parseGeminiJson(responseText);

      // Normalize fields to ensure 100% compliance with KalaCatalogData
      const normalizedCatalog = {
        productTitleEnglish: parsedCatalog.productTitleEnglish || parsedCatalog.title || parsedCatalog.english?.title || 'Handcrafted Artisan Craft',
        productTitleHindi: parsedCatalog.productTitleHindi || parsedCatalog.titleHindi || parsedCatalog.hindi?.title || 'हस्तनिर्मित भारतीय शिल्प',
        shortDescriptionEnglish: parsedCatalog.shortDescriptionEnglish || parsedCatalog.english?.description || parsedCatalog.englishDescription || '',
        shortDescriptionHindi: parsedCatalog.shortDescriptionHindi || parsedCatalog.hindi?.description || parsedCatalog.hindiDescription || '',
        detailedDescriptionEnglish: parsedCatalog.detailedDescriptionEnglish || parsedCatalog.shortDescriptionEnglish || parsedCatalog.english?.description || '',
        detailedDescriptionHindi: parsedCatalog.detailedDescriptionHindi || parsedCatalog.shortDescriptionHindi || parsedCatalog.hindi?.description || '',
        category: parsedCatalog.category || analysisData?.category || 'Handicrafts & Decor',
        material: parsedCatalog.material || analysisData?.material || 'Eco-friendly craft material',
        craftTechnique: parsedCatalog.craftTechnique || analysisData?.technique || 'Handcrafted traditional technique',
        colors: Array.isArray(parsedCatalog.colors) && parsedCatalog.colors.length > 0 ? parsedCatalog.colors : (analysisData?.colors || ['Natural Tones']),
        dimensions: {
          length: parsedCatalog.dimensions?.length || 'Not provided',
          width: parsedCatalog.dimensions?.width || 'Not provided',
          height: parsedCatalog.dimensions?.height || 'Not provided',
        },
        weight: parsedCatalog.weight || 'Not provided',
        artisanStoryEnglish: parsedCatalog.artisanStoryEnglish || 'Handmade with generational expertise, preserving traditional Indian craft heritage.',
        artisanStoryHindi: parsedCatalog.artisanStoryHindi || 'पारंपरिक भारतीय शिल्पकला की धरोहर को संजोते हुए पीढ़ियों के अनुभव से निर्मित।',
        keywordsEnglish: Array.isArray(parsedCatalog.keywordsEnglish) ? parsedCatalog.keywordsEnglish : (parsedCatalog.seoKeywords || ['Indian Handicrafts', 'Handmade Craft']),
        keywordsHindi: Array.isArray(parsedCatalog.keywordsHindi) ? parsedCatalog.keywordsHindi : ['भारतीय हस्तशिल्प', 'हस्तनिर्मित उत्पाद'],
        tags: Array.isArray(parsedCatalog.tags) ? parsedCatalog.tags : ['Handmade', 'Artisan', 'IndianCraft'],
        confidence: {
          product: typeof parsedCatalog.confidence?.product === 'number' ? parsedCatalog.confidence.product : 90,
          material: typeof parsedCatalog.confidence?.material === 'number' ? parsedCatalog.confidence.material : 85,
          technique: typeof parsedCatalog.confidence?.technique === 'number' ? parsedCatalog.confidence.technique : 85,
        },
        status: 'AI_DRAFT',
        // Backward-compatibility fields
        productName: parsedCatalog.productTitleEnglish || parsedCatalog.productName || 'Handcrafted Artisan Craft',
        hindiName: parsedCatalog.productTitleHindi || parsedCatalog.hindiName || 'हस्तनिर्मित भारतीय शिल्प',
        englishDescription: parsedCatalog.detailedDescriptionEnglish || parsedCatalog.shortDescriptionEnglish || '',
        hindiDescription: parsedCatalog.detailedDescriptionHindi || parsedCatalog.shortDescriptionHindi || '',
        seoKeywords: Array.isArray(parsedCatalog.keywordsEnglish) ? parsedCatalog.keywordsEnglish : ['Indian Handicrafts'],
      };

      return res.json({
        success: true,
        catalog: normalizedCatalog,
        model: modelUsed,
      });
    } catch (error: any) {
      console.error('[KalaCatalog] Generation error:', error?.message || error);
      return res.status(200).json({
        success: false,
        error: 'Catalog generation could not be completed.',
      });
    }
  });

  // Module 3 — KalaPrice: AI-Assisted Transparent Pricing Explanation
  app.post('/api/gemini/explain-price', async (req, res) => {
    try {
      const {
        productName = 'Handcrafted Item',
        category = 'Handicrafts',
        material = 'Craft material',
        craftTechnique = 'Handmade',
        craftComplexity = 'Skilled Artisan',
        materialCost = 400,
        labourCost = 600,
        hoursRequired = 6,
        labourRate = 100,
        packagingCost = 50,
        shippingCost = 100,
        additionalExpenses = 50,
        productionCost = 1200,
        profitMargin = 25,
        basePrice = 1500,
        recommendedPrice = 1499,
        marketLow = 1300,
        marketMedian = 1500,
        marketHigh = 1800,
        benchmarkCategory = 'Prototype Market Benchmark',
      } = req.body;

      const ai = getGeminiClient();
      const prompt = `You are KalaPrice, an AI pricing assistant helping Indian rural and traditional artisans price their handcrafted items transparently and fairly.

Product Details:
- Name: "${productName}"
- Category: "${category}"
- Material: "${material}"
- Craft Technique: "${craftTechnique}"
- Craft Complexity: "${craftComplexity}"

Calculated Numbers:
- Material Cost: ₹${materialCost}
- Labour Cost: ₹${labourCost} (${hoursRequired} hours @ ₹${labourRate}/hour)
- Packaging: ₹${packagingCost}
- Shipping: ₹${shippingCost}
- Additional Expenses: ₹${additionalExpenses}
- Total Production Cost: ₹${productionCost}
- Desired Profit Margin: ${profitMargin}%
- Base Selling Price: ₹${basePrice}
- Recommended Selling Price: ₹${recommendedPrice}
- Prototype Market Benchmark Range: ₹${marketLow} — ₹${marketHigh} (Median: ₹${marketMedian})

STRICT RULES:
1. Explain clearly WHY this specific price (₹${recommendedPrice}) is suggested based on the provided production costs and profit margin.
2. Ground your response ONLY in the numbers provided above.
3. Do NOT invent competitor names, live market feed data, or claim this is a machine learning prediction.
4. Keep the explanation simple and friendly for artisans with low digital literacy.
5. Provide both English and natural conversational Hindi.

Return a valid JSON object matching:
{
  "explanationEnglish": "Your suggested price is ₹${recommendedPrice} because the estimated production cost is ₹${productionCost} and your selected profit margin is ${profitMargin}%. The price also falls comfortably within the prototype benchmark range for similar handcrafted ${category}.",
  "explanationHindi": "आपका अनुशंसित मूल्य ₹${recommendedPrice} है क्योंकि अनुमानित उत्पादन लागत ₹${productionCost} है और आपका चुना हुआ लाभ मार्जिन ${profitMargin}% है। यह मूल्य समान हस्तशिल्प के प्रोटोटाइप बेंचमार्क दायरे में पूरी तरह उपयुक्त है।",
  "reasonsEnglish": [
    "Covers your estimated production cost of ₹${productionCost}",
    "Includes your fair ${profitMargin}% profit margin",
    "Considers handmade craftsmanship and ${hoursRequired} hours of artisan labour",
    "Falls within the prototype market benchmark (₹${marketLow} - ₹${marketHigh})",
    "Suitable for fair-trade marketplace selling"
  ],
  "reasonsHindi": [
    "आपकी अनुमानित उत्पादन लागत (₹${productionCost}) को पूरी तरह कवर करता है",
    "आपके ${profitMargin}% के उचित लाभ मार्जिन को शामिल करता है",
    "हस्तशिल्प और ${hoursRequired} घंटे की कारीगरी मेहनत का सम्मान करता है",
    "प्रोटोटाइप बाजार बेंचमार्क (₹${marketLow} - ₹${marketHigh}) के दायरे में है",
    "मार्केटप्लेस में उचित मूल्य पर बिक्री के लिए उपयुक्त है"
  ]
}

Output ONLY the JSON object.`;

      const { responseText } = await generateWithModelFallback(ai, {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = parseGeminiJson(responseText);
      return res.json({
        success: true,
        data: parsed,
      });
    } catch (err: any) {
      console.warn('[KalaPrice] Gemini explanation fallback:', err?.message || err);
      // Deterministic fallback if offline/rate-limited
      const {
        productionCost = 1200,
        profitMargin = 25,
        recommendedPrice = 1499,
        category = 'handicrafts',
        hoursRequired = 6,
        marketLow = 1300,
        marketHigh = 1800,
      } = req.body || {};

      return res.json({
        success: true,
        data: {
          explanationEnglish: `Your suggested price is ₹${recommendedPrice.toLocaleString('en-IN')} because the estimated production cost is ₹${productionCost.toLocaleString('en-IN')} and your selected profit margin is ${profitMargin}%. The price also aligns with the prototype benchmark range (₹${marketLow.toLocaleString('en-IN')} - ₹${marketHigh.toLocaleString('en-IN')}) for similar handcrafted ${category}.`,
          explanationHindi: `आपका अनुशंसित विक्रय मूल्य ₹${recommendedPrice.toLocaleString('en-IN')} है क्योंकि आपकी कुल उत्पादन लागत ₹${productionCost.toLocaleString('en-IN')} है और लाभ मार्जिन ${profitMargin}% है। यह मूल्य हस्तशिल्प के प्रोटोटाइप बेंचमार्क के अनुकूल है।`,
          reasonsEnglish: [
            `Covers your estimated production cost of ₹${productionCost.toLocaleString('en-IN')}`,
            `Includes your selected ${profitMargin}% profit margin`,
            `Considers handmade craftsmanship and ${hoursRequired} hours of artisan labour`,
            `Falls within the prototype market benchmark (₹${marketLow.toLocaleString('en-IN')} - ₹${marketHigh.toLocaleString('en-IN')})`,
            `Suitable for marketplace selling`,
          ],
          reasonsHindi: [
            `आपकी कुल उत्पादन लागत ₹${productionCost.toLocaleString('en-IN')} को पूरा करता है`,
            `आपके चुने हुए ${profitMargin}% लाभ को जोड़ता है`,
            `कारीगर के ${hoursRequired} घंटे के हस्तनिर्मित श्रम का उचित मूल्य देता है`,
            `प्रोटोटाइप बाजार बेंचमार्क (₹${marketLow.toLocaleString('en-IN')} - ₹${marketHigh.toLocaleString('en-IN')}) के भीतर है`,
            `ऑनलाइन और मेलों में बिक्री के लिए उपयुक्त है`,
          ],
        },
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();


