import React, { useState } from 'react';
import { UserCircle, AlertCircle } from 'lucide-react';
import { VALID_USERS } from '../services/firebase';

interface LoginModalProps {
  onLogin: (username: string) => void;
  isOpen: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, isOpen }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    const normalizedUsername = username.trim().toLowerCase();
    
    if (!VALID_USERS.includes(normalizedUsername)) {
      setError(`Invalid username. Valid options are: ${VALID_USERS.join(', ')}`);
      return;
    }
    
    // Call the onLogin callback
    onLogin(normalizedUsername);
    setUsername('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
        <div className="bg-purple-600 p-4 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserCircle className="w-6 h-6" />
            Welcome to Ali Fact Checker 3000
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Who are you?
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name (e.g. ali, sohail, etc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              This is just to identify your personal cap counter
            </p>
          </div>
          
          {error && (
            <div className="text-red-500 text-sm flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal; 