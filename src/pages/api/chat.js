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
          content: "You are a Shakespeare expert and literary scholar. Help users understand Shakespeare's works by explaining meanings, historical context, literary devices, and dramatic significance. Be engaging and insightful in your responses."
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