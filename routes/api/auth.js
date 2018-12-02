import { JWT_ENCRYPTION } from '@env'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import passport from 'passport'

import { addUserWorkspace } from 'services/storage'
import { success, error } from 'helpers/response'
import { BAD_REQUEST } from 'constants/api'
import User from 'models/user'

import Mail from 'services/mail'

const api = Router()

/** About Sign-up
 */
api.post('/register', async (req, res) => {
  const {
    nickname, email, password, password_confirmation,
  } = req.body


  try {
    const user = new User({
      nickname,
      email,
      password,
      password_confirmation,
    })

    await user.save()

    addUserWorkspace(user.uuid).then(() => {
      const payload = { uuid: user.uuid, nickname, email }
      const token = jwt.sign(payload, JWT_ENCRYPTION)

      const message = `
        Hey ${user.nickname}!

        Welcome to myS3 services 😎
      `

      Mail.send(user.email, 'Welcome', message, `<span>${message}</span>`)
      res.status(201).json(success({ user }, { token }))
    })
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

/** About Login
 */
api.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user) => {
    if (err) {
      return res.status(400).json(error(BAD_REQUEST, err))
    }

    const { uuid, nickname, email } = user.toJSON()

    // generate a signed json web token with the contents of user object and
    const token = jwt.sign({ uuid, nickname, email }, JWT_ENCRYPTION)

    return res.json(success({ user }, { token }))
  })(req, res, next)
})

export default api
