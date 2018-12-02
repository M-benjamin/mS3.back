import { Router } from 'express'

import users from './users'
import buckets from './buckets'
import blobs from './blobs'

const api = Router({ mergeParams: true })

// a\ users
api.use('/users', users)

// b\ buckets
api.use('/users/:uuid/buckets', buckets)

// c\ blobs
api.use('/users/:uuid/buckets/:bucket_id/blobs', blobs)

export default api
