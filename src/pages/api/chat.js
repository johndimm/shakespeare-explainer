import OpenAI from 'openai';
import jwt from 'jsonwebtoken';
import { UsageService } from '../../lib/usage';
import prisma from '../../lib/db';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Chat API called with body:', req.body);

  const { freeAccess } = req.body;
  let decoded = null;

  // Skip authentication for free access (mobile)
  if (freeAccess) {
    console.log('🆓 Free access mode - skipping authentication');
    decoded = { userId: 'free-user', email: 'mobile@free.access', name: 'Mobile User' };
  } else {
    // Check authentication for desktop
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded successfully:', decoded);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  // Check usage limits only for authenticated users (desktop)
  if (!freeAccess) {
    try {
      const now = new Date();
      const windowStart = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
      
      const usages = await prisma.usage.findMany({
        where: {
          userId: decoded.userId,
          type: 'chat',
          date: { gte: windowStart }
        },
        orderBy: { date: 'asc' }
      });
      
      const currentUsage = usages.reduce((sum, u) => sum + u.count, 0);
      const limit = 100; // TEMP: Increase for testing, revert to 3 for production
      
      if (currentUsage >= limit) {
        // Find the earliest usage in the window (for next reset)
        const earliestUsage = usages[0];
        const nextReset = new Date(new Date(earliestUsage.date).getTime() + 60 * 60 * 1000);
        
        return res.status(429).json({ 
          error: 'Usage limit reached',
          currentUsage,
          limit,
          nextReset,
          upgradeRequired: true,
          message: 'You\'ve reached your limit of 3 explanations per hour. Please wait or upgrade to Premium for unlimited access!'
        });
      }
    } catch (error) {
      console.error('Usage check error:', error);
      // Continue without usage limits for now
    }
  } else {
    console.log('🆓 Skipping usage limits for free access');
  }

  const { messages, responseLanguage, myLanguage } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Debug logging
  console.log('Response language preference:', responseLanguage);
  console.log('User mother tongue:', myLanguage);

  // Helper function to get language instructions based on user preferences
  const getLanguageInstruction = (responseLanguage, myLanguage) => {
    if (responseLanguage === 'english') {
      return 'RESPOND ONLY IN ENGLISH. This is absolutely critical - you must respond in English regardless of what language the original text is in. Even if analyzing French text by Molière, German text by Goethe, or Spanish text by Cervantes, your explanation must be entirely in English. Do not use any words from the original language except when quoting specific phrases. Your entire analysis and explanation should be in English.';
    } else if (responseLanguage === 'match') {
      return 'You MUST respond in the same language as the text being analyzed. Do NOT translate or apologize. The user expects explanations in the language of the text they are studying.\n- If the text is in French (like Molière), respond entirely in French\n- If the text is in Spanish (like Cervantes), respond entirely in Spanish\n- If the text is in German (like Goethe), respond entirely in German\n- If the text is in Italian (like Goldoni), respond entirely in Italian\n- If the text is in English, respond in English';
    } else if (responseLanguage === 'native') {
      // Use the user's preferred mother tongue
      const languageMap = {
        'en': 'English',
        'fr': 'French',
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian',
        'zh': 'Chinese',
        'ja': 'Japanese',
        'ko': 'Korean',
        'ru': 'Russian',
        'pt': 'Portuguese',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'tr': 'Turkish',
        'nl': 'Dutch',
        'el': 'Greek',
        'pl': 'Polish',
        'sv': 'Swedish',
        'da': 'Danish',
        'no': 'Norwegian',
        'fi': 'Finnish',
        'cs': 'Czech',
        'hu': 'Hungarian',
        'ro': 'Romanian',
        'he': 'Hebrew',
        'th': 'Thai',
        'vi': 'Vietnamese',
        'id': 'Indonesian',
        'uk': 'Ukrainian',
        'bg': 'Bulgarian',
        'hr': 'Croatian',
        'sr': 'Serbian',
        'sk': 'Slovak',
        'ms': 'Malay',
        'tl': 'Filipino',
        'bn': 'Bengali',
        'ur': 'Urdu',
        'fa': 'Persian',
        'sw': 'Swahili',
        'af': 'Afrikaans'
      };
      const languageName = languageMap[myLanguage] || 'English';
      return `You MUST respond entirely in ${languageName}. This is absolutely critical - regardless of what language the original text is in, your entire explanation and analysis must be in ${languageName}. The user has specifically requested responses in their mother tongue (${languageName}), so adapt your literary analysis to be entirely in ${languageName}.`;
    }
    // Fallback to English
    return 'RESPOND ONLY IN ENGLISH.';
  };

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: `You are a literary expert and scholar specializing in classic dramatic works. Help users understand literary works by explaining meanings, historical context, literary devices, and dramatic significance. Be engaging and insightful in your responses. Adapt your expertise to the author being analyzed - whether Shakespeare, Molière, Racine, Goethe, Cervantes, or any other classic playwright or author.\n\nLANGUAGE INSTRUCTIONS: ${getLanguageInstruction(responseLanguage, myLanguage)}\n\nNever say there has been a misunderstanding, mistake, or error if the text is not by Shakespeare. If you can identify the author and work, mention them, then proceed to explain or analyze the passage in the appropriate language.`
        },
        ...messages
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    const response = completion.choices[0].message.content;
    
    // Record usage only for authenticated users (desktop)
    if (!freeAccess) {
      try {
        await UsageService.recordUsage(decoded.userId, 'chat');
      } catch (error) {
        console.error('Usage recording error:', error);
        // Continue even if usage recording fails
      }
    } else {
      console.log('🆓 Skipping usage recording for free access');
    }

    return res.status(200).json({ response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Failed to get response from AI' });
  }
}