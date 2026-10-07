// api/ai-recommend.js
// Production AI Crystal Concierge & Conversational Assistant
// Serves /api/ai-recommend for Express (server.js) & Vercel serverless

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// In-memory catalog cache (5 minutes TTL)
let cachedProducts = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

// Rate limiting map: ip -> { count, resetTime }
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 40;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  record.count += 1;
  return true;
}

// Clean up stale rate limits periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, rec] of rateLimitMap.entries()) {
    if (now > rec.resetTime) rateLimitMap.delete(ip);
  }
}, 5 * 60 * 1000);

async function getCatalog() {
  const now = Date.now();
  if (cachedProducts && (now - lastFetchTime < CACHE_TTL_MS)) {
    return cachedProducts;
  }

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in ai-recommend');
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, category, price, original_price, stock, active, slug, description, effect, intentions, chakra, is_gift_shop, is_new_arrival, is_festive_offer')
      .order('price', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      return cachedProducts || [];
    }

    const valid = (data || []).filter(p => p && p.active !== false && p.id && p.name && (p.stock === null || p.stock === undefined || p.stock > 0));
    cachedProducts = valid;
    lastFetchTime = now;
    return valid;
  } catch (err) {
    console.error('Error fetching catalog:', err);
    return cachedProducts || [];
  }
}

