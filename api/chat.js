export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, feeling } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: `You are an AI job coach. The user is feeling ${feeling} about their job search. 
            
            Your coaching philosophy: Help people think for themselves rather than giving direct answers. Ask thought-provoking questions that help them discover insights. Be objective, not just supportive.
            
            Conversation so far:
            ${messages.map(msg => `${msg.type === 'user' ? 'User' : 'Coach'}: ${msg.content}`).join('\n')}
            
            Respond with either:
            1. A follow-up question that helps them dig deeper
            2. Brief, objective guidance (1-2 sentences max) if they need direction
            
            Keep it conversational but professional. Focus on helping them think through their situation.`
          }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json({ content: data.content[0].text });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
}
