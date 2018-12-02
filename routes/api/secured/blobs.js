import { ROOT_STORAGE_PATH } from '@env'
import { Router } from 'express'
import multer from 'multer'
import path from 'path'

import { destroyBlob, copyBlob } from 'services/storage'

import { success, error } from 'helpers/response'
import { BAD_REQUEST, INTERNAL_ERROR } from 'constants/api'

import Bucket from 'models/bucket'
import Blob from 'models/blob'

const api = Router({ mergeParams: true })

// a\ storage location
const storage = multer.diskStorage({
  async destination(req, file, cb) {
    const { uuid: user_uuid, bucket_id: id } = req.params

    const bucket = await Bucket.findById(id)

    let dirname

    if (bucket) {
      dirname = path.join(ROOT_STORAGE_PATH, user_uuid.toString(), bucket.name)
    } else {
      dirname = path.join('/', 'tmp')
    }

    cb(null, dirname)
  },
  filename(req, file, cb) {
    cb(null, file.originalname)
  },
})

const upload = multer({ storage })

api.get('/', async (req, res) => {
  try {
    const { bucket_id } = req.params

    const bucket = await Bucket.findById(bucket_id)
    if (!bucket) {
      return res.status(400).json(error(BAD_REQUEST, `Bucket [[ ${bucket_id} ]] doesn't exist`))
    }

    const blobs = await bucket.getBlobs()

    res.status(200).json(success({ blobs }))
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

api.post('/', upload.single('image'), async (req, res) => {
  try {
    const { uuid: user_uuid, bucket_id } = req.params
    const { originalname, size } = req.file
    const { name } = req.body

    const bucket = await Bucket.findById(bucket_id)
    if (!bucket) {
      return res.status(400).json(error(BAD_REQUEST, `Bucket [[ ${bucket_id} ]] doesn't exist`))
    }

    const existing_blob = await Blob.findOne({
      where: { name, size, bucket_id },
    })
    if (existing_blob) {
      return res.status(400).json(error(BAD_REQUEST, `Blob [[ ${name} ]] already exist`))
    }

    if (!name) {
      throw new Error('Field name must be define')
    }

    const pathName = path.join('/', user_uuid, bucket.name, originalname)

    const blob = new Blob({
      name,
      size,
      path: pathName,
      bucket_id,
      user_uuid,
    })
    await blob.save()
    res.status(201).json(success(blob))
  } catch (err) {
    if (err instanceof multer.MulterError) {
      res.status(500).json(error(INTERNAL_ERROR, 'File upload not available, please try again'))
    } else {
      res.status(400).json(error(BAD_REQUEST, err.message))
    }
  }
})

api.get('/:id', async (req, res) => {
  try {
    const { bucket_id, id } = req.params

    const bucket = await Bucket.findById(bucket_id)
    if (!bucket) {
      return res.status(400).json(error(BAD_REQUEST, `Bucket [[ ${bucket_id} ]] doesn't exist`))
    }

    const blob = await Blob.findById(id)
    if (!blob) {
      return res.status(400).json(error(BAD_REQUEST, `Blob [[ ${id} ]] doesn't exist`))
    }

    res.sendFile(path.join(ROOT_STORAGE_PATH, blob.path))
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

api.get('/:id/meta', async (req, res) => {
  try {
    const { bucket_id, id } = req.params

    const bucket = await Bucket.findById(bucket_id)
    if (!bucket) {
      return res.status(400).json(error(BAD_REQUEST, `Bucket [[ ${bucket_id} ]] doesn't exist`))
    }

    const blob = await Blob.findById(id)
    if (!blob) {
      return res.status(400).json(error(BAD_REQUEST, `Blob [[ ${id} ]] doesn't exist`))
    }

    const { path: pathName, size } = blob.toJSON()

    res.status(200).json(success({ blob: { path: pathName, size } }))
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

api.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { bucket_id, id } = req.params
    console.log(bucket_id, id)

    const name = req.body.name[0]

    const bucket = await Bucket.findById(bucket_id)
    if (!bucket) {
      return res.status(400).json(error(BAD_REQUEST, `Bucket [[ ${bucket_id} ]] doesn't exist`))
    }

    const blob = await Blob.findById(id)
    if (!blob) {
      return res.status(400).json(error(BAD_REQUEST, `Blob [[ ${id} ]] doesn't exist`))
    }

    if (blob.name !== name) {
      if (!name) {
        throw new Error('Field name must be define')
      }

      await blob.update({ name })
    }

    res.status(200).json({ update: true })
  } catch (err) {
    console.log('ERRRRR', err)
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

api.delete('/:id', async (req, res) => {
  try {
    const { uuid: user_uuid, bucket_id, id } = req.params

    const bucket = await Bucket.findById(bucket_id)
    if (!bucket) {
      return res.status(400).json(error(BAD_REQUEST, `Bucket [[ ${bucket_id} ]] doesn't exist`))
    }

    const blob = await Blob.findById(id)
    if (!blob) {
      return res.status(400).json(error(BAD_REQUEST, `Blob [[ ${id} ]] doesn't exist`))
    }

    await destroyBlob(user_uuid, bucket.name, path.basename(blob.path))
    await blob.destroy({ force: true })

    res.status(200).json({ delete: true })
  } catch (err) {
    res.status(400).json(error(BAD_REQUEST, err.message))
  }
})

api.post('/:id/copy', async (req, res) => {
  try {
    const { uuid: user_uuid, bucket_id, id } = req.params

    const bucket = await Bucket.findById(bucket_id)
    if (!bucket) {
      return res.status(400).json(error(BAD_REQUEST, `Bucket [[ ${bucket_id} ]] doesn't exist`))
    }

    const blob = await Blob.findById(id)
    if (!blob) {
      return res.status(400).json(error(BAD_REQUEST, `Blob [[ ${id} ]] doesn't exist`))
    }

    const [, blobBaseName, ext] = path.basename(blob.path).match(/^(.*)\.(.*)$/)
    const cloneBlobBaseName = `${blobBaseName}.copy.${ext}`

    await copyBlob(user_uuid, bucket.name, path.basename(blob.path), cloneBlobBaseName)

    const fields = blob.toJSON()
    delete fields.id

    fields.name += '_copy'
    fields.path = path.join('/', user_uuid, bucket.name, cloneBlobBaseName)

    const clone = new Blob(fields)
    await clone.save()

    res.status(201).json(success(clone))
  } catch (err) {
    if (err instanceof multer.MulterError) {
      res.status(500).json(error(INTERNAL_ERROR, 'File upload not available, please try again'))
    } else {
      res.status(400).json(error(BAD_REQUEST, err.message))
    }
  }
})

export default api
