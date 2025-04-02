# Ali Fact Checker 3000

A humorous fact-checking app that evaluates claims supposedly made by someone named Ali using OpenAI's GPT-4o API.

## Features

- Submit claims allegedly made by Ali
- AI-powered fact checking with GPT-4o 
- Displays verdict (Cap or No Cap)
- Shows evidence and a funny roast
- User reactions (agree/disagree)
- Cap counter to track Ali's truthfulness

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

### Running the App

Start the development server:
```
npm run dev
```

The app will be available at http://localhost:5173/

### Building for Production

To create a production build:
```
npm run build
```

## Technology Stack

- React
- TypeScript
- Tailwind CSS
- OpenAI API (GPT-4o)
- Vite

## Notes

- This app is built for entertainment purposes
- The OpenAI integration is configured with `dangerouslyAllowBrowser: true` for demo purposes only. In a production environment, API calls should be made from a backend service. 