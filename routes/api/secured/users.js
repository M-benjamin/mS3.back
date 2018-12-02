import { Router } from 'express'
import { pick } from 'lodash'
import { success, error } from 'helpers/response'
import { BAD_REQUEST } from 'constants/api'
import User from 'models/user'

const api = Router()

api.get('/:uuid', async (req, res) => {
  try {
    const user = await User.findOne({ where: { uuid: req.params.uuid } })

    if (user) {
      res.json(success(user))
    } else {
      res.json(error(BAD_REQUEST, `Oops, user ${req.params.uuid} doesn't exist`))
    }
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

api.put('/:uuid', async (req, res) => {
  try {
    const user = await User.findOne({ where: { uuid: req.params.uuid } })

    if (user) {
      const fields = pick(req.body, ['nickname', 'email', 'password', 'password_confirmation'])

      await user.update(fields)

      res.status(204).end()
    }
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

export default api
