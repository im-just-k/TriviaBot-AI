export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

  if (!MISTRAL_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-3.2',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly trivia game host. Format your answers using Markdown: use titles, bullet points, and paragraphs where appropriate. Ask the user trivia questions, evaluate their answers, and provide explanations and fun facts. Support a variety of topics and difficulty levels.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    res.status(200).json({ response: reply });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}