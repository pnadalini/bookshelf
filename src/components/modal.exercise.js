/** @jsx jsx */
import {jsx} from '@emotion/core'

import React from 'react'
import {Dialog} from './lib'
import VisuallyHidden from '@reach/visually-hidden'
import {CircleButton} from 'components/lib'

const callAll =
  (...fns) =>
  (...args) =>
    fns.forEach(fn => fn && fn(...args))
const ModalContext = React.createContext()

function Modal({children}) {
  const [isOpen, setIsOpen] = React.useState(false)
  return (
    <ModalContext.Provider value={{isOpen, setIsOpen}}>
      {children}
    </ModalContext.Provider>
  )
}

function ModalDismissButton({children}) {
  const {setIsOpen} = React.useContext(ModalContext)
  return React.cloneElement(children, {
    onClick: callAll(children.props.onClick, () => setIsOpen(false)),
  })
}

function ModalOpenButton({children}) {
  const {setIsOpen} = React.useContext(ModalContext)
  return React.cloneElement(children, {
    onClick: callAll(children.props.onClick, () => setIsOpen(true)),
  })
}

function ModalContentsBase({children, ...props}) {
  const {isOpen, setIsOpen} = React.useContext(ModalContext)
  return (
    <Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)} {...props}>
      {children}
    </Dialog>
  )
}

function ModalContents({title, children, ...rest}) {
  return (
    <ModalContentsBase {...rest}>
      <div css={{display: 'flex', justifyContent: 'flex-end'}}>
        <ModalDismissButton>
          <CircleButton>
            <VisuallyHidden>Close</VisuallyHidden>
            <span aria-hidden>×</span>
          </CircleButton>
        </ModalDismissButton>
      </div>
      <h3 css={{textAlign: 'center', fontSize: '2em'}}>{title}</h3>
      {children}
    </ModalContentsBase>
  )
}

export {
  Modal,
  ModalDismissButton,
  ModalOpenButton,
  ModalContentsBase,
  ModalContents,
}
