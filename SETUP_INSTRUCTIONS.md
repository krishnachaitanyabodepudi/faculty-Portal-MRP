# Silverleaf University Faculty Portal - Setup Instructions

## Getting Your Groq API Key

1. **Go to Groq Console**
   - Visit: https://console.groq.com

2. **Sign in with your account**
   - Create an account or sign in

3. **Create API Key**
   - Navigate to API Keys section
   - Click "Create API Key"
   - Copy the generated API key

## Setting Up Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Add Your API Key

Create a file named `.env.local` in the root directory:

```env
GROQ_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the API key you got from Groq Console.

### 3. Run the Application
```bash
npm run dev
```

### 4. Open in Browser
Navigate to: http://localhost:3000

### 5. Login
- Email: `professor@silverleaf.edu`
- Password: `password123`

## Features Now Working

✅ **AI Chatbot** - Ask questions about your course syllabus
✅ **Feedback Analyzer** - Automatically grade student assignments with AI

Both features are powered by Groq's Llama 3.1 70B model.

## Troubleshooting

**Error: "Please add your GROQ_API_KEY"**
- Make sure you created the `.env.local` file
- Make sure the API key is correct
- Restart the development server after adding the key

**Chatbot not responding**
- Check the browser console for errors
- Verify your API key is valid
- Make sure you have internet connection

## API Usage & Costs

Groq API offers fast inference with competitive pricing:
- High rate limits
- Fast response times
- Pay-as-you-go pricing

## Need Help?

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Verify your API key in `.env.local`
3. Make sure you restarted the dev server after adding the key
