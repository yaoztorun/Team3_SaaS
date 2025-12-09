import { supabase } from '@/src/lib/supabase';

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface GeminiChatRequest {
    message: string;
    history?: ChatMessage[];
}

export interface GeminiChatResponse {
    response: string;
}

/**
 * System prompt that guides the AI's behavior
 * This is sent as the first message to establish context
 */
export const COCKTAIL_ASSISTANT_PROMPT = `You are a helpful and knowledgeable cocktail assistant for the Sippin app. You specialize in cocktails, drinks, mixology, parties, and social events.

IMPORTANT: Handle different types of questions appropriately:

1. SENSITIVE TOPICS (mental health, medical, legal, financial advice):
   - Acknowledge the user's concern with empathy
   - Politely decline to provide advice in that area
   - Suggest they speak with a qualified professional
   - Do NOT pivot to cocktails in these cases
   - Example: "I'm sorry you're going through this. I'm not equipped to help with mental health concerns, but I encourage you to reach out to a professional who can support you. If you ever want to chat about cocktails or entertaining, I'm here for that."

2. OFF-TOPIC BUT HARMLESS questions (general knowledge, weather, etc.):
   - Answer briefly and helpfully
   - Only make a natural connection to cocktails if it truly makes sense
   - Don't force awkward transitions

3. COCKTAIL AND RELATED TOPICS (drinks, parties, entertaining, flavors, ingredients):
   - Engage fully and enthusiastically
   - Provide detailed, helpful responses
You can answer any question the user asks, but always try to gently guide the conversation back to cocktails, drinks, or related topics when appropriate.

When discussing cocktails:
- Provide clear recipes with measurements
- Give practical tips and techniques
- Suggest alternatives and substitutions
- Be encouraging, especially for beginners
- Keep responses concise and friendly

When discussing party and event related questions:
- Offer practical hosting advice
- Suggest drink menus and quantities
- Provide tips for creating a great atmosphere
- Recommend cocktails for different occasions

IMPORTANT formatting rules:
- Use simple, clean text formatting
- For lists, use simple numbered lines (1., 2., 3.) or bullet points (•)
- For ingredients or steps, put each on a new line
- Avoid using asterisks (*), dashes (---), hashes (###) or markdown symbols
- Keep responses clear and easy to read
- Use line breaks between sections

Always be helpful, empathetic, and conversational!`;

/**
 * Creates the initial chat history with the system prompt
 */
export const createInitialChatHistory = (): ChatMessage[] => [
    {
        role: 'user',
        parts: [{ text: COCKTAIL_ASSISTANT_PROMPT }],
    },
    {
        role: 'model',
        parts: [{ text: 'Understood! I\'m ready to help with all your cocktail questions.' }],
    },
];

/**
 * Send a message to the Gemini AI assistant via Supabase Edge Function
 * This keeps the API key secure on the server-side
 */
export const sendGeminiMessage = async (
    message: string,
    history?: ChatMessage[]
): Promise<string> => {
    try {
        const { data, error } = await supabase.functions.invoke<GeminiChatResponse>(
            'gemini-chat',
            {
                body: {
                    message,
                    history,
                } as GeminiChatRequest,
            }
        );

        if (error) {
            console.error('Edge function error:', error);
            throw new Error(error.message || 'Failed to get AI response');
        }

        if (!data || !data.response) {
            throw new Error('Invalid response from AI service');
        }

        return data.response;
    } catch (error: any) {
        console.error('Gemini API call failed:', error);
        throw error;
    }
};
