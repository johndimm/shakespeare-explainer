import OpenAI from 'openai';
import { AuthService, UsageService } from '../../lib/auth';

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
          content: "You are a literary expert and scholar specializing in classic dramatic works. Help users understand literary works by explaining meanings, historical context, literary devices, and dramatic significance. Be engaging and insightful in your responses. Adapt your expertise to the author being analyzed - whether Shakespeare, Molière, Racine, Goethe, Cervantes, or any other classic playwright or author. Never apologize or correct the user for submitting non-Shakespeare texts; simply identify the author and work if possible, and proceed to explain the passage."
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

  // Check authentication
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Temporarily skip usage limits for testing
  // const usageCheck = await UsageService.checkUsageLimit(decoded.userId, 'explanations');
  // if (!usageCheck.allowed) {
  //   return res.status(429).json({ 
  //     error: usageCheck.reason,
  //     current: usageCheck.current,
  //     limit: usageCheck.limit,
  //     isFirstDay: usageCheck.isFirstDay
  //   });
  // }

  const { line } = req.body;

  if (!line) {
    return res.status(400).json({ error: 'Line is required' });
  }

  // Clean the line of whitespace and carriage returns
  const cleanLine = line.trim().replace(/\r/g, '');

  // Get LLM explanation
  const explanation = await explainWithLLM(cleanLine);

  // Temporarily skip usage logging for testing
  // await UsageService.logUsage(decoded.userId, 'explanations', {
  //   line_length: cleanLine.length,
  //   line_preview: cleanLine.substring(0, 100)
  // });

  res.status(200).json({ explanation });
}