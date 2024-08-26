import {loadDevTools} from './dev-tools/load'
import './bootstrap'
import * as React from 'react'
import {ReactQueryConfigProvider} from 'react-query'
import {createRoot} from 'react-dom/client'
import {App} from './app'

export const rootRef = {}
const queryConfig = {
  queries: {
    useErrorBoundary: true,
    refetchOnWindowFocus: false,
    retry(failureCount, error) {
      if (error.status === 404) return false
      else if (failureCount < 2) return true
      else return false
    },
  },
}

loadDevTools(() => {
  const root = createRoot(document.getElementById('root'))
  root.render(
    <ReactQueryConfigProvider config={queryConfig}>
      <App />
    </ReactQueryConfigProvider>,
  )
  rootRef.current = root
})
