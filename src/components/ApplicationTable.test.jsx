import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApplicationTable } from './ApplicationTable'

const apps = [
  {
    id: '1',
    company: 'Zeta Corp',
    role: 'Backend Engineer',
    status: 'Applied',
    workType: 'Remote',
    location: '',
    date: '2026-01-05',
    notes: '',
  },
  {
    id: '2',
    company: 'Acme Inc',
    role: 'Frontend Engineer',
    status: 'Hired',
    workType: 'Onsite',
    location: 'NYC',
    date: '2026-01-10',
    notes: 'Great team',
  },
  {
    id: '3',
    company: 'Beta LLC',
    role: 'Fullstack Engineer',
    status: 'Interviewing',
    workType: 'Hybrid',
    location: 'SF',
    date: '2026-01-01',
    notes: '',
  },
]

const bodyRows = () => screen.getAllByRole('row').slice(1)
const companyOrder = () => bodyRows().map((r) => within(r).getAllByRole('cell')[0].textContent)

describe('ApplicationTable', () => {
  it('shows an empty-state message when there are no applications', () => {
    render(
      <ApplicationTable applications={[]} onEdit={vi.fn()} onDelete={vi.fn()} loading={false} />
    )
    expect(screen.getByText('No applications found')).toBeInTheDocument()
  })

  it('shows a loading message instead of the empty state while loading', () => {
    render(
      <ApplicationTable applications={[]} onEdit={vi.fn()} onDelete={vi.fn()} loading={true} />
    )
    expect(screen.getByText('Loading…')).toBeInTheDocument()
    expect(screen.queryByText('No applications found')).not.toBeInTheDocument()
  })

  it('defaults to sorting by date descending', () => {
    render(
      <ApplicationTable applications={apps} onEdit={vi.fn()} onDelete={vi.fn()} loading={false} />
    )
    expect(companyOrder()).toEqual(['Acme Inc', 'Zeta Corp', 'Beta LLC'])
  })

  it('toggles sort direction when the same column header is clicked again', async () => {
    const user = userEvent.setup()
    render(
      <ApplicationTable applications={apps} onEdit={vi.fn()} onDelete={vi.fn()} loading={false} />
    )

    await user.click(screen.getByRole('button', { name: /company/i }))
    expect(companyOrder()).toEqual(['Acme Inc', 'Beta LLC', 'Zeta Corp'])

    await user.click(screen.getByRole('button', { name: /company/i }))
    expect(companyOrder()).toEqual(['Zeta Corp', 'Beta LLC', 'Acme Inc'])

    await user.click(screen.getByRole('button', { name: /company/i }))
    expect(companyOrder()).toEqual(['Acme Inc', 'Beta LLC', 'Zeta Corp'])
  })

  it('filters by search text across company and role, case-insensitively', async () => {
    const user = userEvent.setup()
    render(
      <ApplicationTable applications={apps} onEdit={vi.fn()} onDelete={vi.fn()} loading={false} />
    )

    await user.type(screen.getByPlaceholderText('Search company or role…'), 'backend')

    expect(screen.getByText('Zeta Corp')).toBeInTheDocument()
    expect(screen.queryByText('Acme Inc')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 of 3 applications')).toBeInTheDocument()
  })

  it('filters by status via the status dropdown', async () => {
    const user = userEvent.setup()
    render(
      <ApplicationTable applications={apps} onEdit={vi.fn()} onDelete={vi.fn()} loading={false} />
    )

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Hired' }))

    expect(screen.getByText('Acme Inc')).toBeInTheDocument()
    expect(screen.queryByText('Zeta Corp')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 of 3 applications')).toBeInTheDocument()
  })

  it('shows singular wording in the footer count for a single result', async () => {
    render(
      <ApplicationTable
        applications={[apps[0]]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        loading={false}
      />
    )
    expect(screen.getByText('Showing 1 of 1 application')).toBeInTheDocument()
  })

  it('falls back to placeholders for missing date, notes, and location', () => {
    render(
      <ApplicationTable
        applications={[
          {
            id: '4',
            company: 'Gamma',
            role: 'DevOps',
            status: 'Rejected',
            workType: 'Onsite',
            location: '',
            date: '',
            notes: null,
          },
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        loading={false}
      />
    )
    expect(screen.getAllByText('—')).toHaveLength(2)
    expect(screen.getByText('Onsite')).toBeInTheDocument()
  })

  it('sorts a record missing the active sort field to the fallback value without crashing', () => {
    render(
      <ApplicationTable
        applications={[
          ...apps,
          {
            id: '5',
            company: 'Delta Co',
            role: 'SRE',
            status: 'Applied',
            workType: 'Remote',
            location: '',
          },
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        loading={false}
      />
    )
    expect(screen.getByText('Delta Co')).toBeInTheDocument()
  })

  it('treats equal values for the active sort field as unordered', async () => {
    const user = userEvent.setup()
    render(
      <ApplicationTable
        applications={[
          { ...apps[0], id: '6', company: 'Same Co' },
          { ...apps[1], id: '7', company: 'Same Co' },
        ]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        loading={false}
      />
    )

    await user.click(screen.getByRole('button', { name: /company/i }))
    expect(screen.getAllByText('Same Co')).toHaveLength(2)
  })

  it('calls onEdit with the full application when the edit button is clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()
    render(
      <ApplicationTable applications={apps} onEdit={onEdit} onDelete={vi.fn()} loading={false} />
    )

    await user.click(screen.getByRole('button', { name: 'Edit Acme Inc — Frontend Engineer' }))

    expect(onEdit).toHaveBeenCalledWith(apps[1])
  })

  it('cancelling the delete confirmation dialog does not call onDelete', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <ApplicationTable applications={apps} onEdit={vi.fn()} onDelete={onDelete} loading={false} />
    )

    await user.click(screen.getByRole('button', { name: 'Delete Acme Inc — Frontend Engineer' }))
    expect(await screen.findByText('Delete application?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(screen.queryByText('Delete application?')).not.toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('confirming the delete dialog calls onDelete with the target id', async () => {
    const user = userEvent.setup()
    const onDelete = vi.fn()
    render(
      <ApplicationTable applications={apps} onEdit={vi.fn()} onDelete={onDelete} loading={false} />
    )

    await user.click(screen.getByRole('button', { name: 'Delete Acme Inc — Frontend Engineer' }))
    expect(await screen.findByText('Delete application?')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledWith('2')
    expect(screen.queryByText('Delete application?')).not.toBeInTheDocument()
  })
})
