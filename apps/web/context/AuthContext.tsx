'use client';

import React, { createContext, useContext } from 'react';

const AuthContext = createContext<any>({
    session: null,
    user: null,
    loading: false,
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const value = {
        session: null,
        user: null,
        loading: false,
        signOut: async () => { },
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
