import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios', () => {
  const instance = { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }
  return { default: { create: vi.fn(() => instance) } }
})

const { createApplication, updateApplication, getApplications, deleteApplication } =
  await import('@/api/jobs')

const mockInstance = axios.create()

const validApp = {
  company: 'Acme',
  role: 'Engineer',
  status: 'Applied',
  workType: 'Onsite',
  location: 'NYC',
  date: '2026-01-01',
  notes: '',
}

describe('createApplication / updateApplication validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // validateRequest runs synchronously before the axios call, so invalid input throws
  // immediately rather than returning a rejected promise.
  it('rejects a non-Remote application with no location, without calling the API', () => {
    expect(() => createApplication({ ...validApp, workType: 'Onsite', location: '' })).toThrow(
      /location/i
    )
    expect(mockInstance.post).not.toHaveBeenCalled()
  })

  it('allows a Remote application with no location', async () => {
    mockInstance.post.mockResolvedValue({ data: { id: '1', company: 'Acme', role: 'Engineer' } })
    await createApplication({ ...validApp, workType: 'Remote', location: '' })
    expect(mockInstance.post).toHaveBeenCalledWith('/applications', expect.any(Object))
  })

  it('rejects when company is missing', () => {
    expect(() => createApplication({ ...validApp, company: '  ' })).toThrow(/company/i)
    expect(mockInstance.post).not.toHaveBeenCalled()
  })

  it('rejects an unknown status', () => {
    expect(() => createApplication({ ...validApp, status: 'Ghosted' })).toThrow(/invalid status/i)
  })

  it('updateApplication requires an id', () => {
    expect(() => updateApplication(undefined, validApp)).toThrow(/id is required/i)
    expect(mockInstance.put).not.toHaveBeenCalled()
  })
})

describe('getApplications', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects when the server does not return an array', async () => {
    mockInstance.get.mockResolvedValue({ data: { not: 'an array' } })
    await expect(getApplications()).rejects.toThrow(/expected an array/i)
  })

  it('resolves with the array on success', async () => {
    mockInstance.get.mockResolvedValue({ data: [{ id: '1' }] })
    await expect(getApplications()).resolves.toEqual([{ id: '1' }])
  })
})

describe('deleteApplication', () => {
  it('requires an id', () => {
    expect(() => deleteApplication()).toThrow(/id is required/i)
  })
})
