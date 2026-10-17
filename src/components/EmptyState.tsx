import { SearchX } from 'lucide-react'

const EmptyState = () => {
    return (
        <div className='border mt-10 border-gray-400 flex flex-col justify-center items-center gap-4 h-50 px-2 py-5'>
            <SearchX color='gray' />
            <h3 className='text-2xl font-bold'>No repositories found</h3>
            <p>Try another repository name or check your spelling.</p>
        </div>
    )
}

export default EmptyState