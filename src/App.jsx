import { useEffect, useState, useCallback } from 'react'
import { ApplicationForm } from '@/components/ApplicationForm'
import { ApplicationTable } from '@/components/ApplicationTable'
import { StatsBar } from '@/components/StatsBar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '@/api/jobs'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function App() {
  const [applications, setApplications] = useState([])
  const [editTarget, setEditTarget] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all applications from the API and populate state
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getApplications()
      setApplications(data)
    } catch (err) {
      console.error('Failed to load applications:', err)
      setError('Cannot reach the API server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Fetch on mount; this is a genuine external-system sync, not derived state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  // Handle both create and update depending on whether an edit target is set.
  // Rethrows on failure so ApplicationForm knows not to clear the user's input.
  const handleSubmit = async (form) => {
    setLoading(true)
    try {
      if (editTarget) {
        const updated = await updateApplication(editTarget.id, { ...form, id: editTarget.id })
        setApplications((prev) => prev.map((a) => (a.id === editTarget.id ? updated : a)))
        setEditTarget(null)
      } else {
        const created = await createApplication(form)
        setApplications((prev) => [...prev, created])
      }
    } catch (err) {
      console.error('Failed to save application:', err)
      setError('Failed to save. Please try again.')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Remove the application from the API and optimistically update local state
  const handleDelete = async (id) => {
    setLoading(true)
    try {
      await deleteApplication(id)
      setApplications((prev) => prev.filter((a) => a.id !== id))
      if (editTarget?.id === id) setEditTarget(null)
    } catch (err) {
      console.error('Failed to delete application:', err)
      setError('Failed to delete. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Job Tracker</h1>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-sm">{error}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={load}
              className="h-7 px-2 text-red-600 hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6">
          <StatsBar applications={applications} />
        </div>

        {/* Main layout */}
        <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
          {/* Form panel */}
          <Card className="border-gray-200 bg-white h-fit lg:sticky lg:top-8">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-gray-900">
                {editTarget ? `Editing: ${editTarget.company}` : 'New Application'}
              </CardTitle>
              <CardDescription className="text-gray-500">
                {editTarget ? 'Update the details below and save' : 'Track a new job application'}
              </CardDescription>
            </CardHeader>
            <Separator className="bg-gray-200 mb-4" />
            <CardContent>
              <ApplicationForm
                editTarget={editTarget}
                onSubmit={handleSubmit}
                onCancel={() => setEditTarget(null)}
                loading={loading}
              />
            </CardContent>
          </Card>

          {/* Table panel */}
          <div className="min-w-0">
            <ApplicationTable
              applications={applications}
              onEdit={setEditTarget}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
