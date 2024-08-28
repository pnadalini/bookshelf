import {
  render as rtlRender,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import * as auth from 'auth-provider'
import {AppProviders} from 'context'
import * as usersDB from 'test/data/users'
import {buildUser} from 'test/generate'
import userEvent from '@testing-library/user-event'

const loginAsUser = async userProps => {
  const user = buildUser(userProps)
  await usersDB.create(user)
  const authUser = await usersDB.authenticate(user)
  localStorage.setItem(auth.localStorageKey, authUser.token)
  return authUser
}

const waitForLoadingToFinish = () => {
  return waitForElementToBeRemoved(() => [
    ...screen.queryAllByLabelText(/loading/i),
    ...screen.queryAllByText(/loading/i),
  ])
}

async function render(ui, {route = '/list', user, ...renderOptions} = {}) {
  user = typeof user === 'undefined' ? await loginAsUser() : user
  window.history.pushState({}, 'Test page', route)

  const returnValue = {
    ...rtlRender(ui, {wrapper: AppProviders, ...renderOptions}),
    user,
  }

  await waitForLoadingToFinish()

  return returnValue
}

export * from '@testing-library/react'
export {render, userEvent, loginAsUser, waitForLoadingToFinish}
