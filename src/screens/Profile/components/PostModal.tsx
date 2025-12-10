import React, { useState } from 'react';
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

interface PostModalProps {
        visible: boolean;
        focusedPost: any | null;
        commentsLoading: boolean;
        commentsForPost: CommentRow[];
        newComment: string;
        sendingComment: boolean;
        isOwnPost?: boolean;
        onClose: () => void;
        onToggleLike: () => void;
        onPressCocktail: () => void;
        onCommentChange: (text: string) => void;
        onSendComment: () => void;
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
        isOwnPost = false,
        onClose,
        onToggleLike,
        onPressCocktail,
        onCommentChange,
        onSendComment,
        onDeletePost,
        formatTimeAgo,
}) => {
        const [menuVisible, setMenuVisible] = useState(false);
        const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
        const [pendingDelete, setPendingDelete] = useState(false);
        const [undoTimeout, setUndoTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

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
                                                                        width: 200,
                                                                        elevation: 10,
                                                                }}>
                                                                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#171717', marginBottom: 4, textAlign: 'center' }}>Delete post?</Text>
                                                                        <Text style={{ fontSize: 11, color: '#666', marginBottom: 12, textAlign: 'center' }}>Undo within 5 seconds</Text>
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
                                                                                                setPendingDelete(true);
                                                                                                const timeout = setTimeout(() => {
                                                                                                        setPendingDelete(false);
                                                                                                        if (onDeletePost) onDeletePost();
                                                                                                }, 5000);
                                                                                                setUndoTimeout(timeout);
                                                                                        }}
                                                                                        style={{ flex: 1, paddingVertical: 7, borderRadius: 6, backgroundColor: '#009689', alignItems: 'center' }}
                                                                                >
                                                                                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Delete</Text>
                                                                                </TouchableOpacity>
                                                                        </View>
                                                                </View>
                                                        </View>
                                                )}

                                                {/* Undo Delete Banner */}
                                                {pendingDelete && (
                                                        <View style={{
                                                                position: 'absolute',
                                                                bottom: 100,
                                                                left: 16,
                                                                right: 16,
                                                                backgroundColor: '#333',
                                                                borderRadius: 10,
                                                                paddingVertical: 12,
                                                                paddingHorizontal: 14,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                zIndex: 1001,
                                                                elevation: 8,
                                                        }}>
                                                                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>Deleting post...</Text>
                                                                <TouchableOpacity
                                                                        onPress={() => {
                                                                                if (undoTimeout) clearTimeout(undoTimeout);
                                                                                setUndoTimeout(null);
                                                                                setPendingDelete(false);
                                                                        }}
                                                                        style={{
                                                                                paddingVertical: 6,
                                                                                paddingHorizontal: 14,
                                                                                backgroundColor: '#009689',
                                                                                borderRadius: 6,
                                                                        }}
                                                                >
                                                                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Undo</Text>
                                                                </TouchableOpacity>
                                                        </View>
                                                )}

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
                                                                                                <Box className="mr-3">
                                                                                                        <Avatar
                                                                                                                avatarUrl={avatarUrl}
                                                                                                                initials={initials}
                                                                                                                size={32}
                                                                                                                fallbackColor="#009689"
                                                                                                        />
                                                                                                </Box>
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
