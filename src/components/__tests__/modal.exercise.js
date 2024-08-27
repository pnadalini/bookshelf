import * as React from 'react'
import {render, screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Modal, ModalOpenButton, ModalContents} from '../modal'

test('can be opened and closed', async () => {
  const ariaLabel = 'label'
  const title = 'Title'
  const content = 'Random content'

  render(
    <Modal>
      <ModalOpenButton>
        <button>Open</button>
      </ModalOpenButton>
      <ModalContents aria-label={ariaLabel} title={title}>
        <div>{content}</div>
      </ModalContents>
    </Modal>,
  )
  await userEvent.click(screen.getByRole('button', {name: /open/i}))

  const modal = screen.getByRole('dialog')
  expect(modal).toHaveAttribute('aria-label', ariaLabel)
  const withinModal = within(modal)
  expect(withinModal.getByRole('heading', {name: title})).toBeInTheDocument()
  expect(withinModal.getByText(content)).toBeInTheDocument()

  await userEvent.click(withinModal.getByRole('button', {name: /close/i}))

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
