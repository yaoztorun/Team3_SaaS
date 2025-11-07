import React, { useState } from 'react';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { PageHeader } from '../components/PageHeader';
import { ScrollView, TextInput, KeyboardAvoidingView, Platform, View } from 'react-native';
import { Send } from 'lucide-react-native';
import { colors } from '@/src/theme/colors';

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
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hi! I'm your cocktail assistant. Ask me anything about cocktails, recipes, party planning, or mixology tips!",
            isUser: false,
            timestamp: "12:05"
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

    return (
        <Box className="flex-1 bg-neutral-50">
            <PageHeader title="AI Assistant" />
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ padding: 16 }}
                >
                    {/* Messages */}
                    {messages.map((message) => (
                        <Box
                            key={message.id}
                            className={`mb-4 max-w-[85%] ${message.isUser ? 'self-end' : 'self-start'}`}
                        >
                            <Box
                                className={`rounded-2xl p-3 ${
                                    message.isUser
                                        ? 'bg-[#00BBA7]'
                                        : 'bg-white border border-neutral-200'
                                }`}
                            >
                                <Text
                                    className={message.isUser ? 'text-white' : 'text-neutral-900'}
                                >
                                    {message.text}
                                </Text>
                            </Box>
                            <Text className="text-xs text-neutral-500 mt-1">
                                {message.timestamp}
                            </Text>
                        </Box>
                    ))}

                    {/* Suggested Questions (only show if no user messages yet) */}
                    {messages.length === 1 && (
                        <Box className="mt-4">
                            <Text className="text-sm text-neutral-500 mb-2">Try asking:</Text>
                            {suggestedQuestions.map((question, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => {
                                        setInputText(question);
                                        handleSend();
                                    }}
                                    className="bg-white border border-neutral-200 rounded-xl p-3 mb-2"
                                >
                                    <Text className="text-neutral-900">{question}</Text>
                                </Pressable>
                            ))}
                        </Box>
                    )}
                </ScrollView>

                {/* Input Area */}
                <Box className="p-4 border-t border-neutral-200 bg-white">
                    <View className="flex-row items-center bg-neutral-50 rounded-xl px-4 py-2">
                        <TextInput
                            className="flex-1 text-base text-neutral-900"
                            placeholder="Ask me anything..."
                            value={inputText}
                            onChangeText={setInputText}
                            onSubmitEditing={handleSend}
                            multiline
                        />
                        <Pressable
                            onPress={handleSend}
                            className={`ml-2 p-2 rounded-full ${
                                inputText.trim() ? 'bg-[#00BBA7]' : 'bg-neutral-200'
                            }`}
                            disabled={!inputText.trim()}
                        >
                            <Send size={20} color={inputText.trim() ? '#fff' : '#666'} />
                        </Pressable>
                    </View>
                </Box>
            </KeyboardAvoidingView>
        </Box>
    );
};
