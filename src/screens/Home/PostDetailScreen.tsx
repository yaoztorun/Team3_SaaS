import React, { useRef, useEffect } from 'react';
import {
        ScrollView,
        ActivityIndicator,
        Modal,
        KeyboardAvoidingView,
        Platform,
        View,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { FeedPostCard, TextInputField, Avatar } from '@/src/components/global';
import { ArrowLeft, Trash2 } from 'lucide-react-native';
import type { CommentRow } from '@/src/api/comments';
import type { FeedPost } from './HomeScreen';

// Only import Swipeable on native platforms to avoid web bundle errors
let Swipeable: any = null;
if (Platform.OS !== 'web') {
        const GestureHandler = require('react-native-gesture-handler');
        Swipeable = GestureHandler.Swipeable;
}

type PostDetailScreenProps = {
        visible: boolean;
        post: FeedPost | null;
        comments: CommentRow[];
        commentsLoading: boolean;
        newComment: string;
        sendingComment: boolean;
        lastDeletedComment: CommentRow | null;
        userId?: string;
        scrollToBottom?: boolean;
        onClose: () => void;
        onToggleLike: () => void;
        onPressUser: (userId: string) => void;
        onPressTags: () => void;
        onPressCocktail: (cocktailId: string) => void;
        onChangeComment: (text: string) => void;
        onSendComment: () => void;
        onDeleteComment: (commentId: string) => void;
        onUndoDelete: () => void;
};

const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const PostDetailScreen: React.FC<PostDetailScreenProps> = ({
        visible,
        post,
        comments,
        commentsLoading,
        newComment,
        sendingComment,
        lastDeletedComment,
        userId,
        scrollToBottom = false,
        onClose,
        onToggleLike,
        onPressUser,
        onPressTags,
        onPressCocktail,
        onChangeComment,
        onSendComment,
        onDeleteComment,
        onUndoDelete,
}) => {
        const commentsScrollViewRef = useRef<ScrollView | null>(null);

        // Scroll to bottom when comments load or when scrollToBottom flag changes
        useEffect(() => {
                if (scrollToBottom && commentsScrollViewRef.current) {
                        setTimeout(() => {
                                commentsScrollViewRef.current?.scrollToEnd({ animated: false });
                        }, 100);
                }
        }, [scrollToBottom, comments.length]);

        return (
                <Modal
                        visible={visible}
                        animationType="slide"
                        transparent={false}
                        onRequestClose={onClose}
                >
                        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
                                <KeyboardAvoidingView
                                        style={{ flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center', backgroundColor: '#fff' }}
                                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                >
                                        <Box className="flex-1 bg-white">
                                                {/* Header with back button */}
                                                <Box className="flex-row items-center px-4 py-4 border-b border-neutral-200">
                                                        <Pressable onPress={onClose} className="mr-3">
                                                                <ArrowLeft size={24} color="#000" />
                                                        </Pressable>
                                                        <Text className="text-base font-semibold text-neutral-900">
                                                                Post
                                                        </Text>
                                                </Box>

                                                {/* Post + comments */}
                                                <ScrollView
                                                        ref={commentsScrollViewRef}
                                                        style={{ flex: 1 }}
                                                        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                                                >
                                                        {/* Focused post card */}
                                                        {post && (
                                                                <Box className="mb-4">
                                                                        <FeedPostCard
                                                                                {...post}
                                                                                onToggleLike={onToggleLike}
                                                                                // comments button does nothing here (we're already in detail)
                                                                                onPressComments={() => { }}
                                                                                onPressUser={() => {
                                                                                        if (post.userId) {
                                                                                                onPressUser(post.userId);
                                                                                        }
                                                                                }}
                                                                                onPressTags={onPressTags}
                                                                                onPressCocktail={onPressCocktail}
                                                                        />
                                                                </Box>
                                                        )}

                                                        {/* Comments title */}
                                                        <Text className="text-sm font-semibold text-neutral-900 mb-2">
                                                                Comments
                                                        </Text>

                                                        {/* Comments list */}
                                                        {commentsLoading && (
                                                                <Box className="py-3 items-center">
                                                                        <ActivityIndicator size="small" color="#00BBA7" />
                                                                </Box>
                                                        )}

                                                        {!commentsLoading &&
                                                                comments.map((c) => {
                                                                        const canDelete = c.user_id === userId;
                                                                        const userName = c.Profile?.full_name ?? 'Unknown user';
                                                                        const initials = getInitials(userName);
                                                                        const avatarUrl = c.Profile?.avatar_url ?? null;

                                                                        const commentContent = (
                                                                                <Box className="mb-4 bg-white">
                                                                                        <Box className="flex-row items-start">
                                                                                                <Box className="mr-3">
                                                                                                        <Avatar
                                                                                                                avatarUrl={avatarUrl}
                                                                                                                initials={initials}
                                                                                                                size={32}
                                                                                                                fallbackColor="#009689"
                                                                                                        />
                                                                                                </Box>
                                                                                                <Box className="flex-1">
                                                                                                        <Text className="text-sm font-semibold text-neutral-900 mb-1">
                                                                                                                {userName}
                                                                                                        </Text>
                                                                                                        <Text className="text-sm text-neutral-700">
                                                                                                                {c.content}
                                                                                                        </Text>
                                                                                                </Box>
                                                                                                {/* Show delete button on web */}
                                                                                                {Platform.OS === 'web' && canDelete && (
                                                                                                        <Pressable
                                                                                                                className="ml-2 p-2"
                                                                                                                onPress={() => onDeleteComment(c.id)}
                                                                                                        >
                                                                                                                <Trash2 size={16} color="#ef4444" />
                                                                                                        </Pressable>
                                                                                                )}
                                                                                        </Box>
                                                                                </Box>
                                                                        );

                                                                        // On web: render without Swipeable
                                                                        if (Platform.OS === 'web') {
                                                                                return <View key={c.id}>{commentContent}</View>;
                                                                        }

                                                                        // On native: use Swipeable for swipe-to-delete
                                                                        return (
                                                                                <Swipeable
                                                                                        key={c.id}
                                                                                        enabled={canDelete}
                                                                                        renderRightActions={() => (
                                                                                                <Pressable
                                                                                                        className="bg-red-500 justify-center items-center w-16 rounded-lg"
                                                                                                        onPress={() => onDeleteComment(c.id)}
                                                                                                >
                                                                                                        <Trash2 size={20} color="#fff" />
                                                                                                </Pressable>
                                                                                        )}
                                                                                        onSwipeableOpen={() => {
                                                                                                if (canDelete) onDeleteComment(c.id);
                                                                                        }}
                                                                                >
                                                                                        {commentContent}
                                                                                </Swipeable>
                                                                        );
                                                                })}

                                                        {!commentsLoading && comments.length === 0 && (
                                                                <Text className="text-sm text-neutral-500">
                                                                        No comments yet
                                                                </Text>
                                                        )}

                                                        {/* Undo bar */}
                                                        {lastDeletedComment && (
                                                                <Box className="flex-row items-center justify-between mt-2 px-3 py-2 rounded-lg bg-neutral-100">
                                                                        <Text className="text-xs text-neutral-700">
                                                                                Comment deleted
                                                                        </Text>
                                                                        <Pressable onPress={onUndoDelete}>
                                                                                <Text className="text-xs font-semibold text-[#009689]">
                                                                                        Undo
                                                                                </Text>
                                                                        </Pressable>
                                                                </Box>
                                                        )}
                                                </ScrollView>

                                                {/* Input row at bottom */}
                                                {userId && (
                                                        <Box className="px-4 py-3 border-t border-neutral-200 bg-white">
                                                                <Box className="flex-row items-center gap-2">
                                                                        <Box className="flex-1">
                                                                                <TextInputField
                                                                                        value={newComment}
                                                                                        onChangeText={onChangeComment}
                                                                                        placeholder="Add a comment..."
                                                                                />
                                                                        </Box>
                                                                        <Pressable
                                                                                className="px-4 py-2 rounded-full bg-[#009689]"
                                                                                onPress={onSendComment}
                                                                                disabled={sendingComment || !newComment.trim()}
                                                                        >
                                                                                <Text className="text-white text-sm font-medium">
                                                                                        {sendingComment ? '...' : 'Send'}
                                                                                </Text>
                                                                        </Pressable>
                                                                </Box>
                                                        </Box>
                                                )}
                                        </Box>
                                </KeyboardAvoidingView>
                        </View>
                </Modal>
        );
};
