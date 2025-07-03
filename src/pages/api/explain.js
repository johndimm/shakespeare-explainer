import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function explainWithLLM(line) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a Shakespeare expert. Explain what the given text means in modern English and what's happening dramatically. Be concise but insightful."
        },
        {
          role: "user",
          content: `Explain: "${line}"`
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Sorry, I could not generate an explanation at this time.';
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { line } = req.body;

  if (!line) {
    return res.status(400).json({ error: 'Line is required' });
  }

  // Clean the line of whitespace and carriage returns
  const cleanLine = line.trim().replace(/\r/g, '');

  // Get LLM explanation
  const explanation = await explainWithLLM(cleanLine);

  res.status(200).json({ explanation });
}