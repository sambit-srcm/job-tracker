import { STATS } from '@/constants'

// Renders four stat tiles showing a live count per application status
export function StatsBar({ applications }) {
  // Tally applications by status into a { status: count } map
  const counts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATS.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
        >
          <div className={`rounded-lg p-2 ${bg}`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{counts[key] ?? 0}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
