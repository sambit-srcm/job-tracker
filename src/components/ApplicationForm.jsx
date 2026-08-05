import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STATUSES, WORK_TYPES, getEmptyForm } from '@/constants'
import { PlusCircle, Save, X } from 'lucide-react'

// Form for creating a new application or editing an existing one
export function ApplicationForm({ editTarget, onSubmit, onCancel, loading }) {
  const [prevEditTarget, setPrevEditTarget] = useState(editTarget)
  const [form, setForm] = useState(editTarget ? { ...editTarget } : getEmptyForm())
  const [errors, setErrors] = useState({})

  // Pre-fill the form when an edit target is selected (adjusted during render, not in an effect)
  if (editTarget !== prevEditTarget) {
    setPrevEditTarget(editTarget)
    setForm(editTarget ? { ...editTarget } : getEmptyForm())
    setErrors({})
  }

  // Generic field setter; clears the error for that field on change.
  // Switching to Remote clears location, since it's not shown/relevant for remote roles.
  const set = (k, v) => {
    setForm((f) => ({
      ...f,
      [k]: v,
      ...(k === 'workType' && v === 'Remote' ? { location: '' } : {}),
    }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }))
  }

  // Validate required fields and return an errors object
  const validate = () => {
    const e = {}
    if (!form.company.trim()) e.company = 'Company is required'
    if (!form.role.trim()) e.role = 'Role is required'
    if (!form.date) e.date = 'Date is required'
    if (form.workType !== 'Remote' && !form.location.trim()) e.location = 'Location is required'
    return e
  }

  // Show inline errors on invalid submit; otherwise pass form up and only reset on success
  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) {
      setErrors(e2)
      return
    }
    try {
      await onSubmit(form)
    } catch {
      // Save failed — parent already surfaced the error; keep the user's input intact
      return
    }
    if (!editTarget) {
      setForm(getEmptyForm())
      setErrors({})
    }
  }

  const isEditing = !!editTarget

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="company" className="text-gray-700">
            Company *
          </Label>
          <Input
            id="company"
            placeholder="e.g. Stripe"
            value={form.company}
            onChange={(e) => set('company', e.target.value)}
            className={`bg-white text-gray-900 placeholder:text-gray-400 ${errors.company ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-300'}`}
          />
          {errors.company && <p className="text-xs text-red-500">{errors.company}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-gray-700">
            Role *
          </Label>
          <Input
            id="role"
            placeholder="e.g. Senior Engineer"
            value={form.role}
            onChange={(e) => set('role', e.target.value)}
            className={`bg-white text-gray-900 placeholder:text-gray-400 ${errors.role ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-300'}`}
          />
          {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-gray-700">Status</Label>
          <Select value={form.status} onValueChange={(v) => set('status', v)}>
            <SelectTrigger className="border-gray-300 bg-white text-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-700">Work Type</Label>
          <Select value={form.workType} onValueChange={(v) => set('workType', v)}>
            <SelectTrigger className="border-gray-300 bg-white text-gray-900">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              {WORK_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Location field is only relevant for non-remote positions */}
        {form.workType !== 'Remote' && (
          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-gray-700">
              Location *
            </Label>
            <Input
              id="location"
              placeholder="e.g. San Francisco, CA"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              className={`bg-white text-gray-900 placeholder:text-gray-400 ${errors.location ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-300'}`}
            />
            {errors.location && <p className="text-xs text-red-500">{errors.location}</p>}
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-gray-700">
            Date Applied *
          </Label>
          <Input
            id="date"
            type="date"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
            className={`bg-white text-gray-900 ${errors.date ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-300'}`}
          />
          {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-gray-700">
          Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Interview stage, contacts, links…"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Update
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Application
            </>
          )}
        </Button>
        {/* Cancel button only shown in edit mode */}
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  )
}
