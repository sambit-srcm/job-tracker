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

  it('rejects when role is missing', () => {
    expect(() => createApplication({ ...validApp, role: '  ' })).toThrow(/role/i)
  })

  it('rejects when date is missing', () => {
    expect(() => createApplication({ ...validApp, date: '' })).toThrow(/date/i)
  })

  it('rejects an unknown work type', () => {
    expect(() => createApplication({ ...validApp, workType: 'Space' })).toThrow(
      /invalid work type/i
    )
  })

  it('rejects a response missing required fields', async () => {
    mockInstance.post.mockResolvedValue({ data: null })
    await expect(createApplication(validApp)).rejects.toThrow(/invalid response/i)

    mockInstance.post.mockResolvedValue({ data: { company: 'Acme', role: 'Engineer' } })
    await expect(createApplication(validApp)).rejects.toThrow(/missing id/i)

    mockInstance.post.mockResolvedValue({ data: { id: '1', role: 'Engineer' } })
    await expect(createApplication(validApp)).rejects.toThrow(/missing company/i)

    mockInstance.post.mockResolvedValue({ data: { id: '1', company: 'Acme' } })
    await expect(createApplication(validApp)).rejects.toThrow(/missing role/i)
  })

  it('updateApplication requires an id', () => {
    expect(() => updateApplication(undefined, validApp)).toThrow(/id is required/i)
    expect(mockInstance.put).not.toHaveBeenCalled()
  })

  it('updateApplication resolves with the validated response on success', async () => {
    mockInstance.put.mockResolvedValue({ data: { id: '1', company: 'Acme', role: 'Engineer' } })
    await expect(updateApplication('1', validApp)).resolves.toEqual({
      id: '1',
      company: 'Acme',
      role: 'Engineer',
    })
    expect(mockInstance.put).toHaveBeenCalledWith('/applications/1', validApp)
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

  it('calls the delete endpoint when an id is given', async () => {
    mockInstance.delete.mockResolvedValue({ data: {} })
    await deleteApplication('1')
    expect(mockInstance.delete).toHaveBeenCalledWith('/applications/1')
  })
})
