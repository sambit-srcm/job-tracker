import { useState } from 'react'
import { StatusBadge } from '@/components/StatusBadge'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Search, ChevronUp, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { STATUSES } from '@/constants'

// Column header button that shows the active sort field and direction
function SortButton({ label, field, sort, onSort }) {
  const active = sort.field === field
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
    >
      {label}
      {active ? (
        sort.dir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      ) : (
        <ChevronDown className="h-3 w-3 opacity-30" />
      )}
    </button>
  )
}

// Searchable, filterable, sortable table of all job applications
export function ApplicationTable({ applications, onEdit, onDelete, loading }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [sort, setSort] = useState({ field: 'date', dir: 'desc' })

  // Toggle direction if already sorted by this field, otherwise sort asc
  const handleSort = (field) => {
    setSort(s => s.field === field ? { field, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { field, dir: 'asc' })
  }

  // Apply search, status filter, and sort to the applications list
  const filtered = applications
    .filter(a => {
      const q = search.toLowerCase()
      const matchSearch = !q || a.company.toLowerCase().includes(q) || a.role.toLowerCase().includes(q)
      const matchStatus = filterStatus === 'All' || a.status === filterStatus
      return matchSearch && matchStatus
    })
    .sort((a, b) => {
      const val = (x) => x[sort.field] ?? ''
      const cmp = val(a) < val(b) ? -1 : val(a) > val(b) ? 1 : 0
      return sort.dir === 'asc' ? cmp : -cmp
    })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search company or role…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-40 border-gray-300 bg-white text-gray-900">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white text-gray-900">
            <SelectItem value="All">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left w-36">
                  <SortButton label="Company" field="company" sort={sort} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left w-44">
                  <SortButton label="Role" field="role" sort={sort} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left w-32">
                  <SortButton label="Status" field="status" sort={sort} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left w-28 hidden md:table-cell">
                  <span className="text-xs font-medium text-gray-500">Location</span>
                </th>
                <th className="px-4 py-3 text-left w-28 hidden lg:table-cell">
                  <SortButton label="Date" field="date" sort={sort} onSort={handleSort} />
                </th>
                <th className="px-4 py-3 text-left hidden xl:table-cell">
                  <span className="text-xs font-medium text-gray-500">Notes</span>
                </th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    {loading ? 'Loading…' : 'No applications found'}
                  </td>
                </tr>
              ) : (
                filtered.map((app, i) => (
                  <tr
                    key={app.id}
                    className={`border-b border-gray-100 transition-colors hover:bg-gray-50 ${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-3 font-semibold text-gray-900">{app.company}</td>
                    <td className="px-4 py-3 text-gray-600 min-w-[160px]">
                      <span className="block break-words">{app.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-gray-500 text-xs">
                        {app.workType === 'Remote' ? 'Remote' : app.location || app.workType}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">
                      {app.date ? new Date(app.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-gray-500 min-w-[200px]">
                      <span className="block break-words text-xs whitespace-pre-wrap">{app.notes || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {/* Load this row into the form for editing */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(app)}
                          className="h-8 w-8 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {/* Delete with confirmation dialog */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="border-gray-200 bg-white text-gray-900">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete application?</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-500">
                                This will permanently remove <strong className="text-gray-800">{app.company} — {app.role}</strong>. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-gray-300 text-white hover:bg-gray-100">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(app.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer count reflects current filter state */}
      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 text-right">
          Showing {filtered.length} of {applications.length} application{applications.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
