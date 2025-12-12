import React, { useState, useRef, useEffect } from 'react';
import {
        Modal,
        ScrollView,
        KeyboardAvoidingView,
        Platform,
        ActivityIndicator,
        Image,
        View,
        TouchableOpacity,
} from 'react-native';
import { Box } from '@/src/components/ui/box';
import { Text } from '@/src/components/ui/text';
import { Pressable } from '@/src/components/ui/pressable';
import { FeedPostCard, TextInputField, Avatar } from '@/src/components/global';
import { ArrowLeft, MoreVertical, Trash2 } from 'lucide-react-native';
import type { CommentRow } from '@/src/api/comments';

// Only import Swipeable on native platforms to avoid web bundle errors
let Swipeable: any = null;
if (Platform.OS !== 'web') {
        const GestureHandler = require('react-native-gesture-handler');
        Swipeable = GestureHandler.Swipeable;
}

const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface PostModalProps {
        visible: boolean;
        focusedPost: any | null;
        commentsLoading: boolean;
        commentsForPost: CommentRow[];
        newComment: string;
        sendingComment: boolean;
        lastDeletedComment?: CommentRow | null;
        userId?: string;
        scrollToBottom?: boolean;
        isOwnPost?: boolean;
        onClose: () => void;
        onToggleLike: () => void;
        onPressCocktail: () => void;
        onCommentChange: (text: string) => void;
        onSendComment: () => void;
        onDeleteComment?: (commentId: string) => void;
        onUndoDelete?: () => void;
        onDeletePost?: () => void;
        formatTimeAgo: (date: string) => string;
}

