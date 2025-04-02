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
- OpenAI API key with billing set up
- Access to GPT-4o model

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Copy the `.env.example` file to a new file named `.env`:
   ```
   cp .env.example .env
   ```
4. Edit the `.env` file and add your OpenAI API key:
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

## Troubleshooting

### OpenAI API Issues

If you're seeing errors or fallback responses (highlighted in yellow), check the following:

1. **API Key**: Ensure your API key is correctly set in the `.env` file.

2. **Billing Setup**: Check that you have billing set up on your OpenAI account. Even with free credits, you need payment info on file.

3. **Rate Limits**: If you see `429` errors, you've exceeded your rate limit or quota. Options:
   - Wait and try again later
   - Add funds to your OpenAI account
   - Reduce usage

4. **Model Access**: Ensure your OpenAI account has access to the GPT-4o model.

5. **Test Button**: In development mode, use the lightning bolt button in the top right to test your API connection.

6. **Console Logs**: Check your browser console for detailed logs if you continue having issues.

### Deployment on Railway

When deploying to Railway:

1. Add `VITE_OPENAI_API_KEY` as an environment variable in your Railway project settings
2. The value should be your full OpenAI API key
3. No code changes are needed - the app will automatically use the environment variable

## Technology Stack

- React
- TypeScript
- Tailwind CSS
- OpenAI API (GPT-4o)
- Vite

## Notes

- This app is built for entertainment purposes
- The OpenAI integration is configured with `dangerouslyAllowBrowser: true` for demo purposes only. In a production environment, API calls should be made from a backend service. 