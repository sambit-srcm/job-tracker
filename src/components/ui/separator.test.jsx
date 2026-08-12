import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { Separator } from './separator'

describe('Separator', () => {
  it('renders horizontally by default', () => {
    const { container } = render(<Separator data-testid="sep" />)
    expect(container.firstChild).toHaveClass('w-full')
  })

  it('renders vertically when orientation is set to vertical', () => {
    const { container } = render(<Separator orientation="vertical" />)
    expect(container.firstChild).toHaveClass('h-full')
  })
})
