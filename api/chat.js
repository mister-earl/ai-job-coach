export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, feeling } = req.body;

    // Convert your chat format to Claude's expected format
    const claudeMessages = [];
    
    // Add system context as first user message
    claudeMessages.push({
      role: "user",
      content: `You are an AI job coach. The user is feeling ${feeling} about their job search. 
      
      Your coaching philosophy: Help people think for themselves rather than giving direct answers. Ask thought-provoking questions that help them discover insights. Be objective, not just supportive.
      
      Keep responses conversational but professional. Focus on helping them think through their situation.`
    });

    // Add conversation history in proper format
    messages.forEach(msg => {
      claudeMessages.push({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: claudeMessages
      })
    });

    const data = await response.json();
    res.status(200).json({ content: data.content[0].text });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
}
