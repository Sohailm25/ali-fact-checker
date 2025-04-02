export interface Claim {
  text: string;
  verdict: boolean;
  evidence: string;
  roast: string;
  reactions: {
    agree: number;
    disagree: number;
  };
  isAIGenerated?: boolean; // Flag to indicate if response is from AI or fallback
} 