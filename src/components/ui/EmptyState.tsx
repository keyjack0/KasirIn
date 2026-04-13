import { RiInboxLine } from 'react-icons/ri'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-gray-300 mb-3">
        {icon || <RiInboxLine className="w-12 h-12" />}
      </div>
      <p className="text-gray-600 font-medium mb-1">{title}</p>
      {description && (
        <p className="text-gray-400 text-sm max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
