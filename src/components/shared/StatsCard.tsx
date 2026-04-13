interface StatsCardProps {
  label: string
  value: string
  icon: React.ReactNode
  iconColor: string
  iconBg: string
  trend?: {
    value: string
    positive: boolean
  }
}

export default function StatsCard({ label, value, icon, iconColor, iconBg, trend }: StatsCardProps) {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500 font-medium leading-tight">{label}</p>
        <div className={`p-2 rounded-lg ${iconBg} ${iconColor}`}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  )
}
