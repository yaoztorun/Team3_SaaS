import React, { createContext, useContext } from 'react';

interface FriendRequestContextType {
    refreshBadge: () => void;
}

const FriendRequestContext = createContext<FriendRequestContextType | null>(null);

export function FriendRequestProvider({ 
    children, 
    refreshBadge 
}: { 
    children: React.ReactNode; 
    refreshBadge: () => void;
}) {
    return (
        <FriendRequestContext.Provider value={{ refreshBadge }}>
            {children}
        </FriendRequestContext.Provider>
    );
}

export function useFriendRequestBadge() {
    const context = useContext(FriendRequestContext);
    if (!context) {
        // Return a no-op function if context is not available
        return { refreshBadge: () => {} };
    }
    return context;
}
