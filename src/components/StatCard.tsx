import type { StatCardProps } from '../types/dashboard'

const StatCard = ({ title, count, description, Icon }:StatCardProps) => {
    return (
        <div
            className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 transition-all duration-200 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/5"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-[#8b949e]">
                        {title}
                    </p>

                    <h3 className="mt-3 text-3xl font-semibold text-[#f0f6fc]">
                        {count}
                    </h3>
                </div>

                <div className="rounded-lg bg-purple-500/10 p-3">
                    <Icon
                        size={24}
                        strokeWidth={1.8}
                        className="text-purple-400"
                    />
                </div>
            </div>

            <p className="mt-4 text-sm text-[#8b949e]">
                {description}
            </p>
        </div>
    )
}

export default StatCard