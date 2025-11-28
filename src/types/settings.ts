export type UserSettings = {
  privacy: {
    is_private: boolean;
  };
  notifications: {
    likes: boolean;
    comments: boolean;
    party_invites: boolean;
    friend_requests: boolean;
  };
};

export const defaultSettings: UserSettings = {
  privacy: {
    is_private: false,
  },
  notifications: {
    likes: true,
    comments: true,
    party_invites: false,
    friend_requests: true,
  },
};
