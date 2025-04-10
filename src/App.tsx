import React, { useState, useEffect } from 'react';
import { Search, ThumbsUp, ThumbsDown, Skull, Brain, Flame, Sparkles, AlertCircle, Zap, ExternalLink, Globe, User, LayoutGrid } from 'lucide-react';
import { factCheckClaim } from './services/openai';
import { Claim } from './types';
import LoginModal from './components/LoginModal';
import CommunityFeed from './components/CommunityFeed';
import { 
  getUserProfile, 
  updateUserCapCount, 
  addCommunityClaim, 
  subscribeToGlobalCapCount, 
  subscribeToRecentClaims,
  CommunityClaim
} from './services/firebase';

// Development mode detection
const isDev = import.meta.env.MODE === 'development';

function App() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'valid' | 'invalid' | 'quota_exceeded'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  // New states for user authentication and community features
  const [showLoginModal, setShowLoginModal] = useState(true);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [localCapCount, setLocalCapCount] = useState(0);
  const [globalCapCount, setGlobalCapCount] = useState(0);
  const [communityView, setCommunityView] = useState(false);
  const [communityClaims, setCommunityClaims] = useState<CommunityClaim[]>([]);

  // Check if API key is valid on load
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    console.log('[DEBUG] Env variable mode:', import.meta.env.MODE);
    console.log('[DEBUG] Checking API key on load');
    
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      console.log('[DEBUG] API key is invalid or missing');
      setApiKeyStatus('invalid');
      setErrorMessage('OpenAI API key is missing or invalid. Please check your .env file.');
    } else if (!apiKey.startsWith('sk-') || apiKey.length < 30) {
      console.log('[DEBUG] API key format is invalid');
      setApiKeyStatus('invalid');
      setErrorMessage('OpenAI API key format is invalid. It should start with "sk-" and be longer than 30 characters.');
    } else {
      console.log('[DEBUG] API key is present and format appears valid');
      setApiKeyStatus('valid');
    }
    
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(storedUser);
      setShowLoginModal(false);
      loadUserProfile(storedUser);
    }
  }, []);
  
  // Subscribe to global cap count and community claims when user is logged in
  useEffect(() => {
    if (!currentUser) return;
    
    // Subscribe to global cap count
    const unsubscribeGlobal = subscribeToGlobalCapCount(count => {
      setGlobalCapCount(count);
    });
    
    // Subscribe to community claims
    const unsubscribeClaims = subscribeToRecentClaims(claims => {
      setCommunityClaims(claims);
    });
    
    // Clean up subscriptions on unmount
    return () => {
      unsubscribeGlobal();
      unsubscribeClaims();
    };
  }, [currentUser]);

  // Function to load user profile from Firebase
  const loadUserProfile = async (username: string) => {
    try {
      const profile = await getUserProfile(username);
      setLocalCapCount(profile.localCapCount);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setErrorMessage('Failed to load user profile');
    }
  };

  // Handle user login
  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setShowLoginModal(false);
    localStorage.setItem('currentUser', username);
    loadUserProfile(username);
  };
  
  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setShowLoginModal(true);
    localStorage.removeItem('currentUser');
    setClaims([]);
  };

  // Updated function to check facts and update counters
  const checkFactWithAI = async (claim: string) => {
    if (!currentUser) {
      setShowLoginModal(true);
      return;
    }
    
    setIsAnalyzing(true);
    setErrorMessage(null);
    setErrorDetails(null);
    
    console.log('[DEBUG] App: Starting fact check for claim');
    
    try {
      // Check API key status before making request
      if (apiKeyStatus === 'invalid') {
        throw new Error('OpenAI API key is invalid or missing');
      }
      
      const result = await factCheckClaim(claim);
      
      console.log('[DEBUG] App: Received response:', result);
      console.log('[DEBUG] App: isAIGenerated:', result.isAIGenerated);
      
      const newClaim: Claim = {
        text: claim,
        verdict: result.verdict,
        evidence: result.evidence,
        roast: result.roast,
        reactions: { agree: 0, disagree: 0 },
        isAIGenerated: result.isAIGenerated
      };

      setClaims(prev => [newClaim, ...prev]);
      
      // Add to community claims
      if (result.isAIGenerated) {
        try {
          await addCommunityClaim(newClaim, currentUser);
          
          // If it's a cap (false), increment the user's cap counter
          if (!result.verdict) {
            await updateUserCapCount(currentUser, 1);
            setLocalCapCount(prev => prev + 1);
          }
        } catch (error) {
          console.error('Error adding to community claims:', error);
        }
      }
      
      // If we got a fallback response, show error information
      if (!result.isAIGenerated) {
        setApiKeyStatus('quota_exceeded');
        setErrorMessage('API Error: Check your OpenAI API key and billing status');
        setErrorDetails('Your OpenAI account may have exceeded its quota, or you may need to add a payment method.');
      }
    } catch (error) {
      console.error('[ERROR] App: Error fact checking claim:', error);
      
      if (error instanceof Error) {
        const errorMsg = error.message;
        setErrorMessage(`Error: ${errorMsg}`);
        
        if (errorMsg.includes('quota') || errorMsg.includes('billing')) {
          setApiKeyStatus('quota_exceeded');
          setErrorDetails('You need to add a payment method to your OpenAI account or clear any unpaid balance.');
        } else if (errorMsg.includes('key')) {
          setApiKeyStatus('invalid');
          setErrorDetails('Please check that your API key is correct and valid. You may need to generate a new one.');
        }
      } else {
        setErrorMessage('An unknown error occurred');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Development only - test API key function
  const testApiKey = async () => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setErrorDetails(null);
    
    try {
      console.log('[DEBUG] Testing API key with simple request...');
      
      const testResult = await factCheckClaim('This is a test API call to check if my API key is working');
      
      if (testResult.isAIGenerated) {
        console.log('[DEBUG] API key test success! Response:', testResult);
        setErrorMessage('✅ API key is valid and working!');
        setApiKeyStatus('valid');
      } else {
        console.log('[DEBUG] API key test failed - fallback response was used');
        setErrorMessage('❌ API key test failed - check console for details');
        setApiKeyStatus('quota_exceeded');
        setErrorDetails('Your account likely needs billing setup or has exceeded its quota');
      }
    } catch (error) {
      console.error('[ERROR] API key test failed:', error);
      if (error instanceof Error) {
        setErrorMessage(`❌ API key test error: ${error.message}`);
        
        if (error.message.includes('quota') || error.message.includes('billing')) {
          setApiKeyStatus('quota_exceeded');
          setErrorDetails('You need to add a payment method to your OpenAI account or clear any unpaid balance.');
        }
      } else {
        setErrorMessage('❌ API key test failed with unknown error');
      }
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
  
  // Toggle between personal and community views
  const toggleView = () => {
    setCommunityView(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 p-2 sm:p-4">
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onLogin={handleLogin}
      />
      
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 p-3 sm:p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
            <h1 className="text-lg sm:text-xl font-bold">Ali Fact Checker 3000</h1>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Cap Counter */}
            <div className="flex gap-2">
              {/* Local Cap Counter */}
              <div className="flex items-center px-2 py-1 bg-gray-800 rounded-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-blue-400" />
                <span className="text-xs sm:text-sm font-bold">Your Caps: <span className="text-blue-400">{localCapCount}</span></span>
              </div>
              
              {/* Global Cap Counter */}
              <div className="flex items-center px-2 py-1 bg-gray-800 rounded-lg">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-1 text-red-400" />
                <span className="text-xs sm:text-sm font-bold">All Caps: <span className="text-red-400">{globalCapCount}</span></span>
              </div>
            </div>
            
            {/* User controls */}
            {currentUser && (
              <div className="relative group">
                <button 
                  className="ml-2 p-1.5 bg-indigo-600 rounded-md text-xs flex items-center gap-1 hover:bg-indigo-700 transition-colors"
                  title={`Logged in as ${currentUser}`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentUser}</span>
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block transition-opacity duration-300 ease-in-out opacity-0 group-hover:opacity-100 before:content-[''] before:absolute before:top-[-10px] before:left-0 before:right-0 before:h-[10px]">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
            
            {/* Toggle View Button */}
            <button
              onClick={toggleView}
              className="ml-2 p-1.5 bg-purple-600 rounded-md text-xs hover:bg-purple-700 transition-colors"
              title={communityView ? "Switch to personal view" : "Switch to community view"}
            >
              {communityView ? <User className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
            </button>
            
            {/* Dev mode API test button */}
            {isDev && (
              <button 
                onClick={testApiKey}
                disabled={isAnalyzing}
                className="ml-2 p-1.5 bg-blue-600 rounded-md text-xs hover:bg-blue-700 transition-colors"
                title="Test API Key"
              >
                <Zap className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* API Key Status */}
        {apiKeyStatus === 'invalid' && (
          <div className="bg-red-50 p-3 border-b border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-red-500 w-5 h-5 flex-shrink-0" />
              <span className="text-red-600 text-sm">OpenAI API key is missing or invalid. Check your .env file.</span>
            </div>
            {errorDetails && (
              <p className="text-red-600 text-xs mt-1 ml-7">{errorDetails}</p>
            )}
            <div className="mt-2 ml-7">
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1 underline"
              >
                Get a new API key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Quota Exceeded Status */}
        {apiKeyStatus === 'quota_exceeded' && (
          <div className="bg-orange-50 p-3 border-b border-orange-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-orange-500 w-5 h-5 flex-shrink-0" />
              <span className="text-orange-600 text-sm">OpenAI API quota exceeded or billing required.</span>
            </div>
            {errorDetails && (
              <p className="text-orange-600 text-xs mt-1 ml-7">{errorDetails}</p>
            )}
            <div className="mt-2 ml-7 flex flex-wrap gap-3">
              <a 
                href="https://platform.openai.com/account/billing/overview" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 underline"
              >
                Check billing status <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://platform.openai.com/account/limits" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 underline"
              >
                Check usage limits <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && apiKeyStatus !== 'invalid' && apiKeyStatus !== 'quota_exceeded' && (
          <div className="bg-yellow-50 p-3 border-b border-yellow-200 flex items-center gap-2">
            <AlertCircle className="text-yellow-500 w-5 h-5" />
            <span className="text-yellow-700 text-sm">{errorMessage}</span>
          </div>
        )}

        {/* Tab Header */}
        <div className="bg-gray-100 px-3 py-2 border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setCommunityView(false)}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                !communityView 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Personal
            </button>
            <button
              onClick={() => setCommunityView(true)}
              className={`px-3 py-1 text-sm font-medium rounded-md ml-2 ${
                communityView 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              Community
            </button>
          </div>
        </div>

        {/* Chat Area - Shows either personal or community view */}
        <div className="h-[calc(100vh-180px)] sm:h-[500px] overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 bg-gray-50">
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-gray-600 animate-pulse">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              <span className="text-sm sm:text-base">Vibe checking Ali's claim...</span>
            </div>
          )}
          
          {/* Show either personal claims or community claims */}
          {!communityView ? (
            // Personal claims
            claims.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No claims yet. Start fact checking using the input below!
              </div>
            ) : (
              claims.map((claim, index) => (
                <div key={index} className="space-y-2">
                  <div className={`bg-white p-3 sm:p-4 rounded-lg text-sm sm:text-base border ${claim.isAIGenerated === false ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 shadow-sm'}`}>
                    <p className="font-medium text-gray-800">{claim.text}</p>
                    
                    {claim.isAIGenerated === false && (
                      <div className="flex items-center gap-1.5 mt-2 p-1.5 bg-yellow-100 rounded text-xs text-yellow-700">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Fallback response - API issue detected</span>
                      </div>
                    )}
                    
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
              ))
            )
          ) : (
            // Community feed
            <CommunityFeed claims={communityClaims} />
          )}
        </div>

        {/* Input Area - Only shown in personal view */}
        {!communityView && (
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
                disabled={isAnalyzing || apiKeyStatus === 'invalid' || !currentUser}
                className="px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Vibe Check
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;