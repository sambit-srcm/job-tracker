import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApplicationForm } from './ApplicationForm'

const fillRequired = async (user, { company = 'Acme', role = 'Engineer' } = {}) => {
  await user.type(screen.getByPlaceholderText('e.g. Stripe'), company)
  await user.type(screen.getByPlaceholderText('e.g. Senior Engineer'), role)
}

describe('ApplicationForm', () => {
  it('shows inline errors and does not call onSubmit when required fields are missing', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<ApplicationForm onSubmit={onSubmit} onCancel={() => {}} loading={false} />)

    await user.click(screen.getByRole('button', { name: /add application/i }))

    expect(await screen.findByText('Company is required')).toBeInTheDocument()
    expect(screen.getByText('Role is required')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('requires location when editing an application with a non-Remote work type', () => {
    render(
      <ApplicationForm
        editTarget={{
          id: '1',
          company: 'Acme',
          role: 'Engineer',
          status: 'Applied',
          workType: 'Onsite',
          location: '',
          date: '2026-01-01',
          notes: '',
        }}
        onSubmit={vi.fn()}
        onCancel={() => {}}
        loading={false}
      />
    )

    expect(screen.getByText('Location *')).toBeInTheDocument()
  })

  it('does not show the location field when work type is Remote (the default)', () => {
    render(<ApplicationForm onSubmit={vi.fn()} onCancel={() => {}} loading={false} />)
    expect(screen.queryByText('Location *')).not.toBeInTheDocument()
  })

  it('calls onSubmit with the filled-in data for a valid Remote application', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ApplicationForm onSubmit={onSubmit} onCancel={() => {}} loading={false} />)

    await fillRequired(user)
    await user.click(screen.getByRole('button', { name: /add application/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      company: 'Acme',
      role: 'Engineer',
      workType: 'Remote',
    })
  })

  it('keeps the entered data in the form when onSubmit rejects (failed save)', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new Error('network error'))
    render(<ApplicationForm onSubmit={onSubmit} onCancel={() => {}} loading={false} />)

    await fillRequired(user, { company: 'Should Persist' })
    await user.click(screen.getByRole('button', { name: /add application/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(screen.getByPlaceholderText('e.g. Stripe')).toHaveValue('Should Persist')
  })

  it('clears the form after a successful submit for a new application', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ApplicationForm onSubmit={onSubmit} onCancel={() => {}} loading={false} />)

    await fillRequired(user)
    await user.click(screen.getByRole('button', { name: /add application/i }))

    await waitFor(() => expect(screen.getByPlaceholderText('e.g. Stripe')).toHaveValue(''))
  })
})
