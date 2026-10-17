import { useState } from 'react';
import {
    LayoutDashboard,
    BookMarked,
    GitBranch,
} from 'lucide-react';

const Sidebar = () => {
    const [activeSection, setActiveSection] = useState<'dashboard' | 'repositories'>('dashboard');
    const navigateTo = (section: 'dashboard' | 'repositories') => {
        setActiveSection(section);
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    };
    const navigationClass = (section: 'dashboard' | 'repositories') =>
        `flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${activeSection === section
            ? 'bg-purple-500/10 text-purple-300'
            : 'text-gray-400 hover:bg-[#21262d] hover:text-white'}`;

    return (
    <aside className="flex h-full w-60 flex-col border-r border-[#30363d] bg-[#161b22] text-[#f0f6fc]">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-[#30363d] px-5">
            <div className="rounded-lg bg-purple-500/15 p-2 text-purple-400">
                <GitBranch size={22} />
            </div>

            <div>
                <h2 className="font-semibold">GitHub Manager</h2>
                <p className="text-xs text-gray-500">Repository workspace</p>
            </div>
        </div>

        <nav className="flex-1 space-y-2 p-3">
            <p className="px-3 py-2 text-xs uppercase tracking-wider text-gray-500">
                Workspace
            </p>

            <button type="button" onClick={() => navigateTo('dashboard')} aria-current={activeSection === 'dashboard' ? 'location' : undefined} className={navigationClass('dashboard')}>
                <LayoutDashboard size={18} />
                Dashboard
            </button>

            <button
                type="button"
                onClick={() => navigateTo('repositories')}
                aria-current={activeSection === 'repositories' ? 'location' : undefined}
                className={navigationClass('repositories')}
            >
                <BookMarked size={18} />
                Repositories
            </button>

        </nav>

        <div className="shrink-0 border-t border-[#30363d] p-4">
            <p className="truncate text-sm font-medium">Personal Workspace</p>
            <p className="text-xs text-gray-500">Local application</p>
        </div>
    </aside>
    );
};

export default Sidebar;
