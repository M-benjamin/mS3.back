import { Router } from 'express'
import passport from 'passport'
import auth from './auth'
import secured from './secured'

const api = Router()

// a\ health-check endpoint
api.get('/', (req, res) => {
  res.json({
    api: 'myS3.Api',
    meta: {
      status: 'running',
      version: 'v1.0',
    },
  })
})

// a\ authentication
api.use('/auth', auth)
api.use('/', passport.authenticate('jwt', { session: false }), secured)

export default api
