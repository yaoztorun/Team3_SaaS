export type UserSettings = {
  notifications: {
    likes: boolean;
    comments: boolean;
    party_invites: boolean;
    friend_requests: boolean;
  };
};

export const defaultSettings: UserSettings = {
  notifications: {
    likes: true,
    comments: true,
    party_invites: false,
    friend_requests: true,
  },
};
