import {
    useCallback,
    useEffect,
    useState,
    useRef,
    type ReactNode,
} from 'react';

import {
    getGitHubUser,
    getRepositories,
    getRepositoryAccessWarning,
} from '../services/github';

import type { GitHubRepo } from '../types/repository';

import { GitHubContext } from './useGitHub';

export function GitHubProvider({ children }: { children: ReactNode }) {
    const requestVersion = useRef(0);
    const invalidateRequests = useCallback(() => { requestVersion.current++; }, []);
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [accessWarning, setAccessWarning] = useState('');

    const disconnect = useCallback(() => {
        requestVersion.current++;
        sessionStorage.removeItem('github_token');
        setToken('');
        setAccessWarning('');
        setUsername('');
        setAvatar('');
        setRepositories([]);
        setError('');
        setLoading(false);
    }, []);

    const connect = useCallback(async (newToken: string) => {
        newToken = newToken.trim();
        if (!newToken) throw new Error('Enter a GitHub token.');
        const version = ++requestVersion.current;
        setLoading(true);
        setError('');

        try {
            const [user, repos] = await Promise.all([
                getGitHubUser(newToken),
                getRepositories(newToken),
            ]);

            if (version !== requestVersion.current) return;
            sessionStorage.setItem('github_token', newToken);

            setToken(newToken);
            setUsername(user.login);
            setAvatar(user.avatar_url);
            setRepositories(repos);
            setAccessWarning(getRepositoryAccessWarning(user, repos));
        } catch (err) {
            if (version !== requestVersion.current) return;
            throw err instanceof Error
                ? err
                : new Error('GitHub connection failed.');
        } finally {
            if (version === requestVersion.current) setLoading(false);
        }
    }, []);

    const refreshRepositories = useCallback(async () => {
        if (!token) return;
        const version = ++requestVersion.current;

        setLoading(true);
        setError('');

        try {
            const [user, repos] = await Promise.all([
                getGitHubUser(token), getRepositories(token),
            ]);
            if (version === requestVersion.current) {
                setRepositories(repos);
                setAccessWarning(getRepositoryAccessWarning(user, repos));
            }
        } catch (err) {
            if (version !== requestVersion.current) return;
            const message = err instanceof Error
                ? err.message
                : 'Unable to load repositories.';

            if (message.includes('Invalid or expired')) {
                disconnect();
            }
            setError(message);

            throw err;
        } finally {
            if (version === requestVersion.current) setLoading(false);
        }
    }, [token, disconnect]);

    const removeRepositories = useCallback((ids: number[]) => {
        setRepositories((prev) =>
            prev.filter((repo) => !ids.includes(repo.id))
        );
    }, []);

    useEffect(() => {
        const savedToken = sessionStorage.getItem('github_token');

        if (!savedToken) return;

        let active = true;
        void Promise.resolve().then(() => {
            if (active) return connect(savedToken);
        }).catch(() => {
            if (!active) return;
            sessionStorage.removeItem('github_token');
            setToken('');
            setUsername('');
            setAvatar('');
            setRepositories([]);
            setError('Please reconnect your GitHub account.');
        });
        return () => { active = false; invalidateRequests(); };
    }, [connect, invalidateRequests]);

    return (
        <GitHubContext.Provider
            value={{
                token,
                username,
                avatar,
                connected: Boolean(token && username),
                loading,
                error,
                accessWarning,
                repositories,
                connect,
                disconnect,
                refreshRepositories,
                removeRepositories,
            }}
        >
            {children}
        </GitHubContext.Provider>
    );
}
