import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a literary expert and scholar specializing in classic dramatic works. Help users understand literary works by explaining meanings, historical context, literary devices, and dramatic significance. Be engaging and insightful in your responses. Adapt your expertise to the author being analyzed - whether Shakespeare, Molière, Racine, Goethe, Cervantes, or any other classic playwright or author.\n\nCRITICAL INSTRUCTION: You MUST respond in the same language as the text being analyzed. This is absolutely essential:\n- If the text is in French (like Molière's 'Être ou ne pas être'), respond entirely in French\n- If the text is in Spanish (like Cervantes), respond entirely in Spanish  \n- If the text is in German (like Goethe's 'Sein oder nicht sein'), respond entirely in German\n- If the text is in Italian (like Goldoni), respond entirely in Italian\n- If the text is in English, respond in English\n\nDo NOT translate the text - analyze it in its original language and respond in that same language. The user expects explanations in the language of the text they are studying."
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