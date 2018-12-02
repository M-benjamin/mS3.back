import { DATABASE_URL } from '@env'
import Sequelize, { Op } from 'sequelize'
import User from './user'
import Bucket from './bucket'
import Blob from './blob'

export const db = new Sequelize(DATABASE_URL, {
  operatorsAliases: Op,
  define: {
    underscored: true,
  },
})

// FIXME - dynamic import model
export const models = {
  User: User.init(db),
  Bucket: Bucket.init(db),
  Blob: Blob.init(db),
}

// Run `.associate` if it exists, ie create relationships in the ORM
Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models))
