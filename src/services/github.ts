import type { GitHubRepo } from '../types/repository';

const API_URL = 'https://api.github.com';

async function githubRequest<T>(
    token: string,
    path: string,
    options: RequestInit = {},
    onResponse?: (response: Response) => void
): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            ...options.headers,
        },
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid or expired GitHub token.');
        }

        if (response.status === 403) {
            throw new Error('Access denied. Check token permissions or rate limits.');
        }

        throw new Error(`GitHub API error: ${response.status}`);
    }

    onResponse?.(response);
    if (response.status === 204) return undefined as T;

    return response.json() as Promise<T>;
}

export async function getGitHubUser(token: string) {
    const access: { scopes: string | null } = { scopes: null };
    const user = await githubRequest<{
        login: string;
        avatar_url: string;
        owned_private_repos?: number;
    }>(
        token,
        '/user',
        {},
        (response) => { access.scopes = response.headers.get('X-OAuth-Scopes'); }
    );
    return { ...user, scopes: access.scopes };
}

export function getRepositoryAccessWarning(
    user: Awaited<ReturnType<typeof getGitHubUser>>,
    repos: GitHubRepo[]
): string {
    const visiblePrivate = repos.filter((repo) => repo.private &&
        repo.owner.login.toLowerCase() === user.login.toLowerCase()).length;
    const missingScope = user.scopes !== null &&
        !user.scopes.split(',').some((scope) => scope.trim() === 'repo');
    const missingRepos = typeof user.owned_private_repos === 'number' &&
        visiblePrivate < user.owned_private_repos;
    if (!missingScope && !missingRepos) return '';
    const detail = missingRepos
        ? `GitHub reports ${user.owned_private_repos} private repositories you own, but this token can see only ${visiblePrivate}. `
        : 'This token does not have the classic repo scope required to list private repositories. ';
    return detail + 'For a classic token, enable repo. For a fine-grained token, choose the correct resource owner and grant access to all repositories or select the missing private repositories. Then disconnect and reconnect with the updated token.';
}

export async function getRepositories(
    token: string
): Promise<GitHubRepo[]> {
    const allRepos: GitHubRepo[] = [];
    let page = 1;

    while (true) {
        const repos = await githubRequest<GitHubRepo[]>(
            token,
            `/user/repos?visibility=all&affiliation=owner&sort=updated&per_page=100&page=${page}`
        );

        allRepos.push(...repos);

        if (repos.length < 100) break;
        page++;
    }

    return allRepos;
}

export async function deleteRepository(
    token: string,
    owner: string,
    repo: string
): Promise<void> {
    const response = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
        {
            method: 'DELETE',
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${token}`,
                'X-GitHub-Api-Version': '2022-11-28',
            },
        }
    );

    if (response.status === 204) {
        return;
    }

    const error = await response.json().catch(() => null);
    const detail = error?.message || 'GitHub rejected the deletion request.';
    if (response.status === 401) {
        throw new Error('Your token is invalid or expired. Disconnect and reconnect with a valid token.');
    }
    if (response.status === 403 && response.headers.get('X-RateLimit-Remaining') === '0') {
        throw new Error('GitHub API rate limit reached. Wait for the limit to reset before retrying.');
    }
    if (response.status === 403 || response.status === 404) {
        throw new Error(`${detail} (${response.status}). Deletion requires repository admin access and a fine-grained token with Administration: Read and write, or a classic token with delete_repo. Ensure this repository is included in the token's access; organization policies may also prevent deletion.`);
    }
    throw new Error(`${detail} (${response.status})`);
}
