import { createContext, useContext } from 'react';
import type { GitHubRepo } from '../types/repository';

interface GitHubContextType {
    token: string;
    username: string;
    avatar: string;
    connected: boolean;
    loading: boolean;
    error: string;
    accessWarning: string;
    repositories: GitHubRepo[];
    connect: (token: string) => Promise<void>;
    disconnect: () => void;
    refreshRepositories: () => Promise<void>;
    removeRepositories: (ids: number[]) => void;
}

export const GitHubContext = createContext<GitHubContextType | undefined>(
    undefined
);

export function useGitHub() {
    const context = useContext(GitHubContext);

    if (!context) {
        throw new Error('useGitHub must be used inside GitHubProvider.');
    }

    return context;
}
