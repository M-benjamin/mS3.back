import { ROOT_STORAGE_PATH } from '@env'

import fs from 'fs'
import path from 'path'

// First, create /opt/workspace directory and set the right permission for the server user
// @example: sudo mkdir /opt/workspace && sudo chown -R ch0pper workspace
export function initialize() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(ROOT_STORAGE_PATH)) {
      fs.mkdir(ROOT_STORAGE_PATH, { recursive: true }, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    } else {
      resolve()
    }
  })
}

export function addUserWorkspace(user_uuid) {
  const userPath = path.join(ROOT_STORAGE_PATH, user_uuid)
  return fs.promises.mkdir(userPath)
}

export function removeUserWorkspace(user_uuid) {
  const userPath = path.join(ROOT_STORAGE_PATH, user_uuid)
  return fs.promises.rmdir(userPath)
}

export function createBucket(user_uuid, bucketName) {
  const bucketPath = path.join(ROOT_STORAGE_PATH, user_uuid, bucketName)
  return fs.promises.mkdir(bucketPath)
}

export function renameBucket(user_uuid, bucketName, bucketNewName) {
  const userPath = path.join(ROOT_STORAGE_PATH, user_uuid)

  const oldBucketPath = path.join(userPath, bucketName)
  const newBucketPath = path.join(userPath, bucketNewName)
  return fs.promises.rename(oldBucketPath, newBucketPath)
}

export function destroyBucket(user_uuid, bucketName) {
  const bucketPath = path.join(ROOT_STORAGE_PATH, user_uuid, bucketName)
  return fs.promises.rmdir(bucketPath)
}

export function renameBlob(user_uuid, bucketName, blobName, blobNewName) {
  const bucketPath = path.join(ROOT_STORAGE_PATH, user_uuid, bucketName)

  const oldBlobPath = path.join(bucketPath, blobName)
  const newBlobPath = path.join(bucketPath, blobNewName)
  return fs.promises.rename(oldBlobPath, newBlobPath)
}

export function destroyBlob(user_uuid, bucketName, blobName) {
  const blobPath = path.join(ROOT_STORAGE_PATH, user_uuid, bucketName, blobName)
  return fs.promises.unlink(blobPath)
}

export function copyBlob(user_uuid, bucketName, blobName, cloneBlobName) {
  const blobPath = path.join(ROOT_STORAGE_PATH, user_uuid, bucketName, blobName)

  const cloneBlobPath = path.join(ROOT_STORAGE_PATH, user_uuid, bucketName, cloneBlobName)

  return new Promise((resolve, reject) => {
    if (fs.existsSync(cloneBlobPath)) {
      return resolve()
    }

    const rstream = fs.createReadStream(blobPath)
    const wstream = fs.createWriteStream(cloneBlobPath)

    rstream
      .pipe(wstream)
      .on('finish', resolve)
      .on('error', reject)
  })
}

export default {
  initialize,
  addUserWorkspace,
  createBucket,
  destroyBucket,
  renameBlob,
  destroyBlob,
  copyBlob,
}
