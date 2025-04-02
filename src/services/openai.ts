import OpenAI from 'openai';

// Initialize the OpenAI client
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Debug API key (mask most characters for security)
const maskedKey = apiKey 
  ? `${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 4)}`
  : 'not set';
console.log(`[DEBUG] OpenAI API Key status: ${apiKey ? 'Present' : 'Missing'}`);
console.log(`[DEBUG] Masked key: ${maskedKey}`);
console.log(`[DEBUG] API key length: ${apiKey?.length || 0}`);

// Validate API key format
const isValidApiKeyFormat = apiKey && apiKey.startsWith('sk-') && apiKey.length > 30;
console.log(`[DEBUG] API key format valid: ${isValidApiKeyFormat ? 'Yes' : 'No'}`);

// Try a simpler model for testing quota issues
const MODEL = 'gpt-3.5-turbo';

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Only for demo purposes
});

export interface FactCheckResponse {
  verdict: boolean;
  evidence: string;
  roast: string;
  isAIGenerated: boolean; // Flag to indicate if this was AI-generated or fallback
}

// Helper function to convert string/boolean verdict to boolean
function normalizeVerdict(verdict: any): boolean {
  if (typeof verdict === 'boolean') {
    return verdict;
  }
  
  if (typeof verdict === 'string') {
    const lowerVerdict = verdict.toLowerCase();
    // Convert "No Cap" to true, "Cap" to false
    return lowerVerdict.includes('no cap') || 
           lowerVerdict === 'true' || 
           lowerVerdict === 'facts' || 
           lowerVerdict === 'correct';
  }
  
  // Default fallback
  return false;
}

export async function factCheckClaim(claim: string): Promise<FactCheckResponse> {
  console.log(`[DEBUG] Starting fact check for claim: "${claim}"`);
  
  try {
    // Validate API key before making request
    if (!apiKey) {
      console.error('[ERROR] Missing OpenAI API key. Check your .env file.');
      throw new Error('Missing API key');
    }
    
    if (apiKey === 'your_openai_api_key_here') {
      console.error('[ERROR] Default API key detected. Replace with your actual key in .env file.');
      throw new Error('Default API key detected');
    }
    
    if (!isValidApiKeyFormat) {
      console.error('[ERROR] API key format appears invalid. It should start with "sk-" and be longer than 30 characters.');
      throw new Error('Invalid API key format');
    }
    
    console.log(`[DEBUG] Making API request to OpenAI using model: ${MODEL}...`);
    const startTime = performance.now();
    
    const response = await openai.chat.completions.create({
      model: MODEL,
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

IMPORTANT: For the "verdict" field, make sure to use a boolean value (true or false), not a string.

Be creative, sarcastic, and extremely Gen Z in your tone. Make it sound like a TikTok comment section.`
        },
        {
          role: 'user',
          content: `Ali says: ${claim}`
        }
      ],
      response_format: { type: 'json_object' }
    });
    
    const endTime = performance.now();
    console.log(`[DEBUG] OpenAI API response received in ${Math.round(endTime - startTime)}ms`);
    
    const content = response.choices[0]?.message.content;
    if (!content) {
      console.error('[ERROR] Empty response from OpenAI');
      throw new Error('Empty response from OpenAI');
    }

    console.log('[DEBUG] OpenAI raw response:', content);
    
    // Parse the response
    try {
      const parsedResponse = JSON.parse(content);
      console.log('[DEBUG] Successfully parsed OpenAI response');
      
      // Handle string or boolean verdict
      const normalizedVerdict = normalizeVerdict(parsedResponse.verdict);
      console.log(`[DEBUG] Original verdict: ${parsedResponse.verdict} (${typeof parsedResponse.verdict}), normalized: ${normalizedVerdict}`);
      
      return {
        verdict: normalizedVerdict,
        evidence: parsedResponse.evidence || "The AI didn't provide clear evidence.",
        roast: parsedResponse.roast || "The AI forgot to roast Ali this time.",
        isAIGenerated: true
      };
    } catch (parseError) {
      console.error('[ERROR] Failed to parse OpenAI response:', parseError);
      throw new Error('Failed to parse OpenAI response');
    }
  } catch (error: any) {
    console.error('[ERROR] Error fact checking with OpenAI:', error);
    
    // More detailed error logging based on error type
    if (error.status === 429) {
      console.error('[ERROR] Rate limit exceeded. Check your OpenAI account usage and billing.');
      
      if (error.error?.type === 'insufficient_quota') {
        console.error('[ERROR] QUOTA ISSUE: You need to add a payment method or clear unpaid balance in your OpenAI account.');
        console.error('[ERROR] Go to: https://platform.openai.com/account/billing/overview');
      } else {
        console.error('[ERROR] RATE LIMIT: Too many requests. Try again later.');
      }
    } else if (error.status === 401) {
      console.error('[ERROR] Authentication error. Your API key is invalid or has been revoked.');
      console.error('[ERROR] Please generate a new API key at: https://platform.openai.com/api-keys');
    } else if (error.message?.includes('parse')) {
      console.error('[ERROR] Failed to parse JSON response from OpenAI.');
    }
    
    // Log the full error object for debugging
    console.error('[ERROR] Full error details:', JSON.stringify(error, null, 2));
    
    // Fallback response if API fails
    return {
      verdict: Math.random() > 0.5,
      evidence: "Bruh, couldn't connect to my fact-checking brain rn. Ali's claim is too extra for the algorithm, fr fr. 💀",
      roast: "Not even AI can handle the cap level Ali's giving today, sheesh. 🧢🧢🧢",
      isAIGenerated: false
    };
  }
} 