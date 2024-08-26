/** @jsx jsx */
import {jsx} from '@emotion/core'

import * as React from 'react'
import * as auth from 'auth-provider'
import * as colors from 'styles/colors'
import {FullPageSpinner} from 'components/lib'
import {client} from 'utils/api-client.exercise'
import {AuthenticatedApp} from './authenticated-app'
import {UnauthenticatedApp} from './unauthenticated-app'
import {useAsync} from 'utils/hooks'

function App() {
  const {
    data: user,
    error,
    isIdle,
    isLoading,
    isError,
    run,
    setData: setUser,
  } = useAsync()

  React.useEffect(() => {
    const getUser = async () => {
      const token = await auth.getToken()
      if (token) {
        const response = await client('me', {token})
        return response.user
      }
      return null
    }
    run(getUser())
  }, [run, setUser])

  if (isLoading || isIdle) {
    return <FullPageSpinner />
  }

  if (isError) {
    return (
      <div
        css={{
          color: colors.danger,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p>There was an error, please refresh the page and try again.</p>
        <pre>{error.message}</pre>
      </div>
    )
  }

  const login = form => {
    auth.login(form).then(u => setUser(u))
  }
  const register = form => {
    auth.register(form).then(u => setUser(u))
  }
  const logout = () => {
    auth.logout()
    setUser(null)
  }

  if (user) {
    return <AuthenticatedApp user={user} logout={logout} />
  }

  return <UnauthenticatedApp login={login} register={register} />
}

export {App}
