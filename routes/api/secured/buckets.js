import { Router } from 'express'
import { createBucket, renameBucket, destroyBucket } from 'libs/services/storage'
import { success, error } from 'helpers/response'
import { BAD_REQUEST } from 'constants/api'
import isAUth from "../../../middleware/is-auth";
import Bucket from 'models/bucket'

const api = Router({ mergeParams: true })

api.get('/', isAUth, async (req, res) => {
  try {
    const { user } = req

    const buckets = await user.getBuckets()

    res.status(200).json(success({ buckets }))
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

api.post('/', async (req, res) => {
  try {
    const { user } = req
    const { uuid: user_uuid } = req.params
    const { name } = req.body

    console.log('NAME', name);

    const existing_bucket = await user.getBuckets({ where: { name } })
    if (existing_bucket.length) {
      return res.status(400).json(error(BAD_REQUEST, `Bucket [[ ${name} ]] already exist`))
    }

    await createBucket(user_uuid, name)
    const bucket = new Bucket({ name, user_uuid })
    await bucket.save()

    res.status(201).json(bucket)
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

api.head('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const bucket = await Bucket.findOne({ where: { id } })
    res.status(bucket ? 200 : 400).end()
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

api.put('/:id', async (req, res) => {
  try {
    const { uuid: user_uuid, id } = req.params
    const { name: newBucketName } = req.body

    const bucket = await Bucket.findOne({ where: { id } })
    if (!bucket) {
      return res.status(400).json(error(BAD_REQUEST, `Bucket [[ ${id} ]] doesn't exist`))
    }

    if (bucket.name !== newBucketName) {
      await renameBucket(user_uuid, bucket.name, newBucketName)
      await bucket.update({ name: newBucketName })
      await bucket.save()
    }

    res.status(200).json({update: true})
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

api.delete('/:id', async (req, res) => {
  try {
    const { uuid: user_uuid, id } = req.params

    const bucket = await Bucket.findOne({ where: { id } })
    if (!bucket) {
      return res.status(400).json(error(BAD_REQUEST, `Bucket [[ ${id} ]] doesn't exist`))
    }

    await destroyBucket(user_uuid, bucket.name)
    await bucket.destroy({ force: true })

    res.status(200).json({delete: true})
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

export default api
