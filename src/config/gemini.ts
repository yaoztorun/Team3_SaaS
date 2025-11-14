import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// ⚠️ SECURITY: API key is loaded from environment variables
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
    console.error('⚠️ GEMINI_API_KEY not found in environment variables!');
}

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);

// Get the Gemini model (using Gemini Flash Latest - most stable)
export const getGeminiModel = () => {
    // Use gemini-flash-latest which points to the most stable flash model
    // This automatically uses the best available flash model
    return genAI.getGenerativeModel({ 
        model: 'gemini-flash-latest',
        // Safety settings to allow more flexible content
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ],
    });
};

// System prompt to guide the AI's behavior
export const COCKTAIL_ASSISTANT_PROMPT = `You are a helpful and knowledgeable assistant. You specialize in cocktails, drinks, and mixology, but you can also help with general questions.

When discussing cocktails:
- Provide clear recipes with measurements
- Give practical tips and techniques
- Suggest alternatives and substitutions
- Be encouraging, especially for beginners

For other topics:
- Be helpful and informative
- Keep responses conversational and friendly

IMPORTANT formatting rules:
- Use simple, clean text formatting
- For lists, use simple numbered lines (1., 2., 3.) or bullet points (•)
- For ingredients or steps, put each on a new line
- Avoid using asterisks (*), dashes (---), or markdown symbols
- Keep responses clear and easy to read
- Use line breaks between sections

Keep responses concise but complete (3-6 sentences for simple questions, more detail for complex topics).`;
