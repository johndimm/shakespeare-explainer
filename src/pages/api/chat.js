import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      return 'You MUST respond in the same language as the text being analyzed. This is absolutely essential:\n- If the text is in French (like Molière), respond entirely in French\n- If the text is in Spanish (like Cervantes), respond entirely in Spanish  \n- If the text is in German (like Goethe), respond entirely in German\n- If the text is in Italian (like Goldoni), respond entirely in Italian\n- If the text is in English, respond in English\n\nDo NOT translate the text - analyze it in its original language and respond in that same language. The user expects explanations in the language of the text they are studying.';
    } else if (responseLanguage === 'native') {
      // Use the user's preferred mother tongue
      const languageMap = {
        'en': 'English',
        'fr': 'French', 
        'de': 'German',
        'es': 'Spanish',
        'it': 'Italian'
      };
      const languageName = languageMap[myLanguage] || 'English';
      return `You MUST respond entirely in ${languageName}. This is absolutely critical - regardless of what language the original text is in (English, French, German, Spanish, Italian, etc.), your entire explanation and analysis must be in ${languageName}. The user has specifically requested responses in their mother tongue (${languageName}), so adapt your literary analysis to be entirely in ${languageName}.`;
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
          content: `You are a literary expert and scholar specializing in classic dramatic works. Help users understand literary works by explaining meanings, historical context, literary devices, and dramatic significance. Be engaging and insightful in your responses. Adapt your expertise to the author being analyzed - whether Shakespeare, Molière, Racine, Goethe, Cervantes, or any other classic playwright or author.\n\nLANGUAGE INSTRUCTIONS: ${getLanguageInstruction(responseLanguage, myLanguage)}`
        },
        ...messages
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    return res.status(200).json({ response: completion.choices[0].message.content });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Failed to get response from AI' });
  }
}