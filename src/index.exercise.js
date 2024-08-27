import {loadDevTools} from './dev-tools/load'
import './bootstrap'
import * as React from 'react'
import {createRoot} from 'react-dom/client'
import {App} from './app'
import {AppProviders} from './context'
import {Profiler} from 'components/profiler'

export const rootRef = {}
loadDevTools(() => {
  const root = createRoot(document.getElementById('root'))
  root.render(
    <Profiler id="App Root">
      <AppProviders>
        <App />
      </AppProviders>
    </Profiler>,
  )
  rootRef.current = root
})
