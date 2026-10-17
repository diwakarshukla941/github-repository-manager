import { BookMarked, Star, ExternalLink } from 'lucide-react';
import type { GitHubRepo } from '../types/repository';

interface RepoProps {
    repo: GitHubRepo;
    selected: boolean;
    onSelectionChange: (id: number) => void;
    disabled?: boolean;
}

const Repo = ({ repo, selected, onSelectionChange, disabled }: RepoProps) => (
    <article className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 transition-colors hover:border-purple-500/60">
        <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
                <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => onSelectionChange(repo.id)}
                    disabled={disabled}
                    aria-label={`Select ${repo.name}`}
                    className="accent-purple-500"
                />

                <BookMarked size={20} className="shrink-0 text-purple-400" />

                <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-semibold hover:text-purple-300"
                >
                    {repo.name}
                </a>
            </div>

            <span className="shrink-0 rounded-full border border-gray-600 px-2 py-1 text-xs text-gray-400">
                {repo.private ? 'Private' : 'Public'}
            </span>
        </div>

        <p className="my-4 min-h-10 text-sm text-gray-400">
            {repo.description || 'No description provided.'}
        </p>

        <div className="flex items-center justify-between border-t border-[#30363d] pt-4 text-sm">
            <span className="flex items-center gap-2 text-gray-300">
                <span className="h-3 w-3 rounded-full bg-purple-400" />
                {repo.language || 'Unknown'}
            </span>

            <span className="flex items-center gap-1 text-gray-300">
                <Star size={14} />
                {repo.stargazers_count}
            </span>

            <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${repo.name} on GitHub`}
                className="text-gray-400 hover:text-white"
            >
                <ExternalLink size={16} />
            </a>
        </div>
    </article>
);

export default Repo;
