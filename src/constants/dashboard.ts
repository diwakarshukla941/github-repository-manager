import { Archive, FolderGit2, Globe, LockKeyhole } from "lucide-react";
import type { StatCardProps } from "../types/dashboard";

export const stats:StatCardProps[] = [
        {
            title: 'Total Repositories',
            count: 0,
            description: 'All repositories you own',
            Icon: FolderGit2,
        },
        {
            title: 'Public Repositories',
            count: 0,
            description: 'Visible to everyone',
            Icon: Globe,
        },
        {
            title: 'Private Repositories',
            count: 0,
            description: 'Access-restricted projects',
            Icon: LockKeyhole,
        },
        {
            title: 'Archived Repositories',
            count: 0,
            description: 'Read-only repositories',
            Icon: Archive,
        },
    ]
