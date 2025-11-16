# Environment Setup Guide

## Setting Up Your Groq API Key

The Faculty Portal uses Groq AI for the chatbot and feedback analyzer features. You need to add your API key to use these features.

### Option 1: Using v0 (Recommended)

1. Click the **sidebar** on the left side of v0
2. Go to the **"Vars"** section
3. Click **"Add Variable"**
4. Enter:
   - Name: `GROQ_API_KEY`
   - Value: Your Groq API key (get it from https://console.groq.com)
5. Click **"Save"**

### Option 2: Local Development

Create a `.env.local` file in your project root:

```env
GROQ_API_KEY=your_api_key_here
```

**IMPORTANT:** Never commit `.env.local` to Git. It's already in `.gitignore`.

## Getting Your Groq API Key

1. Go to https://console.groq.com
2. Sign in with your account
3. Navigate to API Keys section
4. Click **"Create API Key"**
5. Copy the generated key
6. Paste it into the environment variable

## Features Using Groq API

### 1. Syllabus-Aligned Chatbot
- Automatically reads uploaded syllabus PDFs
- Answers questions based on course content
- Provides context-aware responses

### 2. PDF Parsing
- Extracts text from uploaded syllabus PDFs
- Converts PDF content to structured data
- Displays syllabus in organized format

### 3. Feedback Analyzer
- Grades student assignments based on rubrics
- Uses syllabus context for accurate evaluation
- Provides detailed feedback and scores

## Troubleshooting

### Error: "This generation requires environment variables"
- Make sure you added `GROQ_API_KEY` in the Vars section
- Restart your preview after adding the variable

### Error: "Failed to extract text from PDF"
- Check that your API key is valid
- Ensure the PDF is not corrupted
- Try uploading a different PDF format

### Chatbot not responding
- Verify GROQ_API_KEY is set correctly
- Check browser console for error messages
- Ensure you have internet connectivity

## API Usage Notes

- Groq API offers fast inference
- Large PDF files may take longer to process
- First request might be slower (cold start)
- Streaming responses provide real-time feedback