export const PostModal: React.FC<PostModalProps> = ({
        visible,
        focusedPost,
        commentsLoading,
        commentsForPost,
        newComment,
        sendingComment,
        lastDeletedComment,
        userId,
        scrollToBottom = false,
        isOwnPost = false,
        onClose,
        onToggleLike,
        onPressCocktail,
        onCommentChange,
        onSendComment,
        onDeleteComment,
        onUndoDelete,
        onDeletePost,
        formatTimeAgo,
}) => {
        const commentsScrollViewRef = useRef<ScrollView | null>(null);
        const [menuVisible, setMenuVisible] = useState(false);
        const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
        const [pendingDelete, setPendingDelete] = useState(false);
        const [undoTimeout, setUndoTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

        // Scroll to bottom when comments load or when scrollToBottom flag changes
        useEffect(() => {
                if (scrollToBottom && commentsScrollViewRef.current) {
                        setTimeout(() => {
                                commentsScrollViewRef.current?.scrollToEnd({ animated: false });
                        }, 100);
                }
        }, [scrollToBottom, commentsForPost.length]);

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
                                                <Box className="flex-row items-center justify-between px-4 py-4 border-b border-neutral-200" style={{ zIndex: 10 }}>
                                                        <Box className="flex-row items-center">
                                                                <Pressable onPress={onClose} className="mr-3">
                                                                        <ArrowLeft size={24} color="#000" />
                                                                </Pressable>
                                                                <Text className="text-base font-semibold text-neutral-900">
                                                                        Post
                                                                </Text>
                                                        </Box>
                                                        {/* 3-dot menu for post owner */}
                                                        {isOwnPost && onDeletePost && (
                                                                <Pressable
                                                                        onPress={() => setMenuVisible(!menuVisible)}
                                                                        className="p-2"
                                                                >
                                                                        <MoreVertical size={22} color="#525252" />
                                                                </Pressable>
                                                        )}
                                                </Box>

                                                {/* Dropdown menu overlay */}
                                                {menuVisible && (
                                                        <>
                                                                <Pressable
                                                                        style={{
                                                                                position: 'absolute',
                                                                                top: 0,
                                                                                left: 0,
                                                                                right: 0,
                                                                                bottom: 0,
                                                                                zIndex: 998,
                                                                        }}
                                                                        onPress={() => setMenuVisible(false)}
                                                                />
                                                                <View style={{
                                                                        position: 'absolute',
                                                                        top: 52,
                                                                        right: 16,
                                                                        backgroundColor: '#fff',
                                                                        borderRadius: 12,
                                                                        shadowColor: '#000',
                                                                        shadowOpacity: 0.2,
                                                                        shadowOffset: { width: 0, height: 4 },
                                                                        shadowRadius: 16,
                                                                        elevation: 12,
                                                                        minWidth: 170,
                                                                        zIndex: 999,
                                                                        borderWidth: 1,
                                                                        borderColor: '#e5e5e5',
                                                                }}>
                                                                        <TouchableOpacity
                                                                                onPress={() => {
                                                                                        setMenuVisible(false);
                                                                                        setShowDeleteConfirm(true);
                                                                                }}
                                                                                style={{
                                                                                        flexDirection: 'row',
                                                                                        alignItems: 'center',
                                                                                        paddingVertical: 14,
                                                                                        paddingHorizontal: 16,
                                                                                }}
                                                                        >
                                                                                <Trash2 size={18} color="#ef4444" />
                                                                                <Text style={{ marginLeft: 12, color: '#ef4444', fontSize: 15, fontWeight: '600' }}>
                                                                                        Delete Post
                                                                                </Text>
                                                                        </TouchableOpacity>
                                                                </View>
                                                        </>
                                                )}

                                                {/* Delete Confirmation Dialog */}
                                                {showDeleteConfirm && (
                                                        <View style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                bottom: 0,
                                                                backgroundColor: 'rgba(0,0,0,0.4)',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                zIndex: 1000,
                                                        }}>
                                                                <View style={{
                                                                        backgroundColor: '#fff',
                                                                        borderRadius: 12,
                                                                        paddingVertical: 14,
                                                                        paddingHorizontal: 16,
                                                                        width: 240,
                                                                        elevation: 10,
                                                                }}>
                                                                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#171717', marginBottom: 4, textAlign: 'center' }}>Delete post?</Text>
                                                                        <Text style={{ fontSize: 11, color: '#666', marginBottom: 12, textAlign: 'center' }}>Are you sure you want to delete this post?</Text>
                                                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                                                                <TouchableOpacity
                                                                                        onPress={() => setShowDeleteConfirm(false)}
                                                                                        style={{ flex: 1, paddingVertical: 7, borderRadius: 6, backgroundColor: '#f0f0f0', alignItems: 'center' }}
                                                                                >
                                                                                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#525252' }}>Cancel</Text>
                                                                                </TouchableOpacity>
                                                                                <TouchableOpacity
                                                                                        onPress={() => {
                                                                                                setShowDeleteConfirm(false);
                                                                                                if (onDeletePost) onDeletePost();
                                                                                        }}
                                                                                        style={{ flex: 1, paddingVertical: 7, borderRadius: 6, backgroundColor: '#dc2626', alignItems: 'center' }}
                                                                                >
                                                                                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Delete</Text>
                                                                                </TouchableOpacity>
                                                                        </View>
                                                                </View>
                                                        </View>
                                                )}

                                                {/* Post + comments */}
                                                <ScrollView
                                                        ref={commentsScrollViewRef}
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
                                                        <Text className="text-sm font-semibold text-neutral-900 mb-3">
                                                                Comments
                                                        </Text>

                                                        {commentsLoading && (
                                                                <Box className="py-3 items-center">
                                                                        <ActivityIndicator size="small" color="#00BBA7" />
                                                                </Box>
                                                        )}

                                                        {!commentsLoading &&
                                                                commentsForPost.map((c) => {
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
                                                                                                {Platform.OS === 'web' && canDelete && onDeleteComment && (
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
                                                                                                        onPress={() => onDeleteComment && onDeleteComment(c.id)}
                                                                                                >
                                                                                                        <Trash2 size={20} color="#fff" />
                                                                                                </Pressable>
                                                                                        )}
                                                                                        onSwipeableOpen={() => {
                                                                                                if (canDelete && onDeleteComment) onDeleteComment(c.id);
                                                                                        }}
                                                                                >
                                                                                        {commentContent}
                                                                                </Swipeable>
                                                                        );
                                                                })}

                                                        {!commentsLoading && commentsForPost.length === 0 && (
                                                                <Text className="text-sm text-neutral-500">
                                                                        No comments yet
                                                                </Text>
                                                        )}

                                                        {/* Undo bar */}
                                                        {lastDeletedComment && onUndoDelete && (
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
                                                                                        onChangeText={onCommentChange}
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
                        </Box>
                </Modal>
        );
};
