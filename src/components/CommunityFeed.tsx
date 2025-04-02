import React from 'react';
import { ThumbsUp, ThumbsDown, Clock, User, Flame } from 'lucide-react';
import { CommunityClaim } from '../services/firebase';

interface CommunityFeedProps {
  claims: CommunityClaim[];
  onReaction?: (claimId: string, type: 'agree' | 'disagree') => void;
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ claims, onReaction }) => {
  // Format date to a readable string
  const formatDate = (date: Date): string => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // diff in seconds
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    
    return date.toLocaleDateString();
  };

  if (claims.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No community claims yet. Be the first to submit one!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {claims.map((claim) => (
        <div key={claim.id} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <User className="w-3.5 h-3.5" />
            <span className="font-semibold">{claim.userName}</span>
            <span className="mx-1">•</span>
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(claim.timestamp)}</span>
          </div>
          
          <p className="font-medium text-gray-800">{claim.text}</p>
          <p className="text-gray-600 mt-2 text-sm">{claim.evidence || "No explanation provided."}</p>
          
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
            <span className="text-gray-600 italic text-sm">{claim.roast || "Ali's on thin ice with this one."}</span>
          </div>
          
          {onReaction && (
            <div className="mt-2 flex gap-3">
              <button
                onClick={() => claim.id && onReaction(claim.id, 'agree')}
                className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-green-500"
              >
                <ThumbsUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {claim.reactions?.agree || 0}
              </button>
              <button
                onClick={() => claim.id && onReaction(claim.id, 'disagree')}
                className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 hover:text-red-500"
              >
                <ThumbsDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {claim.reactions?.disagree || 0}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommunityFeed; 