// Check if query is OUT-OF-CONTEXT (general knowledge, casual chat, math, jokes, etc.)
function detectOutOfContext(userMessage) {
  const text = userMessage.toLowerCase().trim();

  // Explicit general conversation patterns
  const outOfContextPatterns = [
    /\b(tell me a joke|say something funny|make me laugh|joke)\b/i,
    /\b(capital of|who is the prime minister|who is the president|who was|who wrote|who invented)\b/i,
    /\b(what is the weather|what's the weather|is it raining|temperature outside)\b/i,
    /\b(speed of light|distance to the moon|photosynthesis|how do airplanes fly|theory of relativity)\b/i,
    /\b(what is 2\+|what is \d+\s*[\+\-\*\/]\s*\d+)\b/i,
    /\b(how are you|how do you do|how's it going|how are you doing)\b/i,
    /\b(who created you|who made you|are you a robot|are you an ai)\b/i,
    /\b(write a poem|write a song|write a story)\b/i,
    /\b(meaning of life|philosophy of|what is meditation|what is yoga)\b/i,
  ];

  for (const pat of outOfContextPatterns) {
    if (pat.test(text)) return true;
  }

  // Keywords related to crystals, store, shopping, wellness, or spiritual intentions
  const inContextKeywords = [
    'crystal', 'crystals', 'stone', 'stones', 'gem', 'gemstone', 'bracelet', 'pendant',
    'mala', 'tree', 'trees', 'pyramid', 'pyramids', 'lamp', 'lamps', 'tumble', 'tumbles',
    'cluster', 'selenite', 'amethyst', 'pyrite', 'citrine', 'rose quartz', 'clear quartz',
    'black tourmaline', 'tiger', 'aventurine', 'jade', 'carnelian', 'sodalite', 'hematite',
    'sacred', 'store', 'order', 'cart', 'buy', 'purchase', 'shipping', 'delivery', 'refund',
    'return', 'tracking', 'cod', 'cash on delivery', 'reiki', 'cleanse', 'charging', 'gift',
    'gifting', 'budget', 'price', 'rupees', 'rs', 'inr', 'discount', 'coupon', 'stress',
    'calm', 'anxiety', 'protection', 'evil eye', 'nazar', 'wealth', 'abundance', 'money',
    'love', 'focus', 'sleep', 'chakra', 'intentions', 'recommend', 'options'
  ];

  const hasInContextKeyword = inContextKeywords.some(kw => text.includes(kw));

  // If it has question format ("what is...", "who is...", "how do I...") and ZERO in-context keywords:
  const isGeneralQuestion = /^(what|who|when|where|why|how|can you tell me|do you know)\b/i.test(text);
  if (isGeneralQuestion && !hasInContextKeyword) {
    return true;
  }

  return false;
}

// Answer general out-of-context questions naturally without forcing crystals or legal lectures
function answerOutOfContext(userMessage) {
  const text = userMessage.toLowerCase().trim();

  // Jokes
  if (/\b(joke|funny|laugh)\b/i.test(text)) {
    const jokes = [
      "Why don't scientists trust atoms? Because they make up everything! 😄",
      "Why did the scarecrow win an award? Because he was outstanding in his field! 🌾",
      "What do you call fake spaghetti? An impasta! 🍝"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  // Math
  const mathMatch = text.match(/what is\s*(\d+)\s*([\+\-\*\/])\s*(\d+)/i) || text.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/i);
  if (mathMatch) {
    const n1 = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const n2 = parseFloat(mathMatch[3]);
    let ans = 0;
    if (op === '+') ans = n1 + n2;
    else if (op === '-') ans = n1 - n2;
    else if (op === '*') ans = n1 * n2;
    else if (op === '/') ans = n2 !== 0 ? n1 / n2 : 'undefined (division by zero)';
    return `${n1} ${op} ${n2} = ${ans}`;
  }

  // Common general knowledge / Capitals
  if (/capital of france/i.test(text)) return "The capital of France is Paris.";
  if (/capital of (india|bharat)/i.test(text)) return "The capital of India is New Delhi.";
  if (/capital of japan/i.test(text)) return "The capital of Japan is Tokyo.";
  if (/capital of (usa|united states|america)/i.test(text)) return "The capital of the United States is Washington, D.C.";
  if (/capital of (uk|united kingdom|england)/i.test(text)) return "The capital of the United Kingdom is London.";
  if (/capital of australia/i.test(text)) return "The capital of Australia is Canberra.";
  if (/capital of germany/i.test(text)) return "The capital of Germany is Berlin.";
  if (/capital of italy/i.test(text)) return "The capital of Italy is Rome.";
  if (/capital of canada/i.test(text)) return "The capital of Canada is Ottawa.";
  if (/capital of spain/i.test(text)) return "The capital of Spain is Madrid.";

  // Casual chit-chat
  if (/how are you/i.test(text)) {
    return "I'm doing well, thank you for asking! How is your day going? Let me know if there's anything I can help you with ✨";
  }

  if (/who are you|who made you|are you an ai|are you a robot/i.test(text)) {
    return "I'm Sacred ✨, your assistant here at The Sacred Store. I'm here to chat, answer questions, or help you find anything you need.";
  }

  if (/what is meditation/i.test(text)) {
    return "Meditation is a practice where an individual uses a technique—such as mindfulness or focusing the mind on a particular object, thought, or activity—to train attention and awareness, achieving a mentally clear and emotionally calm state.";
  }

  if (/what is yoga/i.test(text)) {
    return "Yoga is an ancient spiritual, mental, and physical discipline originating in India that unites the body, mind, and breath through postures (asanas), breath regulation (pranayama), and meditation.";
  }

  if (/meaning of life/i.test(text)) {
    return "That's one of life's greatest questions! Many believe the meaning of life comes from finding joy in the present, connecting deeply with others, growing as a person, and living with purpose and compassion.";
  }

  if (/weather/i.test(text)) {
    return "I don't have access to live meteorological data, but I hope the weather is pleasant and clear wherever you are today!";
  }

  // Graceful general response
  return "That's an interesting question! I'm happy to chat about anything on your mind. Let me know if you need any other information or if you'd like to explore anything specific today ✨";
}

// ─── FOLLOW-UP QUESTION DETECTION (post-recommendation) ────────────────────
// After the AI has already recommended products, users ask questions ABOUT
// those recommendations or about crystals in general. These must be answered
// directly without re-sending product cards.

function detectFollowUpQuestion(latestText, historyLength) {
  // Needs at least one prior exchange (greeting + user + assistant = 2 history items)
  if (historyLength < 2) return null;

  const t = latestText.toLowerCase().trim();

  // Skip if this is clearly a NEW product request
  if (/\b(show me|recommend|give me|find me|i want|i need|suggest|looking for|search for)\b/i.test(t) &&
      /\b(another|different|new|more options|other|something else)\b/i.test(t)) {
    return null; // Let the recommendation pipeline handle this
  }

  // Genuineness / authenticity
  if (/\b(genuine|real|natural|authentic|original|fake|synthetic|lab.?made|man.?made|certified|certificate|legit)\b/i.test(t)) {
    return 'authenticity';
  }
  // Usage / wearing / care
  if (/\b(how (to|do i|should i|can i) (use|wear|keep|store|place|activate)|can i wear|wear it|wear daily|wear every\s?day|where (to|should i|do i|can i) (put|place|keep)|how to take care)\b/i.test(t)) {
    return 'usage';
  }
  // Effectiveness / does it work
  if (/\b(does (it|this|crystal|they) work|actually work|really work|is it effective|do crystals (actually |really )?work|believe in|scientific|proof|proven)\b/i.test(t)) {
    return 'effectiveness';
  }
  // Comparison / which one
  if (/\b(which (one|is better|should i|do you recommend)|difference between|compare|better one|best one|pick one|choose one|between these)\b/i.test(t)) {
    return 'comparison';
  }
  // Tell me more / specific crystal info
  if (/\b(tell me more|more about|what does .+ do|properties of|benefits of|meaning of|what is .+ used for|what (is|are) .+ good for)\b/i.test(t)) {
    return 'more_info';
  }
  // Size / weight / dimensions
  if (/\b(how big|how heavy|what size|dimensions|weight|how large|how small|inches|centimeters|grams)\b/i.test(t)) {
    return 'size_info';
  }
  // Can I combine / stack
  if (/\b(combine|stack|wear together|pair|mix|multiple crystals|two crystals|clash)\b/i.test(t)) {
    return 'combining';
  }
  // Safety
  if (/\b(is it safe|safe to wear|safe for (kids|children|pets|baby|pregnant)|side effects?|harmful|allergic|allergy|toxic)\b/i.test(t)) {
    return 'safety';
  }
  // Water / shower / swimming
  if (/\b(water|shower|swim|rain|wet|bath|washing)\b/i.test(t) && !/\b(buy|want|need|looking)\b/i.test(t)) {
    return 'water_care';
  }
  // Simple acknowledgments
  if (/^(thanks?|thank you|thankyou|ty|ok(ay)?|great|perfect|nice|cool|awesome|got it|understood|alright|amazing|wonderful|lovely|beautiful|super)\s*[!.✨]*$/i.test(t)) {
    return 'acknowledgment';
  }
  // Yes / no short responses
  if (/^(yes|no|yeah|yep|yup|nope|nah|sure|definitely|absolutely|of course|not really|i think so|maybe)\s*[!.]*$/i.test(t)) {
    return 'yes_no';
  }
  // Emoji-only
  if (/^[\s❤️💎✨🙏😍🔥👍💜🤩😊🥰💖☺️🌟⭐🪨]+$/u.test(t)) {
    return 'acknowledgment';
  }

  return null;
}

function answerFollowUp(followUpType) {
  switch (followUpType) {
    case 'authenticity':
      return "Absolutely — every crystal at The Sacred Store is 100% natural, ethically sourced, and individually verified for authenticity. Each piece is spiritually cleansed and Reiki-charged by our certified master healer before it reaches you. We never sell synthetic, lab-created, dyed, or heat-treated stones.\n\nWould you like to know anything else, or are you ready to add something to your cart? ✨";

    case 'usage':
      return "Great question!\n\n• **Bracelets & pendants** — Wear them daily, ideally touching your skin. Set a quiet intention when you first put them on.\n• **Crystal trees, pyramids & lamps** — Place them in your living room, workspace, or bedside for continuous energy flow.\n• **Tumble stones** — Carry in your pocket or keep on your desk as a grounding touch-point.\n\nTo keep your crystal vibrant, cleanse it weekly by placing it on a Selenite plate, under moonlight, or with incense smoke.";

    case 'effectiveness':
      return "Crystals have been used for thousands of years across ancient civilizations — from Indian Vedic traditions to Egyptian and Chinese practices — for their energetic and meditative properties.\n\nMany people experience a noticeable shift in mindset, focus, or emotional calm when working intentionally with crystals. While it's a spiritual and wellness practice (not a medical treatment), the ritual of choosing, wearing, and connecting with a stone can be a powerful daily anchor for your intentions.\n\nThe experience is deeply personal — and most customers tell us they feel the difference within the first few days ✨";

    case 'comparison':
      return "Each piece carries its own distinct energy, so the best choice depends on what resonates with you:\n\n• **For daily wear** → A bracelet or pendant stays with you all day\n• **For your home or workspace** → A crystal tree, pyramid, or lamp anchors energy continuously\n• **If you feel drawn to a specific one** → Trust that intuitive pull — it's often the most powerful guide\n\nWould you like me to compare any two specific pieces in more detail?";

    case 'more_info':
      return "I'd love to tell you more! Click **'View Product'** on any recommendation to see the full details, or tell me the name of the specific crystal you're curious about and I'll share its properties, best uses, and how it supports your intention ✨";

    case 'size_info':
      return "Each product page has exact dimensions, weight, and detailed photographs. As a general guide:\n\n• **Bracelets** — Elastic fit, comfortable on most wrists (7–8 inch circumference)\n• **Pendants** — Compact and lightweight for everyday wear\n• **Crystal trees** — Typically 6–10 inches tall, handcrafted\n• **Pyramids** — Palm-sized to desk-sized (2–4 inches)\n• **Tumbles** — Smooth pocket stones, roughly 1–2 inches\n\nClick 'View Product' on any recommendation to see exact specs.";

    case 'combining':
      return "Yes, you can absolutely combine crystals! A few guidelines:\n\n• **Complementary energies work best** — e.g. Amethyst (calm) + Rose Quartz (love) is a beautiful pairing\n• **Protection stones pair well with anything** — Black Tourmaline or Tiger's Eye alongside any other crystal\n• **Avoid opposing extremes** — e.g. a high-energy stone like Carnelian with a deeply calming stone like Amethyst may feel unbalanced for some people\n• **Trust your intuition** — if a combination feels right, it usually is\n\nWould you like me to suggest a complementary piece to go with your pick? ✨";

    case 'safety':
      return "All our crystals are completely safe to wear and keep in your home. They are natural minerals with no chemicals, coatings, or treatments.\n\n• Safe for daily skin contact\n• Safe around children (though small tumbles should be kept away from very young children as a choking precaution)\n• Not a substitute for medical advice or medication\n\nOur pieces are worn daily by thousands of customers with no issues whatsoever ✨";

    case 'water_care':
      return "Good question — it depends on the stone:\n\n• **Water-safe** — Clear Quartz, Amethyst, Rose Quartz, Tiger's Eye, Citrine (brief rinses are fine)\n• **Avoid water** — Selenite, Malachite, Pyrite, Hematite, Lapis Lazuli (they can dissolve, rust, or lose their polish)\n\n**Tip:** Remove crystal bracelets before showering or swimming to be safe, and always dry them promptly if they get wet.\n\nFor cleansing, a Selenite charging plate is the safest universal method for all stones.";

    case 'acknowledgment':
      return "You're welcome! ✨ Let me know if you'd like to explore something else, learn more about any crystal, or if you're ready to add a piece to your cart.";

    case 'yes_no':
      return "Got it! Would you like me to help with anything else — perhaps explore a different intention, find something in a specific budget, or learn more about any of the recommended pieces? ✨";

    default:
      return null;
  }
}

// Extract conversation dimensions and constraints
function extractDimensions(userMessage, history = []) {
  // Only extract customer intent from user messages (not from AI assistant questions)
  const userHistory = history.filter(h => h.role === 'user').map(h => h.content || '');
  let fullText = [...userHistory, userMessage].join(' ').toLowerCase();
  // Normalize numbers with commas like 1,000 -> 1000
  fullText = fullText.replace(/(\d+),(\d+)/g, '$1$2');
  let latestText = userMessage.toLowerCase().replace(/(\d+),(\d+)/g, '$1$2');

  // Check out-of-context first
  const isOutOfContext = detectOutOfContext(userMessage);

  // 1. Budget extraction (HARD CONSTRAINT)
  let budget = null;
  const budgetPatterns = [
    /under\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/i,
    /below\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/i,
    /within\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/i,
    /max\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/i,
    /budget\s*(?:is|of|around)?\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/i,
    /(?:rs\.?|inr|₹)\s*(\d{2,5})\s*(?:max|budget|limit)?/i,
    /(\d{2,5})\s*(?:rupees|rs|bucks|inr)/i,
    /around\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/i,
    /less than\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/i,
    /spend\s*(?:up\s*to)?\s*(?:rs\.?|inr|₹)?\s*(\d{2,5})/i,
  ];

  for (const pat of budgetPatterns) {
    const match = fullText.match(pat);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (parsed >= 100 && parsed <= 50000) {
        budget = parsed;
        break;
      }
    }
  }

  // 2. Explicit requested count
  let requestedCount = null;
  const countMatch = latestText.match(/(?:give|show|recommend|find|suggest)\s*(?:me\s*)?(?:the\s*|your\s*)?(?:best\s*|top\s*)?(\d+)/i) ||
                     latestText.match(/(\d+)\s*(?:options|products|items|recommendations|choices|pieces|crystals)/i) ||
                     latestText.match(/top\s*(\d+)/i);
  if (countMatch && countMatch[1]) {
    const num = parseInt(countMatch[1], 10);
    if (num >= 1 && num <= 8) requestedCount = num;
  }
  if (/\b(show\s*all|show\s*everything|all\s*options)\b/i.test(latestText)) {
    requestedCount = 6;
  }

  // 3. Recipient extraction
  let recipient = null;
  let isGift = false;
  if (/\b(mom|mother|mummy|maa)\b/.test(fullText)) {
    recipient = 'mother';
    isGift = true;
  } else if (/\b(sister|sis)\b/.test(fullText)) {
    recipient = 'sister';
    isGift = true;
  } else if (/\b(girlfriend|gf|partner|wife|fiancée|fiancee)\b/.test(fullText)) {
    recipient = 'girlfriend';
    isGift = true;
  } else if (/\b(dad|father|papa)\b/.test(fullText)) {
    recipient = 'father';
    isGift = true;
  } else if (/\b(boyfriend|bf|husband)\b/.test(fullText)) {
    recipient = 'boyfriend';
    isGift = true;
  } else if (/\b(friend|colleague|boss)\b/.test(fullText)) {
    recipient = 'friend';
    isGift = true;
  } else if (/\b(myself|for me|my own|i want for myself)\b/.test(fullText)) {
    recipient = 'self';
    isGift = false;
  } else if (/\b(gift|gifting|present)\b/.test(fullText)) {
    isGift = true;
  }

  // 4. Occasion
  let occasion = null;
  if (/\b(birthday|bday)\b/.test(fullText)) occasion = 'birthday';
  else if (/\b(anniversary)\b/.test(fullText)) occasion = 'anniversary';
  else if (/\b(new job|promotion|career|interview|exam|startup|business)\b/.test(fullText)) occasion = 'new beginnings & career';
  else if (/\b(housewarming|new home|griha pravesh)\b/.test(fullText)) occasion = 'home blessing';
  else if (/\b(diwali|festive|navratri|festivity)\b/.test(fullText)) occasion = 'festive celebration';

  // 5. Negative constraints (no jewelry)
  const noJewelry = /(doesn't|does not|dont|do not)\s+wear\s+(jewelry|jewellery|bracelets?|pendants?|ornaments?)/i.test(fullText) ||
                    /(no|without)\s+(jewelry|jewellery|bracelets?|pendants?)/i.test(fullText) ||
                    /(not|isn't into|doesn't like)\s+(jewelry|jewellery)/i.test(fullText);

  // 6. Placement preference (wearable vs home)
  let placement = null;
  if (/\b(wear|wearable|on me|wrist|neck|carry|pocket)\b/i.test(fullText) && !noJewelry) {
    placement = 'wearable';
  } else if (/\b(home|house|room|desk|table|keep around|decor|space|bedside)\b/i.test(fullText)) {
    placement = 'home';
  }

  // 7. Explicit category / form factor
  let preferredCategory = null;
  if (!noJewelry) {
    if (/\b(bracelets?|wrist)\b/i.test(fullText)) preferredCategory = 'Bracelets';
    else if (/\b(pendants?|necklace|locket)\b/i.test(fullText)) preferredCategory = 'Pendants';
    else if (/\b(malas?|japamala)\b/i.test(fullText)) preferredCategory = 'Mala';
  }
  if (/\b(trees?)\b/i.test(fullText)) preferredCategory = 'Crystal Trees';
  else if (/\b(pyramids?)\b/i.test(fullText)) preferredCategory = 'Crystal Pyramids';
  else if (/\b(lamps?|lights?)\b/i.test(fullText)) preferredCategory = 'Lamps';
  else if (/\b(tumbles?|pocket stones?)\b/i.test(fullText)) preferredCategory = 'Tumbles';
  else if (/\b(bowls?|plates?|chargings?|sound|singing bowl)\b/i.test(fullText)) preferredCategory = 'Charging Items';
  else if (/\b(raw|clusters?|specimens?)\b/i.test(fullText)) preferredCategory = 'Cluster';

  // 8. Intent & Themes
  const intents = [];
  if (/\b(stress|calm|calming|peace|peaceful|anxiety|relax|sleep|insomnia|rest|gentle|sooth|tired|hectic|overwhelmed)\b/i.test(fullText)) {
    intents.push('calm');
  }
  if (/\b(protect|protection|evil eye|negative|negativity|shield|ward|nazar|safe|grounding|ground)\b/i.test(fullText)) {
    intents.push('protection');
  }
  if (/\b(money|wealth|abundance|prosperity|financial|rich|luck|job|career|success|grow|growth|manifest|business|promotion)\b/i.test(fullText)) {
    intents.push('abundance');
  }
  if (/\b(love|heart|romance|compassion|kindness|relationship|affection|emotional healing|care)\b/i.test(fullText)) {
    intents.push('love');
  }
  if (/\b(focus|clarity|concentration|study|student|mind|decision|memory)\b/i.test(fullText)) {
    intents.push('clarity');
  }
  if (/\b(energy|confidence|courage|motivation|vitality|strength|action)\b/i.test(fullText)) {
    intents.push('confidence');
  }
  if (/\b(balance|chakra|harmony|alignment|all in one|holistic)\b/i.test(fullText)) {
    intents.push('balance');
  }

  // 9. FAQ Topic Detection
  let faqTopic = null;
  if (/\b(refund|return|replacement|exchange|damaged|broken|cancel|cancellation)\b/i.test(latestText)) {
    faqTopic = 'refund_policy';
  } else if (/\b(privacy|data|collect my data|information security)\b/i.test(latestText)) {
    faqTopic = 'privacy_policy';
  } else if (/\b(terms|conditions|terms and conditions|disclaimer)\b/i.test(latestText)) {
    faqTopic = 'terms_conditions';
  } else if (/\b(track|tracking|order status|where is my order|package)\b/i.test(latestText)) {
    faqTopic = 'track_order';
  } else if (/\b(shipping|delivery|how long|dispatch|free delivery|courier)\b/i.test(latestText)) {
    faqTopic = 'shipping';
  } else if (/\b(cod|cash on delivery|pay on delivery)\b/i.test(latestText)) {
    faqTopic = 'cod';
  } else if (/\b(clean|cleanse|charging|charge|care for crystal|wash)\b/i.test(latestText)) {
    faqTopic = 'care_cleanse';
  } else if (/\b(choose|how do i choose|pick a crystal|beginner)\b/i.test(latestText)) {
    faqTopic = 'choose_crystal';
  } else if (/\b(about|who are you|the sacred store|brand|authentic|real crystals|reiki charged|founder)\b/i.test(latestText) && !isOutOfContext) {
    faqTopic = 'about_brand';
  }

  // 10. Direct Category Browse Detection
  let isCategoryBrowse = null;
  if (/\b(browse|see all|show all|view all|look at)\s*(bracelets?|all bracelets)\b/i.test(latestText) || latestText === 'help me choose a bracelet') {
    isCategoryBrowse = 'bracelets';
  } else if (/\b(browse|see all|show all|view all|look at)\s*(accessories)\b/i.test(latestText)) {
    isCategoryBrowse = 'accessories';
  } else if (/\b(browse|see all|show all|view all|look at)\s*(tumbles?)\b/i.test(latestText)) {
    isCategoryBrowse = 'tumbles';
  } else if (/\b(browse|see all|show all|view all|look at)\s*(household|trees?|pyramids?|lamps?)\b/i.test(latestText)) {
    isCategoryBrowse = 'household';
  } else if (/\b(browse|see all|show all|view all|look at)\s*(variety|clusters?|spheres?|points?)\b/i.test(latestText)) {
    isCategoryBrowse = 'variety';
  } else if (/\b(browse|see all|show all|view all|look at)\s*(charging|cleaning)\b/i.test(latestText)) {
    isCategoryBrowse = 'cleansing';
  }

  // 11. Explicit request for options check
  const isExplicitProductRequest = /\b(give me|show me|recommend|options|choices|what can i buy|suggest|products|pieces)\b/i.test(latestText) ||
                                  budget !== null ||
                                  preferredCategory !== null ||
                                  requestedCount !== null;

  // 12. Check if user provided sufficient context to recommend
  const hasSufficientRecommendationContext = (intents.length > 0) ||
                                            (preferredCategory !== null) ||
                                            (budget !== null) ||
                                            (requestedCount !== null) ||
                                            isExplicitProductRequest ||
                                            (isGift && recipient && recipient !== 'self' && occasion);

  return {
    isOutOfContext,
    budget,
    requestedCount,
    recipient,
    isGift,
    occasion,
    noJewelry,
    placement,
    preferredCategory,
    intents,
    faqTopic,
    isCategoryBrowse,
    isExplicitProductRequest,
    hasSufficientRecommendationContext,
    rawText: fullText,
    latestText,
    historyLength: history.length
  };
}

// Generate distinct crystal explanations
function generateRecommendationReason(product, dimensions) {
  const name = (product.name || '').toLowerCase();
  const effect = product.effect || '';
  const cat = (product.category || '').toLowerCase();

  if (name.includes('amethyst')) {
    return 'Traditionally revered for calming an overactive mind, releasing daily stress, and inviting restful sleep.';
  }
  if (name.includes('rose quartz')) {
    return 'The stone of unconditional love and gentle compassion — carries an aura of tender emotional reassurance.';
  }
  if (name.includes('black tourmaline')) {
    return 'The ultimate energetic shield; naturally repels psychic smog, environmental tension, and negative vibrations.';
  }
  if (name.includes('pyrite')) {
    return 'Known as the stone of abundance and willpower, it inspires bold confidence and attracts financial momentum.';
  }
  if (name.includes('citrine')) {
    return 'Radiating golden solar warmth, Citrine invites joy, energetic vitality, and prosperous new beginnings.';
  }
  if (name.includes('tiger')) {
    return 'A fierce grounding ally that unifies courage, practical focus, and unshakeable inner resilience.';
  }
  if (name.includes('clear quartz')) {
    return 'A pure master amplifier that clarifies your personal intentions and harmonizes energy across your space.';
  }
  if (name.includes('green aventurine') || name.includes('green jade')) {
    return 'The premier stone of opportunity and growth; gently opens the heart to good fortune and fresh chapters.';
  }
  if (name.includes('selenite')) {
    return 'A high-vibration purifier that naturally dissolves stagnant energy and keeps other crystals recharged.';
  }
  if (name.includes('money magnet')) {
    return 'A concentrated pyramid fusing four sacred wealth stones to anchor prosperity at your desk or workstation.';
  }
  if (cat.includes('lamp')) {
    return 'Combines natural crystal vibrations with warm ambient luminescence to transform the atmosphere of any room.';
  }
  if (cat.includes('tree')) {
    return 'A handcrafted Feng Shui tree of life designed to channel continuous harmonious energy into your home.';
  }
  if (cat.includes('pyramid')) {
    return 'Sacred geometric architecture engineered to concentrate intention and disperse balanced frequencies.';
  }

  if (effect) return effect;
  if (product.description) return product.description.slice(0, 110) + '...';
  return 'Handcrafted with authentic 100% Reiki-charged gemstones.';
}

// HARD CONSTRAINT CATALOG FILTER & RANKING
function filterAndRankProducts(catalog, dimensions) {
  const { budget, noJewelry, placement, preferredCategory, intents, recipient, isGift } = dimensions;

  // STEP 1: HARD BUDGET FILTER — Strictly <= budget
  let pool = catalog;
  if (budget !== null) {
    pool = pool.filter(p => p.price <= budget);
    if (pool.length === 0) {
      return []; // Zero products above budget can ever be returned
    }
  }

  // STEP 2: HARD NEGATIVE CONSTRAINT — Exclude jewelry if explicitly requested
  if (noJewelry) {
    pool = pool.filter(p => {
      const catLower = (p.category || '').toLowerCase();
      const nameLower = (p.name || '').toLowerCase();
      return !(catLower.includes('bracelet') || catLower.includes('pendant') || catLower.includes('mala') || catLower.includes('accessories') || nameLower.includes('bracelet') || nameLower.includes('pendant') || nameLower.includes('mala'));
    });
  }

  // STEP 3: STRICT PLACEMENT FILTER (Wearable vs Home)
  if (placement === 'wearable') {
    pool = pool.filter(p => {
      const catLower = (p.category || '').toLowerCase();
      return catLower.includes('bracelet') || catLower.includes('pendant') || catLower.includes('mala') || catLower.includes('accessories');
    });
  } else if (placement === 'home') {
    pool = pool.filter(p => {
      const catLower = (p.category || '').toLowerCase();
      return catLower.includes('tree') || catLower.includes('pyramid') || catLower.includes('lamp') || catLower.includes('cluster') || catLower.includes('charging') || catLower.includes('tumble');
    });
  }

  // STEP 4: STRICT FORM FACTOR / CATEGORY PREFERENCE FILTER
  if (preferredCategory) {
    const categoryMatches = pool.filter(p => {
      const catLower = (p.category || '').toLowerCase();
      const nameLower = (p.name || '').toLowerCase();
      return catLower.includes(preferredCategory.toLowerCase()) || nameLower.includes(preferredCategory.toLowerCase());
    });
    if (categoryMatches.length > 0) {
      pool = categoryMatches;
    }
  }

  // STEP 5: SCORE PRODUCTS
  const scored = pool.map(p => {
    let score = 10;
    const nameLower = (p.name || '').toLowerCase();
    const descLower = ((p.description || '') + ' ' + (p.effect || '') + ' ' + (p.intentions || '') + ' ' + (p.chakra || '')).toLowerCase();
    const catLower = (p.category || '').toLowerCase();

    // Category preference match
    if (preferredCategory && catLower.includes(preferredCategory.toLowerCase())) {
      score += 45;
    }

    // Placement match
    if (placement === 'wearable' && (catLower.includes('bracelet') || catLower.includes('pendant') || catLower.includes('mala'))) {
      score += 30;
    } else if (placement === 'home' && (catLower.includes('tree') || catLower.includes('pyramid') || catLower.includes('lamp') || catLower.includes('cluster') || catLower.includes('charging'))) {
      score += 35;
    }

    // Intent matches
    if (intents.includes('calm')) {
      if (/amethyst|blue lace agate|selenite|howlite|lepidolite|sodalite/.test(nameLower)) score += 45;
      if (/calm|peace|stress|sooth|relax|sleep|seren/.test(descLower)) score += 25;
    }
    if (intents.includes('protection')) {
      if (/black tourmaline|tiger|hematite|obsidian|evil eye/.test(nameLower)) score += 50;
      if (/protect|shield|psychic smog|negative|ground/.test(descLower)) score += 25;
    }
    if (intents.includes('abundance')) {
      if (/pyrite|citrine|money magnet|green aventurine|green jade/.test(nameLower)) score += 50;
      if (/wealth|abundance|financial|opportunity|luck|prosperity/.test(descLower)) score += 25;
    }
    if (intents.includes('love')) {
      if (/rose quartz|pink tourmaline|rhodochrosite|green aventurine/.test(nameLower)) score += 50;
      if (/love|compassion|gentleness|heart|relationship/.test(descLower)) score += 25;
    }
    if (intents.includes('clarity')) {
      if (/clear quartz|fluorite|lapiz|sodalite/.test(nameLower)) score += 40;
      if (/clarity|focus|mind|concentration|insight/.test(descLower)) score += 20;
    }
    if (intents.includes('confidence')) {
      if (/carnelian|sunstone|red jasper|tiger/.test(nameLower)) score += 40;
      if (/courage|confidence|motivation|vitality|action/.test(descLower)) score += 20;
    }
    if (intents.includes('balance')) {
      if (/7 chakra|clear quartz|energy reset|everyday balance/.test(nameLower)) score += 35;
      if (/chakra|balance|alignment|harmony/.test(descLower)) score += 20;
    }

    // Recipient heuristics if no strong intents
    if (intents.length === 0) {
      if (recipient === 'mother') {
        if (/rose quartz|amethyst|green aventurine|tree/.test(nameLower)) score += 30;
      } else if (recipient === 'girlfriend') {
        if (/rose quartz|bracelet|pendant/.test(nameLower)) score += 30;
      } else if (recipient === 'sister') {
        if (/bracelet|tumbles|citrine|rose quartz/.test(nameLower)) score += 25;
      } else if (recipient === 'father') {
        if (/pyramid|lamp|cluster|tiger|black tourmaline/.test(nameLower)) score += 35;
      }
    }

    // Gifting boost
    if (isGift && p.is_gift_shop) score += 15;

    // Budget weighting within eligible pool
    if (budget !== null) {
      if (p.price >= budget * 0.45 && p.price <= budget) {
        score += 20;
      }
    }

    return { product: p, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .map(item => item.product);
}

// Generate Consultation, FAQ, or Recommendations response
function generateConciergeResponse(dimensions, rankedProducts, catalog, originalUserMessage) {
  const {
    isOutOfContext,
    budget,
    requestedCount,
    recipient,
    occasion,
    intents,
    faqTopic,
    isCategoryBrowse,
    isExplicitProductRequest,
    hasSufficientRecommendationContext,
    placement,
    preferredCategory,
    historyLength,
    latestText
  } = dimensions;

  // 1. OUT-OF-CONTEXT QUESTIONS: Answer directly WITHOUT forcing crystals or legal lectures!
  if (isOutOfContext) {
    const answer = answerOutOfContext(originalUserMessage);
    return {
      message: answer,
      recommendations: [],
      categoryLinks: [],
      policyLinks: []
    };
  }

  // 1.5. FOLLOW-UP QUESTIONS after recommendations — answer directly, don't re-recommend!
  // If conversation already has exchanges and user asks about authenticity, usage, safety, etc.
  const followUpType = detectFollowUpQuestion(latestText, historyLength);
  if (followUpType) {
    const followUpAnswer = answerFollowUp(followUpType);
    if (followUpAnswer) {
      return {
        message: followUpAnswer,
        recommendations: [],
        categoryLinks: [],
        policyLinks: []
      };
    }
  }

  // 2. FAQ & Legal Knowledge Responses (Only when customer actually asked about them!)
  if (faqTopic === 'refund_policy') {
    return {
      message: "At The Sacred Store, replacement requests are accepted within **48 hours of delivery** if a product arrives damaged, defective, or if the wrong item was delivered. Please provide clear photographs when contacting us.\n\nReturns or refunds are not accepted for limited collections, opened products, customized pieces, or change of mind. Approved refunds are processed back to your original payment method within **7–10 business days**.",
      recommendations: [],
      policyLinks: [{ label: "Read Refund & Cancellation Policy", route: "/refund-policy" }]
    };
  }

  if (faqTopic === 'privacy_policy') {
    return {
      message: "Your privacy is deeply respected at The Sacred Store. We collect only necessary details (name, email, phone number, shipping address) to process orders and provide customer support.\n\nAll payments are processed through secure, encrypted gateways (Razorpay)—we never store your complete card or banking details, and we never sell or rent your personal information to third parties.",
      recommendations: [],
      policyLinks: [{ label: "Read Privacy Policy", route: "/privacy-policy" }]
    };
  }

  if (faqTopic === 'terms_conditions') {
    return {
      message: "By using The Sacred Store or purchasing our products, you agree to our Terms & Conditions. Our crystals, ritual tools, and wellness guidance are intended for personal growth, mindfulness, and spiritual exploration.\n\nThey are not a substitute for professional medical, psychological, legal, or financial advice.",
      recommendations: [],
      policyLinks: [{ label: "Read Terms & Conditions", route: "/terms-conditions" }]
    };
  }

  if (faqTopic === 'track_order') {
    return {
      message: "You can track your package anytime directly on our Track Order page using the Order ID provided in your confirmation email or SMS.",
      recommendations: [],
      categoryLinks: [{ label: "Track Your Order", route: "/track-order" }]
    };
  }

  if (faqTopic === 'shipping') {
    return {
      message: "We offer **Free Delivery across India** on all orders! Every package is packed with insured, premium packaging and typically arrives within **3 to 7 business days** depending on your location.",
      recommendations: [],
      categoryLinks: [{ label: "Explore Collection", route: "/shop" }]
    };
  }

  if (faqTopic === 'cod') {
    return {
      message: "Yes! Cash on Delivery (COD) is available for most serviceable PIN codes across India (with a nominal ₹100 handling fee at checkout). You will see the COD option when selecting your payment method during checkout.",
      recommendations: [],
      categoryLinks: [{ label: "Explore Collection", route: "/shop" }]
    };
  }

  if (faqTopic === 'about_brand') {
    return {
      message: "The Sacred Store was founded by a certified master Reiki healer dedicated to bridging ancient mineral wisdom with modern mindful living ✨\n\nEvery crystal in our collection is 100% natural, ethically sourced, and spiritually cleansed and Reiki-charged before leaving our sanctuary. We have elevated over 10,000 spaces with authentic sacred tools.",
      recommendations: [],
      policyLinks: [{ label: "About The Sacred Store", route: "/aboutus" }],
      categoryLinks: [{ label: "Book a Consultation", route: "/book-a-call" }]
    };
  }

  if (faqTopic === 'care_cleanse') {
    return {
      message: "Cleansing your crystals clears absorbed vibrations and restores their natural frequency ✨\n\nThe safest and most universal method for all crystals is placing them on a **Selenite Charging Plate** or charging bowl. Sound healing (such as a Tibetan singing bowl) or incense smoke also work wonderfully. Avoid soaking soft stones (like Selenite or Malachite) in water or using harsh salt.",
      recommendations: [],
      categoryLinks: [{ label: "Shop Cleansing & Charging Tools", route: "/shop/cleaning-charging" }]
    };
  }

  if (faqTopic === 'choose_crystal') {
    return {
      message: "There is no wrong way to choose a crystal! You can choose by **intention** (such as Amethyst for calm, Black Tourmaline for protection, or Pyrite for abundance), or simply by the stone you feel naturally drawn to first.\n\nTell me a feeling, goal, or situation you're navigating right now, and I'd love to narrow it down for you.",
      recommendations: []
    };
  }

  // 3. Direct Category Browse Actions
  if (isCategoryBrowse) {
    let route = '/shop';
    let label = 'Browse Collection';
    let filterCategory = '';

    if (isCategoryBrowse === 'bracelets') {
      route = '/shop/accessories';
      label = 'Browse All Bracelets';
      filterCategory = 'Bracelets';
    } else if (isCategoryBrowse === 'accessories') {
      route = '/shop/accessories';
      label = 'Shop Accessories';
      filterCategory = 'Accessories';
    } else if (isCategoryBrowse === 'tumbles') {
      route = '/shop/tumbles';
      label = 'Shop Gemstone Tumbles';
      filterCategory = 'Tumbles';
    } else if (isCategoryBrowse === 'household') {
      route = '/shop/household';
      label = 'Shop Trees, Pyramids & Lamps';
      filterCategory = 'Household';
    } else if (isCategoryBrowse === 'variety') {
      route = '/shop/variety-crystals';
      label = 'Shop Raw Clusters & Points';
      filterCategory = 'Variety Crystals';
    } else if (isCategoryBrowse === 'cleansing') {
      route = '/shop/cleaning-charging';
      label = 'Shop Cleansing Plates & Bowls';
      filterCategory = 'Charging Items';
    }

    const matchingItems = catalog
      .filter(p => !filterCategory || p.category?.toLowerCase().includes(filterCategory.toLowerCase()))
      .slice(0, 3);

    return {
      message: `Here are our most cherished handcrafted pieces in this collection, and you can explore the complete catalog below:`,
      recommendations: matchingItems.map(p => ({
        productId: p.id,
        reason: generateRecommendationReason(p, dimensions)
      })),
      categoryLinks: [{ label, route }]
    };
  }

  // 4. HARD BUDGET CONSTRAINT EMPTY CHECK
  if (budget !== null && rankedProducts.length === 0) {
    const minPrice = Math.min(...catalog.map(p => p.price));
    return {
      message: `I searched our catalog, but couldn't find a piece within ₹${budget} in our current collection (our entry pieces start at ₹${minPrice}).\n\nWould you like me to look at our pocket tumbles or pendants, or would you be open to adjusting your budget slightly?`,
      recommendations: [],
      categoryLinks: [{ label: "Explore Gift Shop", route: "/gift-shop" }]
    };
  }

  // 5. NO RANDOM RECOMMENDATIONS WITHOUT CONTEXT!
  // If the user has NOT provided sufficient context (no intention, no specific stone, no form factor, no budget)
  // Ask clarifying questions instead of dumping random products!
  if (!hasSufficientRecommendationContext) {
    // If user says "I need something for myself" or "I want a crystal" or "Help me":
    if (recipient === 'self' || /\b(myself|for me|my own)\b/i.test(latestText)) {
      return {
        message: "I'd love to help you find the right piece for yourself ✨\n\nIs there a particular intention, life transition, or feeling—like deep calm and stress relief, grounding protection, or inviting growth and abundance—you're looking to work with?",
        recommendations: []
      };
    }

    // If user says "I need a gift" without recipient or intention:
    if (recipient === null || recipient === 'someone special') {
      return {
        message: "Choosing a meaningful gift is such a wonderful gesture ✨\n\nWho is the gift for, and is there a specific occasion or feeling—like peace, protection, or joy—you'd love it to carry?",
        recommendations: []
      };
    }

    // If user says "I need a gift for my sister/mom" without intention:
    if (recipient && intents.length === 0) {
      return {
        message: `Choosing something for your ${recipient} is so thoughtful ✨\n\nWould you prefer a piece she can wear daily (like an intentional bracelet or pendant), or a sacred anchor for her home (like a crystal tree or ambient lamp)? And is there a specific feeling you'd like it to convey?`,
        recommendations: []
      };
    }

    // Default conversational guiding question (no random products)
    return {
      message: "I'd love to help guide you ✨\n\nIs there a specific intention, feeling, or life transition—like releasing stress, inviting protection, or manifesting abundance—you're looking to explore today?",
      recommendations: []
    };
  }

  // 6. MULTI-QUESTION CLARIFYING FLOW WHEN INTENT IS KNOWN BUT FORM FACTOR IS AMBIGUOUS
  if (!isExplicitProductRequest && intents.length > 0 && !placement && !preferredCategory && budget === null && historyLength <= 2) {
    const intentName = intents[0];
    return {
      message: `That sounds like a meaningful intention for ${intentName} ✨\n\nBefore I pick out pieces from our collection: would you prefer something wearable that you can carry throughout the day (like an intentional bracelet or pendant), or a sacred anchor for your room or work desk (like a crystal tree, pyramid, or lamp)?`,
      recommendations: []
    };
  }

  // 7. DETERMINE RECOMMENDATION COUNT
  const countToReturn = requestedCount ? Math.min(requestedCount, 6) : 3;
  const selectedProducts = rankedProducts.slice(0, countToReturn);

  // 8. BUILD PERSONALIZED CONCIERGE MESSAGE
  let intro = '';

  if (recipient === 'mother') {
    intro += occasion ? `For your mother's ${occasion}, ` : "Choosing something meaningful for your mother is truly special. ";
    intro += "I've selected pieces that feel nurturing, gentle, and deeply heart-centered";
  } else if (recipient === 'sister') {
    intro += occasion ? `For your sister's ${occasion}, ` : "For your sister, ";
    intro += "I recommend something uplifting and wearable that she can cherish every day";
  } else if (recipient === 'girlfriend') {
    intro += "For your girlfriend, I'd suggest something elegant and heartfelt that carries personal meaning";
  } else if (recipient === 'father') {
    intro += dimensions.noJewelry ? "Since your father doesn't wear jewelry, home and desk anchors are the most thoughtful path" : "For your father, grounding and protective energy pieces make a timeless gift";
  } else if (intents.includes('calm')) {
    intro += "When you're navigating stress and seeking calm, gentle vibrational stones like Amethyst and Selenite are timeless companions";
  } else if (intents.includes('protection')) {
    intro += "For energetic shielding and strong personal boundaries, Black Tourmaline and Tiger's Eye are the absolute gold standard";
  } else if (intents.includes('abundance')) {
    intro += occasion ? `To celebrate ${occasion} with energy of growth and prosperity, ` : "To attract abundance and amplify financial opportunities, ";
    intro += "Pyrite, Citrine, and sacred geometric pyramids are exceptional choices";
  } else {
    intro += "Based on what you're seeking, here are the strongest handcrafted matches from our collection";
  }

  if (budget !== null) {
    intro += `, strictly within your ₹${budget} budget:`;
  } else {
    intro += ":";
  }

  return {
    message: intro,
    recommendations: selectedProducts.map(p => ({
      productId: p.id,
      reason: generateRecommendationReason(p, dimensions)
    }))
  };
}

// MAIN API HANDLER
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate Limiting
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'You have sent quite a few messages recently. Please wait a moment before asking again.'
    });
  }

  try {
    const { message, history = [] } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const sanitizedMessage = message.trim().slice(0, 500);
    const sanitizedHistory = Array.isArray(history)
      ? history.slice(-8).map(item => ({
          role: item.role === 'user' ? 'user' : 'assistant',
          content: String(item.content || '').slice(0, 500)
        }))
      : [];

    // ─── EARLY FOLLOW-UP INTERCEPT ───
    // Check if this is a follow-up question (authenticity, usage, safety, etc.)
    // BEFORE running the full dimension-extraction + recommendation pipeline.
    // This prevents history-accumulated intents from re-triggering recommendations.
    const latestTextLower = sanitizedMessage.toLowerCase().replace(/(\d+),(\d+)/g, '$1$2');
    const followUpType = detectFollowUpQuestion(latestTextLower, sanitizedHistory.length);
    if (followUpType) {
      const followUpAnswer = answerFollowUp(followUpType);
      if (followUpAnswer) {
        return res.status(200).json({
          success: true,
          message: followUpAnswer,
          recommendations: [],
          categoryLinks: [],
          policyLinks: []
        });
      }
    }

    // 1. Fetch real product catalog from Supabase
    const catalog = await getCatalog();
    if (!catalog || catalog.length === 0) {
      return res.status(200).json({
        success: true,
        message: "I'm having a little trouble accessing our collection catalog right now. Please try again in a moment.",
        recommendations: []
      });
    }

    // 2. Extract dimensions & intent
    const dimensions = extractDimensions(sanitizedMessage, sanitizedHistory);

    // 3. Filter & rank products (ENFORCING HARD BUDGET FILTER)
    const rankedCandidates = filterAndRankProducts(catalog, dimensions);

    // 4. Generate response (Consultation, FAQ, Out-of-Context, or Recommendations)
    const responseData = generateConciergeResponse(dimensions, rankedCandidates, catalog, sanitizedMessage);

    // 5. Final validation: ensure every recommendation's productId exists in Supabase catalog
    // and strictly respects budget
    const validRecommendations = (responseData.recommendations || []).map(rec => {
      const dbProduct = catalog.find(p => p.id === rec.productId);
      if (!dbProduct) return null;
      if (dimensions.budget !== null && dbProduct.price > dimensions.budget) return null;
      return {
        productId: dbProduct.id,
        reason: rec.reason || generateRecommendationReason(dbProduct, dimensions)
      };
    }).filter(Boolean);

    return res.status(200).json({
      success: true,
      message: responseData.message,
      recommendations: validRecommendations,
      categoryLinks: responseData.categoryLinks || [],
      policyLinks: responseData.policyLinks || []
    });

  } catch (err) {
    console.error('Unhandled error in ai-recommend:', err);
    return res.status(200).json({
      success: false,
      message: "I'm experiencing a brief pause. Please ask again in just a moment.",
      recommendations: []
    });
  }
}
