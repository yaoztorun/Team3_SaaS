import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { ScrollView, TextInput, KeyboardAvoidingView, Platform, View, ActivityIndicator } from 'react-native';
import { Send, ChevronLeft, Bot } from 'lucide-react-native';
import { colors } from '@/src/theme/colors';
import { useNavigation } from '@react-navigation/native';
import { getGeminiModel, COCKTAIL_ASSISTANT_PROMPT } from '@/src/config/gemini';

// Example suggested questions that appear below the welcome message
const suggestedQuestions = [
    "How do I make a Mojito?",
    "What's a good cocktail for beginners?",
    "Help me plan a cocktail party",
    "What can I make with vodka?"
];

interface Message {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: string;
}

// Helper function to clean and format AI responses
const formatAIResponse = (text: string): string => {
    return text
        // Remove markdown bold/italic markers
        .replace(/\*\*\*/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '•') // Convert asterisks to bullets
        // Remove excessive dashes
        .replace(/---+/g, '')
        .replace(/===+/g, '')
        // Clean up spacing
        .replace(/\n{3,}/g, '\n\n')
        .trim();
};

export const AIAssistant = () => {
    const navigation = useNavigation();
    const scrollViewRef = useRef<ScrollView>(null);
    const chatRef = useRef<any>(null); // Store chat instance to maintain conversation
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hi! I'm your cocktail assistant. Ask me anything about cocktails, recipes, party planning, or mixology tips!",
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Initialize chat once when component mounts
    useEffect(() => {
        const model = getGeminiModel();
        chatRef.current = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: COCKTAIL_ASSISTANT_PROMPT }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood! I\'m ready to help with all your cocktail questions.' }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 1000,
                temperature: 0.9,
            },
        });
    }, []);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = inputText.trim();
        const newMessage: Message = {
            id: Date.now(),
            text: userMessage,
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');
        setIsLoading(true);

        // Retry logic for temporary failures
        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                // Use the existing chat instance to maintain conversation history
                if (!chatRef.current) {
                    throw new Error('Chat not initialized');
                }

                // Send message to the ongoing conversation
                const result = await chatRef.current.sendMessage(userMessage);
                const response = result.response;
                const aiText = formatAIResponse(response.text());

                // Add AI response to messages
                const aiResponse: Message = {
                    id: Date.now() + 1,
                    text: aiText,
                    isUser: false,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                
                setMessages(prev => [...prev, aiResponse]);
                setIsLoading(false);
                return; // Success - exit function
                
            } catch (error: any) {
                attempt++;
                console.error(`Gemini API Error (attempt ${attempt}/${maxRetries}):`, error);
                
                // Check if it's a temporary error that should be retried
                const is503Error = error?.message?.includes('overloaded') || error?.message?.includes('503');
                const is429Error = error?.message?.includes('429');
                
                if ((is503Error || is429Error) && attempt < maxRetries) {
                    // Wait before retrying (exponential backoff: 1s, 2s, 4s)
                    const waitTime = Math.pow(2, attempt - 1) * 1000;
                    console.log(`Retrying in ${waitTime}ms...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue; // Retry
                }
                
                // If all retries failed or it's a different error, show error message
                let errorText = "Sorry, I'm having trouble connecting right now.";
                
                if (is503Error) {
                    errorText = "The AI service is overloaded right now. I tried multiple times but couldn't connect. Please try again in a minute! 🔄";
                } else if (is429Error) {
                    errorText = "You've reached the rate limit. Please wait a moment before trying again.";
                } else if (error?.message?.includes('404')) {
                    errorText = "The AI model is not available. Please check your configuration.";
                } else if (error?.message?.includes('401') || error?.message?.includes('API key')) {
                    errorText = "There's an issue with the API key. Please check your configuration.";
                }
                
                const errorMessage: Message = {
                    id: Date.now() + 1,
                    text: errorText,
                    isUser: false,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                
                setMessages(prev => [...prev, errorMessage]);
                setIsLoading(false);
                return;
            }
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setInputText(question);
        setTimeout(() => handleSend(), 100);
    };

    return (
        <Box className="flex-1 bg-gray-50">
            {/* Custom Header */}
            <Box className="bg-white border-b border-gray-200 px-4 py-4 flex-row items-center">
                <Pressable onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={24} color="#000" />
                </Pressable>
                <Box className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center mr-3">
                    <Bot size={20} color="#009689" />
                </Box>
                <Box className="flex-1">
                    <Text className="text-lg font-medium text-neutral-900">AI Assistant</Text>
                    <Text className="text-xs text-[#6a7282]">Always here to help</Text>
                </Box>
            </Box>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1"
                    contentContainerStyle={{ padding: 16 }}
                >
                    {/* Messages */}
                    {messages.map((message) => (
                        <Box
                            key={message.id}
                            className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}
                        >
                            {!message.isUser && (
                                <Box className="flex-row items-start mb-1">
                                    <Box className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                                        <Bot size={20} color="#009689" />
                                    </Box>
                                    <Box className="flex-1 max-w-[312px]">
                                        <Box className="bg-white border border-gray-200 rounded-2xl p-4">
                                            <Text className="text-sm text-neutral-900 leading-5">
                                                {message.text}
                                            </Text>
                                        </Box>
                                        <Text className="text-xs text-[#6a7282] mt-1 ml-2">
                                            {message.timestamp}
                                        </Text>
                                    </Box>
                                </Box>
                            )}
                            {message.isUser && (
                                <Box className="max-w-[312px]">
                                    <Box className="bg-[#00BBA7] rounded-2xl p-4">
                                        <Text className="text-sm text-white leading-5">
                                            {message.text}
                                        </Text>
                                    </Box>
                                    <Text className="text-xs text-[#6a7282] mt-1 mr-2 text-right">
                                        {message.timestamp}
                                    </Text>
                                </Box>
                            )}
                        </Box>
                    ))}

                    {/* Loading Indicator */}
                    {isLoading && (
                        <Box className="mb-4 items-start">
                            <Box className="flex-row items-start mb-1">
                                <Box className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
                                    <Bot size={20} color="#009689" />
                                </Box>
                                <Box className="bg-white border border-gray-200 rounded-2xl p-4">
                                    <ActivityIndicator size="small" color="#009689" />
                                </Box>
                            </Box>
                        </Box>
                    )}

                    {/* Suggested Questions (only show if only initial message) */}
                    {messages.length === 1 && !isLoading && (
                        <Box className="mt-4">
                            <Text className="text-sm text-[#4a5565] mb-3 ml-2">Try asking:</Text>
                            {suggestedQuestions.map((question, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => handleSuggestedQuestion(question)}
                                    className="bg-white border border-gray-200 rounded-2xl p-4 mb-2"
                                >
                                    <Text className="text-sm text-neutral-900">{question}</Text>
                                </Pressable>
                            ))}
                        </Box>
                    )}
                </ScrollView>

                {/* Input Area */}
                <Box className="bg-white border-t border-gray-200 px-4 py-4">
                    <Box className="flex-row items-center">
                        <Box className="flex-1 bg-[#f3f3f5] rounded-lg px-3 py-2 mr-2">
                            <TextInput
                                className="text-sm text-neutral-900 min-h-[36px]"
                                placeholder="Ask me anything..."
                                placeholderTextColor="#717182"
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={handleSend}
                                multiline
                            />
                        </Box>
                        <Pressable
                            onPress={handleSend}
                            className={`w-10 h-10 rounded-lg items-center justify-center`}
                            style={{
                                backgroundColor: inputText.trim() && !isLoading ? '#009689' : '#d1d5dc',
                                opacity: inputText.trim() && !isLoading ? 1 : 0.5,
                            }}
                            disabled={!inputText.trim() || isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Send size={16} color="#fff" />
                            )}
                        </Pressable>
                    </Box>
                </Box>
            </KeyboardAvoidingView>
        </Box>
    );
};
