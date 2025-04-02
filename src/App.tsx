import React, { useState } from 'react';
import { Search, ThumbsUp, ThumbsDown, Skull, Brain, Flame, Sparkles } from 'lucide-react';
import { factCheckClaim } from './services/openai';
import { Claim } from './types';

function App() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const capCount = claims.filter(claim => !claim.verdict).length;

  const checkFactWithAI = async (claim: string) => {
    setIsAnalyzing(true);
    
    try {
      const result = await factCheckClaim(claim);
      
      const newClaim: Claim = {
        text: claim,
        verdict: result.verdict,
        evidence: result.evidence,
        roast: result.roast,
        reactions: { agree: 0, disagree: 0 }
      };

      setClaims(prev => [newClaim, ...prev]);
    } catch (error) {
      console.error('Error fact checking claim:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    checkFactWithAI(input);
    setInput('');
  };

  const handleReaction = (index: number, type: 'agree' | 'disagree') => {
    setClaims(prev => prev.map((claim, i) => {
      if (i === index) {
        return {
          ...claim,
          reactions: {
            ...claim.reactions,
            [type]: claim.reactions[type] + 1
          }
        };
      }
      return claim;
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 p-3 sm:p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
            <h1 className="text-lg sm:text-xl font-bold">Ali Fact Checker 3000</h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center px-2 py-1 bg-gray-800 rounded-lg">
              <Skull className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-red-400" />
              <span className="text-xs sm:text-sm font-bold">Cap Counter: <span className="text-red-400">{capCount}</span></span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="h-[calc(100vh-180px)] sm:h-[500px] overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-gray-600 animate-pulse">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-sm sm:text-base">Vibe checking Ali's claim...</span>
            </div>
          )}
          
          {claims.map((claim, index) => (
            <div key={index} className="space-y-2">
              <div className="bg-white p-3 sm:p-4 rounded-lg text-sm sm:text-base border border-gray-200 shadow-sm">
                <p className="font-medium text-gray-800">{claim.text}</p>
                <p className="text-gray-600 mt-2 text-sm">{claim.evidence}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {claim.verdict ? (
                    <span className="font-bold text-green-500 flex items-center gap-1">
                      <Flame className="w-4 h-4" /> No Cap ✅
                    </span>
                  ) : (
                    <span className="font-bold text-red-500 flex items-center gap-1">
                      Cap 🧢🧢
                    </span>
                  )}
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-600 italic text-sm">{claim.roast}</span>
                </div>
                <div className="mt-2 flex gap-3">
                  <button
                    onClick={() => handleReaction(index, 'agree')}
                    className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-green-500"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {claim.reactions.agree}
                  </button>
                  <button
                    onClick={() => handleReaction(index, 'disagree')}
                    className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-red-500"
                  >
                    <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {claim.reactions.disagree}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-2 sm:p-4 bg-gray-100 border-t">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ali says..."
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Vibe Check
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;