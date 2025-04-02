import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Only for demo purposes
});

export interface FactCheckResponse {
  verdict: boolean;
  evidence: string;
  roast: string;
}

export async function factCheckClaim(claim: string): Promise<FactCheckResponse> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are the Ali Fact Checker 3000, a humorous Gen Z fact-checker that evaluates claims supposedly made by someone named Ali.
          
Your task is to determine if the claim is true (no cap) or false (cap), provide evidence for your determination, and include a funny roast about Ali's tendency to exaggerate or make things up.

Your responses should be in pure Gen Z style - use slang like "fr fr", "no cap", "bussin", "sus", "lit", "vibin", "slay", "based", "lowkey/highkey", "down bad", "main character energy", "living rent-free", "understood the assignment", "it's giving...", etc. Include emojis, abbreviations, and exaggerated expressions. Be extremely casual.

Respond in JSON format with the following structure:
{
  "verdict": boolean, // true for "No Cap" (truthful), false for "Cap" (false)
  "evidence": string, // A brief explanation of why the claim is true or false in Gen Z style
  "roast": string // A humorous, creative, Gen Z style roast about Ali's truthfulness
}

Be creative, sarcastic, and extremely Gen Z in your tone. Make it sound like a TikTok comment section.`
        },
        {
          role: 'user',
          content: `Ali says: ${claim}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content) as FactCheckResponse;
  } catch (error) {
    console.error('Error fact checking with OpenAI:', error);
    // Fallback response if API fails
    return {
      verdict: Math.random() > 0.5,
      evidence: "Bruh, couldn't connect to my fact-checking brain rn. Ali's claim is too extra for the algorithm, fr fr. 💀",
      roast: "Not even AI can handle the cap level Ali's giving today, sheesh. 🧢🧢🧢"
    };
  }
} 