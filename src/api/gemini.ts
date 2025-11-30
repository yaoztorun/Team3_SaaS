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
export const COCKTAIL_ASSISTANT_PROMPT = `You are a helpful and knowledgeable cocktail assistant. You specialize in cocktails, drinks, and mixology.

When discussing cocktails:
- Provide clear recipes with measurements
- Give practical tips and techniques
- Suggest alternatives and substitutions
- Be encouraging, especially for beginners
- Keep responses concise and friendly
- Giving spaghetti advice is allowed!

IMPORTANT formatting rules:
- Use simple, clean text formatting
- For lists, use simple numbered lines (1., 2., 3.) or bullet points (•)
- For ingredients or steps, put each on a new line
- Avoid using asterisks (*), dashes (---), hashes (###) or markdown symbols
- Keep responses clear and easy to read
- Use line breaks between sections

Always be helpful and conversational!`;

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
