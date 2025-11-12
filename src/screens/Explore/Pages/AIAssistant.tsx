import React, { useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { ScrollView, TextInput, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Send, ChevronLeft, Bot } from 'lucide-react-native';
import { colors } from '@/src/theme/colors';
import { useNavigation } from '@react-navigation/native';

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

export const AIAssistant = () => {
    const navigation = useNavigation();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hi! I'm your cocktail assistant. Ask me anything about cocktails, recipes, party planning, or mixology tips!",
            isUser: false,
            timestamp: "05:23"
        }
    ]);
    const [inputText, setInputText] = useState('');

    const handleSend = () => {
        if (!inputText.trim()) return;

        // Add user message
        const newMessage: Message = {
            id: messages.length + 1,
            text: inputText.trim(),
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, newMessage]);
        setInputText('');

        // Simulate AI response (in a real app, this would be an API call)
        setTimeout(() => {
            const aiResponse: Message = {
                id: messages.length + 2,
                text: "I'm a placeholder response. In the real version, I'll provide helpful cocktail-related answers!",
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1000);
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

                    {/* Suggested Questions (only show if only initial message) */}
                    {messages.length === 1 && (
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
                            className={`w-10 h-10 rounded-lg items-center justify-center ${
                                inputText.trim()
                                    ? 'bg-gradient-to-r from-[#009689] to-[#00786f]'
                                    : 'bg-gray-300'
                            }`}
                            style={{
                                backgroundColor: inputText.trim() ? '#009689' : '#d1d5dc',
                                opacity: inputText.trim() ? 1 : 0.5,
                            }}
                            disabled={!inputText.trim()}
                        >
                            <Send size={16} color="#fff" />
                        </Pressable>
                    </Box>
                </Box>
            </KeyboardAvoidingView>
        </Box>
    );
};
