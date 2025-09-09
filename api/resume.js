export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const { jobDescription, resume, feeling } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `You are a resume optimization expert. Help tailor this resume to match the job description.

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${resume}

USER'S FEELING: ${feeling}

Please provide:
1. An optimized version of the resume that highlights relevant experience for this specific job
2. Key improvements made
3. Brief cover letter guidance based on their feeling (${feeling})
4. Application tips for someone feeling ${feeling}

Format your response as JSON:
{
  "optimizedResume": "full optimized resume text here",
  "improvements": "bullet points of key changes made",
  "coverLetter": "cover letter guidance based on feeling",
  "applicationTips": "application advice for their emotional state"
}

Respond only with valid JSON.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Claude API error:', errorData);
      return res.status(500).json({ error: 'Claude API request failed' });
    }

    const data = await response.json();
    
    // Parse Claude's JSON response
    let responseText = data.content[0].text;
    responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    const result = JSON.parse(responseText);
    
    res.status(200).json(result);

  } catch (error) {
    console.error('Resume API error:', error);
    res.status(500).json({ error: 'Failed to optimize resume' });
  }
}
