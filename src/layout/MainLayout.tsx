import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Dashboard from '../pages/Dashboard';
import { GitHubProvider } from '../context/GitHubContext';

const MainLayout = () => (
    <GitHubProvider>
        <div className="flex h-dvh flex-col overflow-hidden bg-[#0d1117]">
            <div className="z-50 shrink-0">
                <Navbar />
            </div>

            <div className="flex min-h-0 flex-1">
                <aside className="hidden w-60 shrink-0 md:block">
                    <Sidebar />
                </aside>

                <div className="min-w-0 flex-1 overflow-y-auto">
                    <Dashboard />
                </div>
            </div>
        </div>
    </GitHubProvider>
);

export default MainLayout;
