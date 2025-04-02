# Ali Fact Checker 3000

A humorous fact-checking app that evaluates claims supposedly made by someone named Ali using OpenAI's GPT-4o API, with Firebase real-time community features.

## Features

- Submit claims allegedly made by Ali
- AI-powered fact checking with GPT-4o 
- Displays verdict (Cap or No Cap)
- Shows evidence and a funny roast
- User reactions (agree/disagree)
- **Personal cap counter** for each user that persists
- **Global cap counter** that aggregates all users' caps
- **Community feed** to see claims from all users
- User authentication (simplified for the 8 designated users)
- Real-time updates with Firebase

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- OpenAI API key with billing set up
- Access to GPT-4o model
- Firebase project (free tier works fine)

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Copy the configuration values to your `.env` file
5. Set up Firestore Database (in test mode is fine for development)
6. For a production environment, set appropriate Firestore security rules

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
4. Edit the `.env` file and add your OpenAI API key and Firebase configuration:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

### Running the App

Start the development server:
```
npm run dev
```

The app will be available at http://localhost:5173/

### User Authentication

The app has a simple login system for the 8 designated users:
- ali
- umar
- qasim
- jibraan
- sadi
- abdul
- sohail
- maha

Enter your name in lowercase to access your personal cap counter.

### Building for Production

To create a production build:
```
npm run build
```

## Community Features

### Personal View
- See claims you've submitted
- Submit new claims for fact checking
- Your personal cap counter shows how many false claims you've submitted

### Community View
- See claims from all users
- Global cap counter shows total false claims from all users
- Real-time updates when new claims are added

## Deployment on Railway

To deploy this application on Railway:

1. Create a new project in Railway and connect your GitHub repository
2. Add the following environment variables in Railway:
   - `VITE_OPENAI_API_KEY` (your OpenAI API key)
   - `VITE_FIREBASE_API_KEY` (from your Firebase project)
   - `VITE_FIREBASE_AUTH_DOMAIN` (from your Firebase project)
   - `VITE_FIREBASE_PROJECT_ID` (from your Firebase project)
   - `VITE_FIREBASE_STORAGE_BUCKET` (from your Firebase project)
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` (from your Firebase project)
   - `VITE_FIREBASE_APP_ID` (from your Firebase project)
   - `VITE_FIREBASE_MEASUREMENT_ID` (from your Firebase project)
3. Set the build command to `npm run build`
4. Set the start command to `npm run start`
5. In Firebase console, update your Firebase security rules to allow access from your Railway domain
6. Add your Railway app domain to the authorized domains in Firebase Authentication settings

## Troubleshooting

### OpenAI API Issues

If you're seeing errors or fallback responses (highlighted in yellow), check the following:

1. **API Key**: Ensure your API key is correctly set in the `.env` file.

2. **Billing Setup**: Check that you have billing set up on your OpenAI account. Even with free credits, you need payment info on file.

3. **Rate Limits**: If you see `429` errors, you've exceeded your rate limit or quota. Options:
   - Wait and try again later
   - Add funds to your OpenAI account
   - Reduce usage

4. **Model Access**: Ensure your OpenAI account has access to the model being used.

5. **Test Button**: In development mode, use the lightning bolt button in the top right to test your API connection.

6. **Console Logs**: Check your browser console for detailed logs if you continue having issues.

### Firebase Issues

If you're experiencing issues with the community features:

1. **Firebase Config**: Verify all Firebase configuration variables in your `.env` file.

2. **Firestore Rules**: Ensure your Firestore database rules allow read/write access. For a basic setup, use:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write;
       }
     }
   }
   ```

3. **CORS Issues**: If deploying to a custom domain, make sure it's added to your Firebase authorized domains.

4. **Browser Console**: Check for Firebase-related errors in the browser console.

## Technology Stack

- React
- TypeScript
- Tailwind CSS
- OpenAI API (GPT-4o)
- Firebase (Firestore & Analytics)
- Vite

## Notes

- This app is built for entertainment purposes
- The OpenAI integration is configured with `dangerouslyAllowBrowser: true` for demo purposes only. In a production environment, API calls should be made from a backend service. 