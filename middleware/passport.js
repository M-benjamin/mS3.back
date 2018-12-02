import { JWT_ENCRYPTION } from '@env'
import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JsonWebTokenStrategy, ExtractJwt } from 'passport-jwt'

import { USER } from 'constants/validation'
import User from '../models/user'

passport.use(
  new LocalStrategy(
    {
      usernameField: 'nickname',
      passwordField: 'password',
    },
    async (nickname, password, done) => {
      try {
        const user = await User.findOne({ where: { nickname } })

        if (!user) {
          return done(USER.NICKNAME.INCORRECT_MESSAGE)
        }

        if (!(await user.checkPassword(password))) {
          return done(USER.PASSWORD.INCORRECT_MESSAGE)
        }

        // the returned user object is pre-formatted and ready for storing in JWT
        return done(false, user)
      } catch (err) {
        // set error true to let passport 'verified' function to call error
        return done('Something is not right')
      }
    },
  ),
)

// Middleware that handle protected requests
// Allows only requests with valid tokens to access some special routes needing authentication
passport.use(
  new JsonWebTokenStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_ENCRYPTION,
    },
    async (jwtPayload, done) => {
      // find the user in db using uuid
      try {
        const user = await User.findOne({ where: { uuid: jwtPayload.uuid } })

        if (user) {
          return done(null, user)
        }

        return done(USER.NOT_EXIST_MESSAGE)
      } catch (err) {
        return done(err)
      }
    },
  ),
)
