import { useState, type FormEvent } from 'react';
import { GitBranch, CheckCircle2, XCircle } from 'lucide-react';
import logo from '../assets/logo.png';
import { useGitHub } from '../context/useGitHub';

const Navbar = () => {
    const {
        connected,
        username,
        avatar,
        loading,
        connect,
        disconnect,
    } = useGitHub();

    const [inputToken, setInputToken] = useState('');
    const [error, setError] = useState('');

    async function handleConnect(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        try {
            await connect(inputToken.trim());
            setInputToken('');
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Connection failed.'
            );
        }
    }

    return (
        <header className="relative z-50 flex min-h-14 flex-wrap items-center justify-between gap-3 border-b border-[#30363d] bg-[#161b22] px-4 py-2 text-white">
            <div className="flex items-center gap-3">
                <img
                    src={logo}
                    className="h-7 w-7 rounded-full bg-white"
                    alt="GitHub Manager"
                />
                <h2 className="font-semibold">GitHub Manager</h2>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {connected ? (
                    <>
                        {avatar ? (
                            <img
                                src={avatar}
                                alt=""
                                className="h-7 w-7 rounded-full"
                            />
                        ) : (
                            <GitBranch size={18} />
                        )}

                        <span className="flex items-center gap-2 text-sm text-green-400">
                            <CheckCircle2 size={16} />
                            {username}
                        </span>

                        <button
                            onClick={disconnect}
                            className="rounded-md border border-[#30363d] px-3 py-2 text-sm hover:bg-[#21262d]"
                        >
                            Disconnect
                        </button>
                    </>
                ) : (
                    <>
                        <span className="flex items-center gap-2 text-sm text-gray-400">
                            <XCircle size={16} />
                            Disconnected
                        </span>

                        <form onSubmit={handleConnect} className="flex gap-2">
                            <input
                                type="password"
                                autoComplete="off"
                                value={inputToken}
                                onChange={(e) => setInputToken(e.target.value)}
                                placeholder="GitHub token"
                                aria-label="GitHub token"
                                className="w-44 rounded-md border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm outline-none focus:border-purple-500"
                            />

                            <button
                                disabled={loading || !inputToken.trim()}
                                className="rounded-md bg-purple-600 px-3 py-2 text-sm hover:bg-purple-500 disabled:opacity-50"
                            >
                                {loading ? 'Connecting...' : 'Connect'}
                            </button>
                        </form>
                    </>
                )}
            </div>

            {error && (
                <p role="alert" className="w-full text-right text-sm text-red-400">
                    {error}
                </p>
            )}
        </header>
    );
};

export default Navbar;
