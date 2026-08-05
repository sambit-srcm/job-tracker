import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'
import { STATUSES } from '@/constants'

describe('StatusBadge', () => {
  it.each(STATUSES)('renders the %s status label', (status) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('falls back to the Applied style for an unrecognized status', () => {
    render(<StatusBadge status="SomethingUnknown" />)
    expect(screen.getByText('SomethingUnknown')).toBeInTheDocument()
  })
})
