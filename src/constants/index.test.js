import { describe, it, expect } from 'vitest'
import { getEmptyForm, STATUSES, WORK_TYPES } from '@/constants'

describe('getEmptyForm', () => {
  it('returns a fresh object on every call, not a shared reference', () => {
    const a = getEmptyForm()
    const b = getEmptyForm()
    expect(a).not.toBe(b)
    a.company = 'mutated'
    expect(b.company).toBe('')
  })

  it("defaults date to today's date", () => {
    const today = new Date().toISOString().split('T')[0]
    expect(getEmptyForm().date).toBe(today)
  })

  it('defaults workType to Remote and location to empty', () => {
    const form = getEmptyForm()
    expect(form.workType).toBe('Remote')
    expect(form.location).toBe('')
  })
})

describe('STATUSES / WORK_TYPES', () => {
  it('are non-empty arrays of strings', () => {
    expect(STATUSES.length).toBeGreaterThan(0)
    expect(WORK_TYPES.length).toBeGreaterThan(0)
  })
})
