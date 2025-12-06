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

You can answer questions related to:
- Cocktails and drink recipes
- Mixology techniques and tips
- Party planning and hosting
- Drink pairings for events
- Cocktail shop items and bar tools
- Social gatherings and cocktail culture
- Anything related to the features and content within the Sippin app

The question must have some connection to cocktails, parties, drinks, or social events. If a question is completely unrelated to these topics (e.g., pure math, unrelated trivia), politely redirect the user back to topics you can help with.

When discussing cocktails:
- Provide clear recipes with measurements
- Give practical tips and techniques
- Suggest alternatives and substitutions
- Be encouraging, especially for beginners
- Keep responses concise and friendly

For party and event questions:
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
