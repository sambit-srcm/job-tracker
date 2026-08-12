import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from '@/api/jobs'

vi.mock('@/api/jobs', () => ({
  getApplications: vi.fn(),
  createApplication: vi.fn(),
  updateApplication: vi.fn(),
  deleteApplication: vi.fn(),
}))

const app = {
  id: '1',
  company: 'Acme',
  role: 'Engineer',
  status: 'Applied',
  workType: 'Remote',
  location: '',
  date: '2026-01-01',
  notes: '',
}

const app2 = { ...app, id: '2', company: 'Globex', role: 'Designer' }

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads applications on mount and renders them in the table', async () => {
    getApplications.mockResolvedValue([app])
    render(<App />)

    expect(await screen.findByText('Acme')).toBeInTheDocument()
    expect(getApplications).toHaveBeenCalledTimes(1)
  })

  it('shows an error banner with a retry button when loading fails', async () => {
    getApplications.mockRejectedValueOnce(new Error('network down'))
    const user = userEvent.setup()
    render(<App />)

    expect(await screen.findByText('Cannot reach the API server')).toBeInTheDocument()

    getApplications.mockResolvedValueOnce([app])
    await user.click(screen.getByRole('button', { name: 'Retry loading applications' }))

    await waitFor(() => expect(getApplications).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('Acme')).toBeInTheDocument()
    expect(screen.queryByText('Cannot reach the API server')).not.toBeInTheDocument()
  })

  it('creates a new application and adds it to the table', async () => {
    getApplications.mockResolvedValue([])
    createApplication.mockResolvedValue(app)
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(getApplications).toHaveBeenCalledTimes(1))

    await user.type(screen.getByPlaceholderText('e.g. Stripe'), 'Acme')
    await user.type(screen.getByPlaceholderText('e.g. Senior Engineer'), 'Engineer')
    await user.click(screen.getByRole('button', { name: /add application/i }))

    await waitFor(() => expect(createApplication).toHaveBeenCalledTimes(1))
    expect(await screen.findByText('Acme')).toBeInTheDocument()
  })

  it('shows an error message when saving a new application fails', async () => {
    getApplications.mockResolvedValue([])
    createApplication.mockRejectedValue(new Error('server error'))
    const user = userEvent.setup()
    render(<App />)

    await waitFor(() => expect(getApplications).toHaveBeenCalledTimes(1))

    await user.type(screen.getByPlaceholderText('e.g. Stripe'), 'Acme')
    await user.type(screen.getByPlaceholderText('e.g. Senior Engineer'), 'Engineer')
    await user.click(screen.getByRole('button', { name: /add application/i }))

    expect(await screen.findByText('Failed to save. Please try again.')).toBeInTheDocument()
  })

  it('switches to edit mode, updates an application, and exits edit mode on success', async () => {
    const updated = { ...app, company: 'Acme Updated' }
    getApplications.mockResolvedValue([app, app2])
    updateApplication.mockResolvedValue(updated)
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Edit Acme — Engineer' }))

    expect(screen.getByText('Editing: Acme')).toBeInTheDocument()

    const companyInput = screen.getByPlaceholderText('e.g. Stripe')
    await user.clear(companyInput)
    await user.type(companyInput, 'Acme Updated')
    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() =>
      expect(updateApplication).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ company: 'Acme Updated' })
      )
    )
    expect(await screen.findByText('Acme Updated')).toBeInTheDocument()
    expect(screen.getByText('New Application')).toBeInTheDocument()
  })

  it('cancelling edit mode clears the edit target', async () => {
    getApplications.mockResolvedValue([app])
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Edit Acme — Engineer' }))
    expect(screen.getByText('Editing: Acme')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel editing' }))
    expect(screen.getByText('New Application')).toBeInTheDocument()
  })

  it('deletes an application after confirming the dialog', async () => {
    getApplications.mockResolvedValue([app])
    deleteApplication.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Delete Acme — Engineer' }))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteApplication).toHaveBeenCalledWith('1'))
    await waitFor(() => expect(screen.queryByText('Acme')).not.toBeInTheDocument())
  })

  it('clears the edit target when deleting the application currently being edited', async () => {
    getApplications.mockResolvedValue([app])
    deleteApplication.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Edit Acme — Engineer' }))
    expect(screen.getByText('Editing: Acme')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Acme — Engineer' }))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteApplication).toHaveBeenCalledWith('1'))
    expect(screen.getByText('New Application')).toBeInTheDocument()
  })

  it('shows an error message when deleting fails', async () => {
    getApplications.mockResolvedValue([app])
    deleteApplication.mockRejectedValue(new Error('server error'))
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: 'Delete Acme — Engineer' }))
    await user.click(await screen.findByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Failed to delete. Please try again.')).toBeInTheDocument()
  })
})
