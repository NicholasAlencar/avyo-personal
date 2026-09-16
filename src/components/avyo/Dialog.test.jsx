import { useState } from 'react'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, test, vi } from 'vitest'
import { ConfirmDialog } from './ConfirmDialog'
import { AiDisclosure } from './AiDisclosure'
import { EmptyState } from './EmptyState'
import { RecordDialog } from './RecordDialog'

afterEach(cleanup)

test('hydrates edit fields, labels the dialog and focuses the first field', async () => {
  render(<RecordDialog open title="Editar conta" initial={{ name: 'Conta' }} fields={[{ name: 'name', label: 'Nome' }]} onSave={vi.fn()} onClose={vi.fn()} />)

  expect(screen.getByRole('dialog', { name: 'Editar conta' })).toBeVisible()
  expect(screen.getByLabelText('Nome')).toHaveValue('Conta')
  await waitFor(() => expect(screen.getByLabelText('Nome')).toHaveFocus())
})

test('closes a record dialog with Escape and restores focus to its trigger', async () => {
  const user = userEvent.setup()
  function Harness() {
    const [open, setOpen] = useState(false)
    return <><button onClick={() => setOpen(true)}>Editar conta</button><RecordDialog open={open} title="Editar" fields={[{ name: 'name', label: 'Nome' }]} onSave={vi.fn()} onClose={() => setOpen(false)} /></>
  }
  render(<Harness />)

  const trigger = screen.getByRole('button', { name: 'Editar conta' })
  await user.click(trigger)
  await user.keyboard('{Escape}')

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})

test('keeps confirmation keyboard-safe and restores focus after cancelling', async () => {
  const user = userEvent.setup()
  const onConfirm = vi.fn()
  function Harness() {
    const [open, setOpen] = useState(false)
    return <><button onClick={() => setOpen(true)}>Excluir conta</button><ConfirmDialog open={open} title="Excluir conta?" description="Esta ação não pode ser desfeita." onConfirm={onConfirm} onClose={() => setOpen(false)} /></>
  }
  render(<Harness />)

  const trigger = screen.getByRole('button', { name: 'Excluir conta' })
  await user.click(trigger)
  expect(screen.getByRole('dialog', { name: 'Excluir conta?' })).toBeVisible()
  await waitFor(() => expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus())
  await user.keyboard('{Escape}')

  expect(onConfirm).not.toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})

test('renders a reusable empty state with its action', async () => {
  const user = userEvent.setup()
  const onCreate = vi.fn()
  render(<EmptyState title="Nenhuma conta" description="Cadastre sua primeira conta." action={<button onClick={onCreate}>Nova conta</button>} />)

  expect(screen.getByRole('heading', { name: 'Nenhuma conta' })).toBeVisible()
  expect(screen.getByText('Cadastre sua primeira conta.')).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Nova conta' }))
  expect(onCreate).toHaveBeenCalledOnce()
})

test('requires explicit consent before using Base44', async () => {
  const user = userEvent.setup()
  const onAccept = vi.fn()
  render(<AiDisclosure accepted={false} onAccept={onAccept} />)

  expect(screen.getByText(/dados financeiros resumidos.*Base44/i)).toBeVisible()
  await user.click(screen.getByRole('button', { name: /entendi e aceito/i }))
  expect(onAccept).toHaveBeenCalledOnce()
})
