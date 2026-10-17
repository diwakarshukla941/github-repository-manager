import { useMemo, useState } from 'react';
import {
    Search,
    RefreshCw,
    Trash2,
    FolderGit2,
    Star,
    LockKeyhole,
    Globe,
    AlertCircle,
    X,
} from 'lucide-react';

import Repo from '../components/Repo';
import { useGitHub } from '../context/useGitHub';
import { deleteRepository } from '../services/github';

const Dashboard = () => {
    const {
        token,
        username,
        repositories,
        loading,
        error,
        accessWarning,
        refreshRepositories,
        removeRepositories,
    } = useGitHub();

    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleting, setDeleting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteProgress, setDeleteProgress] = useState({ completed: 0, total: 0 });

    const filteredRepos = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return repositories;

        return repositories.filter((repo) =>
            [
                repo.name,
                repo.full_name,
                repo.description ?? '',
                repo.language ?? '',
            ].some((value) => value.toLowerCase().includes(query))
        );
    }, [repositories, search]);

    const selectedRepos = repositories.filter((repo) =>
        selectedIds.includes(repo.id)
    );

    const allVisibleSelected =
        filteredRepos.length > 0 &&
        filteredRepos.every((repo) => selectedIds.includes(repo.id));

    const privateCount = repositories.filter((repo) => repo.private).length;
    const publicCount = repositories.length - privateCount;
    const totalStars = repositories.reduce(
        (total, repo) => total + repo.stargazers_count,
        0
    );

    const handleSelectionChange = (id: number) => {
        setSelectedIds((previous) =>
            previous.includes(id)
                ? previous.filter((selectedId) => selectedId !== id)
                : [...previous, id]
        );
    };

    const handleSelectAll = () => {
        if (allVisibleSelected) {
            const visibleIds = new Set(filteredRepos.map((repo) => repo.id));

            setSelectedIds((previous) =>
                previous.filter((id) => !visibleIds.has(id))
            );
        } else {
            setSelectedIds((previous) => [
                ...new Set([
                    ...previous,
                    ...filteredRepos.map((repo) => repo.id),
                ]),
            ]);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setDeleteError('');
        setDeleteSuccess('');

        try {
            await refreshRepositories();
        } catch (err) {
            setDeleteError(
                err instanceof Error
                    ? err.message
                    : 'Unable to refresh repositories.'
            );
        } finally {
            setRefreshing(false);
        }
    };

    const handleBulkDelete = async () => {
        if (deleting) return;
        if (!token || selectedRepos.length === 0) {
            setDeleteError(
                token
                    ? 'Select at least one repository.'
                    : 'Connect your GitHub account first.'
            );
            setShowDeleteConfirm(false);
            return;
        }

        setDeleting(true);
        setDeleteProgress({ completed: 0, total: selectedRepos.length });
        setDeleteError('');
        setDeleteSuccess('');

        const deletedIds: number[] = [];
        const failedRepos: string[] = [];

        try {
            for (const repo of selectedRepos) {
                try {
                    await deleteRepository(
                        token,
                        repo.owner.login,
                        repo.name
                    );

                    deletedIds.push(repo.id);
                    removeRepositories([repo.id]);
                } catch (err) {
                    const message =
                        err instanceof Error
                            ? err.message
                            : 'Unknown error';

                    failedRepos.push(`${repo.full_name}: ${message}`);
                }
                setDeleteProgress((previous) => ({ ...previous, completed: previous.completed + 1 }));
            }

            setSelectedIds((previous) =>
                previous.filter((id) => !deletedIds.includes(id))
            );

            if (deletedIds.length > 0) {
                setDeleteSuccess(
                    `Successfully deleted ${deletedIds.length} repository(s).`
                );
            }

            if (failedRepos.length > 0) {
                setDeleteError(
                    `Could not delete ${failedRepos.length} repository(s):\n${failedRepos.join('\n')}`
                );
            }

            // Reload GitHub's actual state after deletion attempts.
            try {
                await refreshRepositories();
            } catch {
                if (deletedIds.length > 0) {
                    setDeleteError((previous) =>
                        [
                            previous,
                            'Some repositories were deleted, but refreshing the list failed.',
                        ]
                            .filter(Boolean)
                            .join('\n')
                    );
                }
            }
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <main id="dashboard" className="min-h-screen bg-[#0d1117] p-4 pb-36 text-gray-100 sm:p-6 sm:pb-36 lg:p-8 lg:pb-36">
            {deleting && (
                <div role="status" aria-live="polite" className="sticky top-0 z-[110] -mx-4 mb-4 rounded-lg border border-purple-500/40 bg-[#161b22] p-4 shadow-xl sm:-mx-6 lg:-mx-8">
                    <div className="mb-3 flex items-center gap-3 text-sm font-medium text-purple-200">
                        <RefreshCw size={18} className="shrink-0 animate-spin" />
                        <span>
                            {deleteProgress.completed < deleteProgress.total
                                ? `Deleting repositories… ${deleteProgress.completed} of ${deleteProgress.total} processed`
                                : 'Deletion requests complete. Refreshing repositories…'}
                        </span>
                    </div>
                    <div role="progressbar" aria-label="Repository deletion progress" aria-valuemin={0} aria-valuemax={deleteProgress.total} aria-valuenow={deleteProgress.completed} className="h-1.5 overflow-hidden rounded-full bg-purple-500/15">
                        <div className="h-full bg-purple-400 transition-all duration-300 motion-reduce:transition-none" style={{ width: `${deleteProgress.total ? (deleteProgress.completed / deleteProgress.total) * 100 : 0}%` }} />
                    </div>
                </div>
            )}
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            GitHub Overview
                        </h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Welcome{username ? `, ${username}` : ''}. Manage
                            repositories you own in one place.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading || refreshing || deleting || !token}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-2.5 text-sm font-medium transition hover:border-purple-500 hover:bg-[#1c2129] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <RefreshCw
                            size={16}
                            className={
                                refreshing || loading ? 'animate-spin' : ''
                            }
                        />
                        Refresh
                    </button>
                </section>

                {/* Alerts */}
                {token && accessWarning && (
                    <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                        {accessWarning}
                        {' '}<a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" className="underline">Manage GitHub tokens</a>
                    </div>
                )}
                {error && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {deleteError && (
                    <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <p className="min-w-0 flex-1 whitespace-pre-line">
                            {deleteError}
                        </p>
                        <button
                            type="button"
                            onClick={() => setDeleteError('')}
                            aria-label="Dismiss error"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {deleteSuccess && (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                        <FolderGit2 size={18} />
                        <p className="flex-1">{deleteSuccess}</p>
                        <button
                            type="button"
                            onClick={() => setDeleteSuccess('')}
                            aria-label="Dismiss success message"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Statistics */}
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Repositories"
                        value={repositories.length}
                        icon={<FolderGit2 size={20} />}
                    />
                    <StatCard
                        title="Public Repositories"
                        value={publicCount}
                        icon={<Globe size={20} />}
                    />
                    <StatCard
                        title="Private Repositories"
                        value={privateCount}
                        icon={<LockKeyhole size={20} />}
                    />
                    <StatCard
                        title="Total Stars"
                        value={totalStars}
                        icon={<Star size={20} />}
                    />
                </section>

                {/* Repository section */}
                <section
                    id="repositories"
                    className="scroll-mt-24 space-y-5"
                >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                        <div>
                            <h2 className="text-xl font-semibold">
                                Your Repositories
                            </h2>
                            <p className="mt-1 text-sm text-gray-400">
                                {filteredRepos.length} of {repositories.length}{' '}
                                owned repositories
                            </p>
                        </div>


                    </div>

                    {/* Search and selection toolbar */}
                    <div className="flex flex-col gap-3 rounded-xl border border-[#30363d] bg-[#161b22] p-3 sm:flex-row sm:items-center">
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search repositories..."
                                className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] py-2.5 pl-10 pr-4 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleSelectAll}
                            disabled={filteredRepos.length === 0 || deleting || loading}
                            className="rounded-lg border border-[#30363d] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-purple-500 hover:text-purple-300 disabled:opacity-50"
                        >
                            {allVisibleSelected
                                ? 'Deselect visible'
                                : 'Select visible'}
                        </button>

                        {selectedIds.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="rounded-lg px-3 py-2.5 text-sm text-gray-400 transition hover:text-white"
                            >
                                Clear selection
                            </button>
                        )}
                    </div>

                    {/* Repository cards */}
                    {loading && repositories.length === 0 ? (
                        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-12 text-center text-sm text-gray-400">
                            <RefreshCw
                                size={24}
                                className="mx-auto mb-3 animate-spin"
                            />
                            Loading repositories...
                        </div>
                    ) : !token ? (
                        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-12 text-center">
                            <FolderGit2
                                size={32}
                                className="mx-auto mb-3 text-gray-500"
                            />
                            <h3 className="font-semibold">
                                Connect your GitHub account
                            </h3>
                            <p className="mt-2 text-sm text-gray-400">
                                Connect through the navigation bar to load your
                                repositories.
                            </p>
                        </div>
                    ) : filteredRepos.length === 0 ? (
                        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-12 text-center">
                            <Search
                                size={28}
                                className="mx-auto mb-3 text-gray-500"
                            />
                            <h3 className="font-semibold">
                                No repositories found
                            </h3>
                            <p className="mt-2 text-sm text-gray-400">
                                Try another search or refresh your repositories.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                            {filteredRepos.map((repo) => (
                                <Repo
                                    key={repo.id}
                                    repo={repo}
                                    selected={selectedIds.includes(repo.id)}
                                    disabled={deleting || loading}
                                    onSelectionChange={handleSelectionChange}
                                />
                            ))}
                        </div>
                    )}
                </section>

                {/* Settings */}
                <section
                    id="settings"
                    className="scroll-mt-24 rounded-xl border border-[#30363d] bg-[#161b22] p-5 sm:p-6"
                >
                    <h2 className="text-lg font-semibold">Settings & Security</h2>
                    <p className="mt-2 text-sm leading-6 text-gray-400">
                        This app communicates directly with GitHub from your
                        browser. Your access token is stored in session storage
                        for the current browser tab session. It remains
                        accessible to JavaScript running on this page, so only
                        use this app locally and never share your token.
                    </p>
                    <p className="mt-3 text-sm leading-6 text-gray-400">
                        Repository deletion is permanent. Confirm the selected
                        repositories carefully before proceeding.
                    </p>
                </section>
            </div>

            {selectedRepos.length > 0 && (
                <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#30363d] bg-[#161b22] p-4 shadow-2xl md:left-60" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                    {deleteError && <p role="alert" className="mx-auto mb-3 max-h-32 max-w-7xl overflow-y-auto whitespace-pre-line text-sm text-red-300">{deleteError}</p>}
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
                        <span role="status" className="text-sm text-gray-300">{selectedRepos.length} selected</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setDeleteError('');
                                    setDeleteSuccess('');
                                    setShowDeleteConfirm(true);
                                }}
                                disabled={deleting || loading || !token}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                            >
                                <Trash2 size={16} />
                                Delete selected ({selectedRepos.length})
                            </button>
                    </div>
                </div>
            )}

            {/* Delete confirmation dialog */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget && !deleting) {
                            setShowDeleteConfirm(false);
                        }
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-dialog-title"
                        className="w-full max-w-md rounded-2xl border border-[#30363d] bg-[#161b22] p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                            <Trash2 size={23} />
                        </div>

                        <h2
                            id="delete-dialog-title"
                            className="text-xl font-bold"
                        >
                            Delete repositories?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-400">
                            You are about to permanently delete{' '}
                            <span className="font-semibold text-white">
                                {selectedRepos.length}
                            </span>{' '}
                            repository(s). This action cannot be undone.
                        </p>

                        <div className="mt-4 max-h-40 space-y-2 overflow-y-auto rounded-lg border border-[#30363d] bg-[#0d1117] p-3">
                            {selectedRepos.map((repo) => (
                                <div
                                    key={repo.id}
                                    className="break-all text-sm text-gray-300"
                                >
                                    {repo.full_name}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="rounded-lg border border-[#30363d] px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:bg-[#21262d] disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleBulkDelete}
                                disabled={deleting || selectedRepos.length === 0}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Deleting {deleteProgress.completed} of {deleteProgress.total}...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Confirm delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 transition hover:border-purple-500/40">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">{title}</p>
                <span className="rounded-lg bg-purple-500/10 p-2 text-purple-300">
                    {icon}
                </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight">
                {value.toLocaleString()}
            </p>
        </div>
    );
}

export default function AccountDashboard() {
    const { username } = useGitHub();
    return <Dashboard key={username} />;
}
