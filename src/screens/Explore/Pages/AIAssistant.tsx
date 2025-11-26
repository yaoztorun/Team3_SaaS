import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { ScrollView, TextInput, KeyboardAvoidingView, Platform, View, ActivityIndicator } from 'react-native';
import { Send, ChevronLeft, Bot } from 'lucide-react-native';
import { colors } from '@/src/theme/colors';
import { useNavigation } from '@react-navigation/native';
import { sendGeminiMessage, ChatMessage, createInitialChatHistory } from '@/src/api/gemini';

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
    const chatHistoryRef = useRef<ChatMessage[]>(createInitialChatHistory()); // Store chat history for context
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

        try {
            // Add user message to chat history
            chatHistoryRef.current.push({
                role: 'user',
                parts: [{ text: userMessage }],
            });

            // Call Edge Function instead of direct API
            const responseText = await sendGeminiMessage(
                userMessage,
                chatHistoryRef.current
            );

            const aiText = formatAIResponse(responseText);

            // Add AI response to chat history
            chatHistoryRef.current.push({
                role: 'model',
                parts: [{ text: responseText }],
            });

            // Add AI response to messages
            const aiResponse: Message = {
                id: Date.now() + 1,
                text: aiText,
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            setMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
            
        } catch (error: any) {
            console.error('AI Assistant Error:', error);
            
            // Determine error message based on error type
            let errorText = "Sorry, I'm having trouble connecting right now. Please try again.";
            
            if (error?.message?.includes('overloaded') || error?.message?.includes('503')) {
                errorText = "The AI service is temporarily overloaded. Please try again in a moment! 🔄";
            } else if (error?.message?.includes('429')) {
                errorText = "You've reached the rate limit. Please wait a moment before trying again.";
            } else if (error?.message?.includes('Failed to get AI response')) {
                errorText = "Unable to reach the AI service. Please check your connection.";
            }
            
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: errorText,
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
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
                <Box className="bg-white border-t border-gray-200 px-4 py-8">
                    <Box className="flex-row items-center">
                        <Box className="flex-1 bg-[#f3f3f5] rounded-lg px-3 py-3 mr-2">
                            <TextInput
                                className="text-sm text-neutral-900"
                                style={{
                                    minHeight: 44,
                                    maxHeight: 100,
                                    outlineStyle: 'none'
                                } as any}
                                placeholder="Ask me anything..."
                                placeholderTextColor="#717182"
                                value={inputText}
                                onChangeText={setInputText}
                                onSubmitEditing={handleSend}
                                blurOnSubmit={false}
                                onKeyPress={(e: any) => {
                                    // On web, check if it's Enter without Shift key
                                    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                multiline
                            />
                        </Box>
                        <Pressable
                            onPress={handleSend}
                            className={`w-11 h-11 rounded-lg items-center justify-center ${
                                inputText.trim()
                                    ? 'bg-gradient-to-r from-[#009689] to-[#00786f]'
                                    : 'bg-gray-300'
                            }`}
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
