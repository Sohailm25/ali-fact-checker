export interface Claim {
  text: string;
  verdict: boolean;
  evidence: string;
  roast: string;
  reactions: {
    agree: number;
    disagree: number;
  };
} 