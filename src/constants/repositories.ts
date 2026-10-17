interface repository {
    id: number;
    name: string;
    description: string;
    language: string;
    visibility: 'Public' | 'Private';
    stars: number;
}

export const repositories: repository[] = [
    {
        id: 1,
        name: 'github-manager',
        description: 'Manage and organize GitHub repositories from one dashboard.',
        language: 'TypeScript',
        visibility: 'Public',
        stars: 24,
    },
    {
        id: 2,
        name: 'expense-tracker',
        description: 'Track daily expenses and visualize spending.',
        language: 'JavaScript',
        visibility: 'Private',
        stars: 12,
    },
    {
        id: 3,
        name: 'portfolio-website',
        description: 'A personal developer portfolio showcasing projects and skills.',
        language: 'TypeScript',
        visibility: 'Public',
        stars: 38,
    },
    {
        id: 4,
        name: 'go-api-server',
        description: 'A REST API built with Go, authentication, and CRUD operations.',
        language: 'Go',
        visibility: 'Private',
        stars: 8,
    },
    {
        id: 5,
        name: 'ecommerce-backend',
        description: 'Backend services for products, orders, payments, and users.',
        language: 'JavaScript',
        visibility: 'Public',
        stars: 56,
    },
    {
        id: 6,
        name: 'task-management-app',
        description: 'Manage projects, tasks, and team collaboration.',
        language: 'TypeScript',
        visibility: 'Private',
        stars: 17,
    },
]
