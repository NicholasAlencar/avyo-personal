import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { ScrollToTop } from './ScrollToTop'

test('restores the viewport when a route is entered', () => {
  const scrollTo = vi.fn()
  Object.defineProperty(window, 'scrollTo', { value: scrollTo, configurable: true })
  render(<MemoryRouter initialEntries={['/transacoes']}><ScrollToTop /></MemoryRouter>)
  expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' })
})
