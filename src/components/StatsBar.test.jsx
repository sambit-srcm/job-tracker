import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatsBar } from './StatsBar'

describe('StatsBar', () => {
  it('shows a zero count for every status when there are no applications', () => {
    render(<StatsBar applications={[]} />)
    expect(screen.getAllByText('0')).toHaveLength(4)
  })

  it('tallies applications per status', () => {
    render(
      <StatsBar
        applications={[
          { status: 'Applied' },
          { status: 'Applied' },
          { status: 'Interviewing' },
          { status: 'Hired' },
        ]}
      />
    )
    expect(screen.getByText('Applied').previousSibling).toHaveTextContent('2')
    expect(screen.getByText('Interviewing').previousSibling).toHaveTextContent('1')
    expect(screen.getByText('Hired').previousSibling).toHaveTextContent('1')
    expect(screen.getByText('Rejected').previousSibling).toHaveTextContent('0')
  })
})
