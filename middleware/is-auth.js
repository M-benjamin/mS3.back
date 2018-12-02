import jwt from 'jsonwebtoken'
import { JWT_ENCRYPTION } from '@env'

export default (req, res, next) => {
  const authHeader = req.get('Authorization')

  if (!authHeader) {
    const error = new Error('Not authentification')
  }

  const token = req.get('Authorization').split(' ')[1]
  let decodedToken

  try {
    decodedToken = jwt.verify(token, JWT_ENCRYPTION)
  } catch (error) {
    error.statusCode = 500
    throw error
  }

  if (!decodedToken) {
    const error = new Error('Not authentificate')
    error.statusCode = 401
    throw error
  }

  req.userId = decodedToken.userId
  next()
}
