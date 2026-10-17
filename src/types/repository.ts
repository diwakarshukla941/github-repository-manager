export interface GitHubRepo {
    id: number;
    name: string;
    full_name: string;
    description: string | null;
    language: string | null;
    private: boolean;
    stargazers_count: number;
    html_url: string;
    owner: { login: string };
}