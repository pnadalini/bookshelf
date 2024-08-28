import React from 'react'
import {App} from 'app'
import {
  render,
  screen,
  waitForLoadingToFinish,
  userEvent,
  loginAsUser,
} from 'test/app-test-utils'
import {server, rest} from 'test/server'
import * as booksDB from 'test/data/books'
import * as listItemsDB from 'test/data/list-items'
import {buildBook, buildListItem} from 'test/generate'
import {formatDate} from 'utils/misc'

const apiURL = process.env.REACT_APP_API_URL

const fakeTimerUserEvent = userEvent.setup({
  advanceTimers: () => jest.runOnlyPendingTimers(),
})

async function renderBookScreen({user, book, listItem} = {}) {
  user = typeof user === 'undefined' ? await loginAsUser() : user
  book = typeof book === 'undefined' ? await booksDB.create(buildBook()) : book
  listItem =
    typeof listItem === 'undefined'
      ? await listItemsDB.create(buildListItem({owner: user, book}))
      : listItem
  const route = `/book/${book.id}`

  const utils = await render(<App />, {user, route})

  return {...utils, user, book, listItem}
}

test('renders all the book information', async () => {
  const {book} = await renderBookScreen({listItem: null})

  expect(screen.getByRole('heading', {name: book.title})).toBeInTheDocument()
  expect(screen.getByText(book.synopsis)).toBeInTheDocument()
  expect(screen.getByRole('img', {name: /book cover/i})).toHaveAttribute(
    'src',
    book.coverImageUrl,
  )
  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
})

test('can create a list item for the book', async () => {
  await renderBookScreen({listItem: null})

  const addButton = screen.getByRole('button', {name: /add to list/i})
  await userEvent.click(addButton)

  await waitForLoadingToFinish()

  expect(
    screen.getByRole('button', {name: /remove from list/i}),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /add to list/i}),
  ).not.toBeInTheDocument()
})

test('can remove a list item for the book', async () => {
  await renderBookScreen()

  const removeButton = screen.getByRole('button', {
    name: /remove from list/i,
  })
  await userEvent.click(removeButton)
  expect(removeButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(screen.getByRole('button', {name: /add to list/i})).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {name: /remove from list/i}),
  ).not.toBeInTheDocument()
})

test('can mark a list item as read', async () => {
  const {listItem} = await renderBookScreen()

  const markAsReadButton = screen.getByRole('button', {name: /mark as read/i})
  await userEvent.click(markAsReadButton)
  expect(markAsReadButton).toBeDisabled()

  await waitForLoadingToFinish()

  expect(
    screen.getByRole('button', {name: /mark as unread/i}),
  ).toBeInTheDocument()
  expect(screen.getAllByRole('radio', {name: /star/i})).toHaveLength(5)

  const datesNode = screen.getByLabelText(/start and finish date/i)
  expect(datesNode).toHaveTextContent(
    `${formatDate(listItem.startDate)} — ${formatDate(Date.now())}`,
  )

  expect(
    screen.queryByRole('button', {name: /mark as read/i}),
  ).not.toBeInTheDocument()
})

test('can edit a note', async () => {
  jest.useFakeTimers()
  const {listItem} = await renderBookScreen()

  const notes = 'this is a fake note'
  const notesNode = screen.getByRole('textbox', {name: /notes/i})

  await fakeTimerUserEvent.clear(notesNode)
  await fakeTimerUserEvent.type(notesNode, notes)

  // It takes a while so we need to wait to get the loading
  await screen.findByLabelText(/loading/i)
  await waitForLoadingToFinish()

  expect(notesNode).toHaveValue(notes)

  expect(await listItemsDB.read(listItem.id)).toMatchObject({notes})
})

describe('console errors', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterAll(() => {
    console.error.mockRestore()
  })

  test('shows an error message when the book fails to load', async () => {
    const book = {id: 'fake_id'}
    await renderBookScreen({listItem: null, book})

    expect(
      (await screen.findByRole('alert')).textContent,
    ).toMatchInlineSnapshot(`"There was an error: Book not found"`)
    expect(console.error).toHaveBeenCalled()
  })

  test('note update failures are displayed', async () => {
    jest.useFakeTimers()
    const {listItem} = await renderBookScreen()

    const notes = 'this is a fake note'
    const notesNode = screen.getByRole('textbox', {name: /notes/i})

    server.use(
      rest.put(`${apiURL}/list-items/:listItemId`, async (req, res, ctx) => {
        return res(
          ctx.status(400),
          ctx.json({status: 400, message: "note wasn't saved"}),
        )
      }),
    )

    await fakeTimerUserEvent.clear(notesNode)
    await fakeTimerUserEvent.type(notesNode, notes)

    await screen.findByLabelText(/loading/i)
    await waitForLoadingToFinish()

    expect(screen.getByRole('alert').textContent).toMatchInlineSnapshot(
      `"There was an error: note wasn't saved"`,
    )
    expect(await listItemsDB.read(listItem.id)).not.toMatchObject({notes})
  })
})
