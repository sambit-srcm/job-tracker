import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

  it('clears a field error as soon as the user edits that field', async () => {
    const user = userEvent.setup()
    render(<ApplicationForm onSubmit={vi.fn()} onCancel={() => {}} loading={false} />)

    await user.click(screen.getByRole('button', { name: /add application/i }))
    expect(await screen.findByText('Company is required')).toBeInTheDocument()

    await user.type(screen.getByPlaceholderText('e.g. Stripe'), 'A')
    expect(screen.queryByText('Company is required')).not.toBeInTheDocument()
  })

  it('changes status and work type via the select dropdowns', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<ApplicationForm onSubmit={onSubmit} onCancel={() => {}} loading={false} />)

    const [statusTrigger, workTypeTrigger] = screen.getAllByRole('combobox')
    await user.click(statusTrigger)
    await user.click(await screen.findByRole('option', { name: 'Interviewing' }))
    expect(statusTrigger).toHaveTextContent('Interviewing')

    await user.click(workTypeTrigger)
    await user.click(await screen.findByRole('option', { name: 'Onsite' }))
    expect(screen.getByText('Location *')).toBeInTheDocument()

    await fillRequired(user)
    await user.type(screen.getByPlaceholderText('e.g. San Francisco, CA'), 'SF')
    await user.click(screen.getByRole('button', { name: /add application/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      status: 'Interviewing',
      workType: 'Onsite',
      location: 'SF',
    })
  })

  it('clears location when switching work type from a non-Remote value back to Remote', async () => {
    const user = userEvent.setup()
    render(
      <ApplicationForm
        editTarget={{
          id: '1',
          company: 'Acme',
          role: 'Engineer',
          status: 'Applied',
          workType: 'Onsite',
          location: 'NYC',
          date: '2026-01-01',
          notes: '',
        }}
        onSubmit={vi.fn()}
        onCancel={() => {}}
        loading={false}
      />
    )

    expect(screen.getByText('Location *')).toBeInTheDocument()

    const [, workTypeTrigger] = screen.getAllByRole('combobox')
    await user.click(workTypeTrigger)
    await user.click(await screen.findByRole('option', { name: 'Remote' }))

    expect(screen.queryByText('Location *')).not.toBeInTheDocument()
  })

  it('changes the date field', () => {
    render(<ApplicationForm onSubmit={vi.fn()} onCancel={() => {}} loading={false} />)

    const dateInput = screen.getByLabelText('Date Applied *')
    fireEvent.change(dateInput, { target: { value: '2026-02-02' } })
    expect(dateInput).toHaveValue('2026-02-02')
  })

  it('types into the notes field', async () => {
    const user = userEvent.setup()
    render(<ApplicationForm onSubmit={vi.fn()} onCancel={() => {}} loading={false} />)

    await user.type(
      screen.getByPlaceholderText('Interview stage, contacts, links…'),
      'Referred by Sam'
    )
    expect(screen.getByPlaceholderText('Interview stage, contacts, links…')).toHaveValue(
      'Referred by Sam'
    )
  })

  it('shows a location error on submit when work type is not Remote and location is blank', async () => {
    const user = userEvent.setup()
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

    await user.click(screen.getByRole('button', { name: /update/i }))
    expect(await screen.findByText('Location is required')).toBeInTheDocument()
  })

  it('does not crash on submit when a legacy record has no location field at all', async () => {
    const user = userEvent.setup()
    render(
      <ApplicationForm
        editTarget={{
          id: '1',
          company: 'Acme',
          role: 'Engineer',
          status: 'Applied',
          workType: 'Onsite',
          date: '2026-01-01',
          notes: '',
        }}
        onSubmit={vi.fn()}
        onCancel={() => {}}
        loading={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /update/i }))
    expect(await screen.findByText('Location is required')).toBeInTheDocument()
  })

  it('shows a date error on submit when the date is blank', async () => {
    const user = userEvent.setup()
    render(
      <ApplicationForm
        editTarget={{
          id: '1',
          company: 'Acme',
          role: 'Engineer',
          status: 'Applied',
          workType: 'Remote',
          location: '',
          date: '',
          notes: '',
        }}
        onSubmit={vi.fn()}
        onCancel={() => {}}
        loading={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /update/i }))
    expect(await screen.findByText('Date is required')).toBeInTheDocument()
  })
})
