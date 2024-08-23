import React from 'react'
import {createRoot} from 'react-dom/client'
import {Dialog} from '@reach/dialog'
import LoginForm from 'LoginForm'
import '@reach/dialog/styles.css'

import {Logo} from './components/logo'

const App = () => {
  const [showLoginDialog, setShowLoginDialog] = React.useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = React.useState(false)

  return (
    <div>
      <Logo width="80" height="80" />
      <h1>Bookshelf</h1>
      <div>
        <button onClick={() => setShowLoginDialog(true)}>Login</button>
      </div>
      <div>
        <button onClick={() => setShowRegisterDialog(true)}>Register</button>
      </div>
      <Dialog aria-label="Login modal" isOpen={showLoginDialog}>
        <div>
          <button onClick={() => setShowLoginDialog(false)}>Close</button>
        </div>
        <h3>Login</h3>
        <LoginForm onSubmit={x => console.log('login', x)} buttonText="Login" />
      </Dialog>
      <Dialog aria-label="Registration modal" isOpen={showRegisterDialog}>
        <div>
          <button onClick={() => setShowRegisterDialog(false)}>Close</button>
        </div>
        <h3>Register</h3>
        <LoginForm
          onSubmit={x => console.log('register', x)}
          buttonText="Register"
        />
      </Dialog>
    </div>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
