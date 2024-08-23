import React from 'react'

const LoginForm = ({onSubmit, buttonText}) => {
  const handleSubmit = e => {
    e.preventDefault()
    const {username, password} = e.target.elements

    onSubmit({username: username.value, password: password.value})
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="username">Username</label>
        <input type="text" name="username" id="username" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </div>
      <button type="submit">{buttonText}</button>
    </form>
  )
}

export default LoginForm
