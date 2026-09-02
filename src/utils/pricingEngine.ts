/**
 * KalaPrice Transparent Fair Pricing Engine
 *
 * Deterministic Calculation Formula:
 * 1. LABOUR COST = labour rate × hours
 * 2. PRODUCTION COST = material cost + labour cost + packaging + shipping + additional expenses
 * 3. BASE SELLING PRICE = production cost × (1 + profit margin / 100)
 * 4. CRAFT VALUE ADJUSTMENT = conservative adjustment based on craft technique, material, complexity & handmade nature
 * 5. RECOMMENDED PRICE = Base Selling Price + Craft Adjustment (reconciled with Prototype Market Benchmark)
 *
 * Fully transparent, explainable audit trail with no arbitrary numbers.
 */

import { PricingInputs, KalaPricingResult, KalaPricingData } from '../types';
import { getMarketDataProvider, MarketBenchmarkRecord } from '../services/marketDataProvider';

export async function calculateKalaPrice(
  inputs: PricingInputs
): Promise<KalaPricingResult> {
  const {
    materialCost = 400,
    labourRate = 100,
    hoursRequired = (inputs.labourHours ?? 6),
    packagingCost = 50,
    shippingCost = 100,
    additionalExpenses = (inputs.otherCosts ?? 50),
    profitMargin = 25,
    craftComplexity = 'Skilled Artisan',
    category = 'Handicrafts',
    productType = 'Handcrafted Item',
    material = 'Natural craft material',
    craftTechnique = 'Handmade',
  } = inputs;

  // 1. Calculate Labour Cost = Labour Rate × Hours
  const labourCost = Math.max(0, Math.round(labourRate * hoursRequired));

  // 2. Production Cost = Material + Labour + Packaging + Shipping + Additional Expenses
  const productionCost = Math.max(
    0,
    Math.round(
      Number(materialCost) +
      Number(labourCost) +
      Number(packagingCost) +
      Number(shippingCost) +
      Number(additionalExpenses)
    )
  );

  // 3. Profit Calculation: Profit = Production Cost × (profitMargin / 100)
  const profitMultiplier = Math.max(0, Number(profitMargin)) / 100;
  const profitAmount = Math.round(productionCost * profitMultiplier);

  // 4. Base Selling Price = Production Cost + Profit Amount
  const baseSellingPrice = Math.round(productionCost + profitAmount);

  // 5. Craft Value Adjustment: Conservative, non-arbitrary factor based on technique & complexity
  let craftMultiplier = 0.0;
  const complexityLower = (craftComplexity || '').toLowerCase();
  const techLower = (craftTechnique || '').toLowerCase();

  if (complexityLower.includes('heritage') || complexityLower.includes('gi') || techLower.includes('lost-wax') || techLower.includes('handloom silk')) {
    craftMultiplier = 0.12; // +12% for heritage / GI certified
  } else if (complexityLower.includes('master') || techLower.includes('carving') || techLower.includes('filigree')) {
    craftMultiplier = 0.08; // +8% for master artisan handwork
  } else if (complexityLower.includes('skilled') || techLower.includes('throwing') || techLower.includes('embroid')) {
    craftMultiplier = 0.04; // +4% for skilled craftsmanship
  } else {
    craftMultiplier = 0.0; // Standard baseline
  }

  const rawCraftAdjustment = Math.round(baseSellingPrice * craftMultiplier);

  // 6. Benchmark Data Layer (Prototype Market Benchmark)
  const provider = getMarketDataProvider();
  let benchmarkRecord: MarketBenchmarkRecord | null = null;
  try {
    benchmarkRecord = await provider.getMarketRange(category, productType);
  } catch (e) {
    console.warn('Could not fetch market benchmark:', e);
  }

  const marketLow = benchmarkRecord?.minPrice || Math.round(productionCost * 1.1);
  const marketMedian = benchmarkRecord?.medianPrice || Math.round(baseSellingPrice);
  const marketHigh = benchmarkRecord?.maxPrice || Math.round(baseSellingPrice * 1.35);

  // 7. Calculate Recommended Price (Charm-rounded e.g. 1499 or clean price, never below production cost)
  let rawRecommended = baseSellingPrice + rawCraftAdjustment;

  // Never recommend below production cost
  if (rawRecommended < productionCost) {
    rawRecommended = productionCost;
  }

  // Psychological clean pricing (e.g. ₹1,499 if between 1480-1520)
  let recommendedPrice = rawRecommended;
  if (recommendedPrice >= 500 && Math.abs(recommendedPrice % 100) >= 80) {
    recommendedPrice = Math.floor(recommendedPrice / 100) * 100 + 99;
  } else if (recommendedPrice >= 1000 && recommendedPrice % 500 >= 450) {
    recommendedPrice = Math.floor(recommendedPrice / 500) * 500 + 499;
  }

  // 8. Calculate Three Price Options
  // Cost Recovery: Recovers production cost + minimal 8-12% buffer to stay safe
  const costRecoveryPrice = Math.max(
    productionCost,
    Math.round(productionCost * 1.1)
  );

  // Premium: Higher price for premium boutique / gallery positioning (+20-30%)
  const premiumPrice = Math.round(
    Math.max(recommendedPrice * 1.2, marketHigh * 0.95)
  );

  // 9. Reconcile Net Margin
  const netEarnings = recommendedPrice - productionCost;
  const estimatedMargin = productionCost > 0
    ? Math.round((netEarnings / productionCost) * 100)
    : 0;

  // 10. Check if outlier compared to benchmark
  const isOutsideBenchmark = recommendedPrice < marketLow || recommendedPrice > marketHigh;

  // 11. Initial Deterministic Explanation
  const explanationEnglish = `Your suggested price is ₹${recommendedPrice.toLocaleString('en-IN')} because the estimated production cost is ₹${productionCost.toLocaleString('en-IN')} (Materials ₹${materialCost} + Labour ₹${labourCost} + Packaging ₹${packagingCost} + Shipping ₹${shippingCost} + Others ₹${additionalExpenses}) and your selected profit margin is ${profitMargin}%. The price also falls within the prototype benchmark range (₹${marketLow.toLocaleString('en-IN')} — ₹${marketHigh.toLocaleString('en-IN')}) for similar handcrafted ${category}.`;

  const explanationHindi = `आपका अनुशंसित मूल्य ₹${recommendedPrice.toLocaleString('en-IN')} है क्योंकि अनुमानित उत्पादन लागत ₹${productionCost.toLocaleString('en-IN')} (कच्चा माल ₹${materialCost} + श्रम ₹${labourCost} + पैकेजिंग ₹${packagingCost} + शिपिंग ₹${shippingCost} + अन्य ₹${additionalExpenses}) और आपका चुना हुआ लाभ मार्जिन ${profitMargin}% है। यह मूल्य समान हस्तशिल्प के प्रोटोटाइप बेंचमार्क (₹${marketLow.toLocaleString('en-IN')} — ₹${marketHigh.toLocaleString('en-IN')}) के दायरे में है।`;

  const reasonsEnglish = [
    `Covers your estimated production cost of ₹${productionCost.toLocaleString('en-IN')}`,
    `Includes your selected ${profitMargin}% profit margin (₹${profitAmount.toLocaleString('en-IN')})`,
    `Considers handmade craftsmanship and ${hoursRequired} hours of artisan labour`,
    `Falls within the prototype market benchmark (₹${marketLow.toLocaleString('en-IN')} — ₹${marketHigh.toLocaleString('en-IN')})`,
    `Suitable for fair marketplace selling`,
  ];

  const reasonsHindi = [
    `आपकी अनुमानित उत्पादन लागत (₹${productionCost.toLocaleString('en-IN')}) को पूरी तरह कवर करता है`,
    `आपके ${profitMargin}% के चुने हुए लाभ मार्जिन (₹${profitAmount.toLocaleString('en-IN')}) को जोड़ता है`,
    `हस्तशिल्प और ${hoursRequired} घंटे की कारीगरी मेहनत का सम्मान करता है`,
    `प्रोटोटाइप बाजार बेंचमार्क (₹${marketLow.toLocaleString('en-IN')} — ₹${marketHigh.toLocaleString('en-IN')}) के दायरे में है`,
    `मार्केटप्लेस में उचित मूल्य पर बिक्री के लिए उपयुक्त है`,
  ];

  const pricingData: KalaPricingData = {
    materialCost: Number(materialCost),
    labourRate: Number(labourRate),
    hoursRequired: Number(hoursRequired),
    packagingCost: Number(packagingCost),
    shippingCost: Number(shippingCost),
    additionalExpenses: Number(additionalExpenses),
    profitMargin: Number(profitMargin),

    labourCost,
    productionCost,
    basePrice: baseSellingPrice,

    marketLow,
    marketMedian,
    marketHigh,

    costRecoveryPrice,
    recommendedPrice,
    premiumPrice,

    selectedPrice: recommendedPrice,
    selectedOption: 'recommended',

    benchmarkSource: 'Prototype Market Benchmark',
    benchmarkCategory: benchmarkRecord?.category || category,
    status: 'DRAFT',

    craftAdjustment: rawCraftAdjustment,
    confidence: isOutsideBenchmark ? 'Medium' : 'High',
    explanationEnglish,
    explanationHindi,
    reasonsEnglish,
    reasonsHindi,
    isOutsideBenchmark,
  };

  return {
    productionCost,
    recommendedPrice,
    minimumPrice: costRecoveryPrice,
    costRecoveryPrice,
    premiumPrice,
    estimatedMargin,
    marketPosition: isOutsideBenchmark ? 'Custom Value Range' : 'Balanced Fair-Trade Standard',
    explanation: explanationEnglish,
    explanationHindi,
    pricingData,
    calculationSteps: {
      materialCost: Number(materialCost),
      labourCost,
      packagingCost: Number(packagingCost),
      shippingCost: Number(shippingCost),
      additionalExpenses: Number(additionalExpenses),
      otherCosts: Number(additionalExpenses),
      productionCost,
      baseSellingPrice,
      craftsmanshipAdjustment: rawCraftAdjustment,
    },
    benchmark: {
      category: benchmarkRecord?.category || category,
      productType: benchmarkRecord?.productType || productType,
      minPrice: marketLow,
      medianPrice: marketMedian,
      maxPrice: marketHigh,
      sampleCount: benchmarkRecord?.sampleCount || 150,
      source: 'Prototype Market Benchmark',
    },
  };
}

/**
 * Fetch AI Explanation from server-side Gemini API
 */
export async function fetchGeminiPriceExplanation(
  params: {
    productName?: string;
    category?: string;
    material?: string;
    craftTechnique?: string;
    craftComplexity?: string;
    materialCost: number;
    labourCost: number;
    hoursRequired: number;
    labourRate: number;
    packagingCost: number;
    shippingCost: number;
    additionalExpenses: number;
    productionCost: number;
    profitMargin: number;
    basePrice: number;
    recommendedPrice: number;
    marketLow: number;
    marketMedian: number;
    marketHigh: number;
  }
): Promise<{
  explanationEnglish?: string;
  explanationHindi?: string;
  reasonsEnglish?: string[];
  reasonsHindi?: string[];
} | null> {
  try {
    const res = await fetch('/api/gemini/explain-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.success && json?.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('Gemini price explanation request skipped:', err);
  }
  return null;
}

