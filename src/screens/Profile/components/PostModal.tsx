import React from 'react';
import {
        Modal,
        ScrollView,
        KeyboardAvoidingView,
        Platform,
        ActivityIndicator,
        Image,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { FeedPostCard, TextInputField } from '@/src/components/global';
import { ArrowLeft } from 'lucide-react-native';
import type { CommentRow } from '@/src/api/comments';

interface PostModalProps {
        visible: boolean;
        focusedPost: any | null;
        commentsLoading: boolean;
        commentsForPost: CommentRow[];
        newComment: string;
        sendingComment: boolean;
        onClose: () => void;
        onToggleLike: () => void;
        onPressCocktail: () => void;
        onCommentChange: (text: string) => void;
        onSendComment: () => void;
        formatTimeAgo: (date: string) => string;
}

export const PostModal: React.FC<PostModalProps> = ({
        visible,
        focusedPost,
        commentsLoading,
        commentsForPost,
        newComment,
        sendingComment,
        onClose,
        onToggleLike,
        onPressCocktail,
        onCommentChange,
        onSendComment,
        formatTimeAgo,
}) => {
        return (
                <Modal
                        visible={visible}
                        animationType="slide"
                        transparent={false}
                        onRequestClose={onClose}
                >
                        <Box style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                                <KeyboardAvoidingView
                                        style={{ flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center', backgroundColor: '#fff' }}
                                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                >
                                        <Box className="flex-1 bg-white">
                                                {/* Header */}
                                                <Box className="flex-row items-center px-4 py-4 border-b border-neutral-200">
                                                        <Pressable onPress={onClose} className="mr-3">
                                                                <ArrowLeft size={24} color="#000" />
                                                        </Pressable>
                                                        <Text className="text-base font-semibold text-neutral-900">
                                                                Post
                                                        </Text>
                                                </Box>

                                                {/* Content */}
                                                <ScrollView
                                                        style={{ flex: 1 }}
                                                        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                                                >
                                                        {focusedPost && (
                                                                <Box className="mb-4">
                                                                        <FeedPostCard
                                                                                {...focusedPost}
                                                                                onToggleLike={onToggleLike}
                                                                                onPressComments={() => { }}
                                                                                onPressCocktail={onPressCocktail}
                                                                                onPressUser={() => { }}
                                                                        />
                                                                </Box>
                                                        )}

                                                        {/* Comments Section */}
                                                        <Text className="text-sm font-semibold text-neutral-900 mb-2">
                                                                Comments
                                                        </Text>

                                                        {commentsLoading ? (
                                                                <Box className="py-3 items-center">
                                                                        <ActivityIndicator size="small" color="#00BBA7" />
                                                                </Box>
                                                        ) : commentsForPost.length === 0 ? (
                                                                <Text className="text-sm text-gray-400">No comments yet</Text>
                                                        ) : (
                                                                commentsForPost.map((comment: CommentRow) => {
                                                                        const userName = comment.Profile?.full_name || 'User';
                                                                        const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                                                        const avatarUrl = comment.Profile?.avatar_url ?? null;
                                                                        return (
                                                                                <Box key={comment.id} className="mb-4 bg-white">
                                                                                        <Box className="flex-row items-start">
                                                                                                {avatarUrl ? (
                                                                                                        <Box className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 mr-3">
                                                                                                                <Image
                                                                                                                        source={{ uri: avatarUrl }}
                                                                                                                        style={{ width: 32, height: 32 }}
                                                                                                                        resizeMode="cover"
                                                                                                                />
                                                                                                        </Box>
                                                                                                ) : (
                                                                                                        <Box className="w-8 h-8 rounded-full bg-[#009689] items-center justify-center mr-3">
                                                                                                                <Text className="text-white text-xs font-medium">{initials}</Text>
                                                                                                        </Box>
                                                                                                )}
                                                                                                <Box className="flex-1">
                                                                                                        <Text className="text-sm font-semibold text-neutral-900">
                                                                                                                {userName}
                                                                                                        </Text>
                                                                                                        <Text className="text-sm text-neutral-700 mt-1">
                                                                                                                {comment.content}
                                                                                                        </Text>
                                                                                                        <Text className="text-xs text-neutral-400 mt-1">
                                                                                                                {formatTimeAgo(comment.created_at)}
                                                                                                        </Text>
                                                                                                </Box>
                                                                                        </Box>
                                                                                </Box>
                                                                        );
                                                                })
                                                        )}
                                                </ScrollView>

                                                {/* Comment Input */}
                                                <Box className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-neutral-200">
                                                        <Box className="flex-row items-center">
                                                                <Box className="flex-1 mr-2">
                                                                        <TextInputField
                                                                                value={newComment}
                                                                                onChangeText={onCommentChange}
                                                                                placeholder="Add a comment..."
                                                                                multiline={false}
                                                                        />
                                                                </Box>
                                                                <Pressable
                                                                        onPress={onSendComment}
                                                                        disabled={!newComment.trim() || sendingComment}
                                                                >
                                                                        <Text className={newComment.trim() ? 'text-sm font-semibold text-teal-500' : 'text-sm font-semibold text-neutral-300'}>
                                                                                {sendingComment ? 'Sending...' : 'Post'}
                                                                        </Text>
                                                                </Pressable>
                                                        </Box>
                                                </Box>
                                        </Box>
                                </KeyboardAvoidingView>
                        </Box>
                </Modal>
        );
};
