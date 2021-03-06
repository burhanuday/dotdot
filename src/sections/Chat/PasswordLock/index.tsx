import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { OverlayTrigger, Tooltip, Button, Modal, Form } from 'react-bootstrap'
import classNames from 'classnames'

import styles from './index.module.scss'
import { fetchResource } from 'util/fetch'
import useGlobalState from 'store/state'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { API_URL } from '../../../constants'

export default () => {
  const { state, dispatch } = useGlobalState()

  const [showModal, setShowModal] = useState<boolean>(false)
  const [validated, setValidated] = useState<boolean>(false)

  const [password, setPassword] = useState<string>('')
  const [repeatPassword, setRepeatPassword] = useState<string>('')

  const handleClose = () => setShowModal(false)
  const handleShow = () => setShowModal(true)

  const handleSubmit = (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()

    setValidated(true)

    const form = event.currentTarget
    if (!form.checkValidity()) {
      return
    }

    const body = {
      password,
      repeatPassword,
    }

    fetchResource('/password', 'POST', body)
      .then(() => {
        dispatch({
          type: 'user_password',
          payload: true,
        })

        setShowModal(false)
        setValidated(false)
        setPassword('')
        setRepeatPassword('')
      })
      .catch((reason) => {
        dispatch({
          type: 'error',
          payload: reason.errors.join(', '),
        })
      })
  }

  let buttonClass = styles.unlocked
  let buttonIcon: IconProp = 'lock-open'
  let tooltipText = 'Set a password to keep your username'
  let title = 'Claim Username'

  if (state.auth.user && state.auth.user.hasPassword) {
    buttonClass = styles.locked
    buttonIcon = 'lock'
    tooltipText = 'Change your password'
    title = 'Update Password'
  }

  return (
    <span className={styles.passwordLock}>
      <OverlayTrigger
        placement="bottom"
        delay={500}
        overlay={<Tooltip id="passwordLock">{tooltipText}</Tooltip>}
      >
        <Button variant="link" className={buttonClass} style={ { padding: 0 } } onClick={handleShow}>
          <FontAwesomeIcon icon={buttonIcon} />
        </Button>
      </OverlayTrigger>

      <Modal show={showModal} onHide={handleClose}>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              { title }
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group controlId="pwd.new">
              <Form.Control
                as="input"
                type="password"
                autoComplete="new-password"
                placeholder="Password..."
                autoFocus
                required
                minLength={6}
                onChange={(event) => {
                  setPassword(event.currentTarget.value)
                }}
                value={password}
              />
              <Form.Control.Feedback type="invalid">
                The password is too short. Minimum length is 6 characters.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="pwd.new">
              <Form.Control
                as="input"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat Password..."
                required
                minLength={6}
                pattern={password}
                onChange={(event) => {
                  setRepeatPassword(event.currentTarget.value)
                }}
                value={repeatPassword}
              />
              <Form.Control.Feedback type="invalid">
                The passwords don't match!
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className={ styles.footer }>
            <a href={ `${API_URL}/logout` } className={ classNames(styles.left, 'text-danger') }>
              Logout
            </a>

            <Button type="submit" variant="primary">
              Set password
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </span>
  )
}
