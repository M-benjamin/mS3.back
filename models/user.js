import Sequelize, { Model } from 'sequelize'
import bcrypt from 'bcrypt'

import { USER } from 'constants/validation'

export default class User extends Model {
  static init(database) {
    return super.init(
      {
        uuid: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true,
        },
        nickname: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            isLongEnough(v) {
              if (v.length < USER.NICKNAME.MIN_LENGTH) {
                throw new Error(USER.NICKNAME.MIN_LENGTH_MESSAGE)
              }
            },
          },
          unique: {
            args: true,
            msg: USER.NICKNAME.EXIST_MESSAGE,
          },
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            isEmail: true,
          },
          unique: {
            args: true,
            msg: USER.EMAIL.EXIST_MESSAGE,
          },
        },
        password_digest: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notEmpty: true,
          },
        },
        password: {
          type: Sequelize.VIRTUAL,
          validate: {
            isLongEnough(val) {
              if (val.length < USER.PASSWORD.MIN_LENGTH) {
                throw new Error(USER.PASSWORD.MIN_LENGTH_MESSAGE)
              }
            },
          },
        },
        password_confirmation: {
          type: Sequelize.VIRTUAL,
          validate: {
            isEqual(val) {
              if (this.password !== val) {
                throw new Error(USER.PASSWORD.CONFIRMATION_MESSAGE)
              }
            },
          },
        },
      },
      {
        tableName: 'users',
        sequelize: database,

        indexes: [
          {
            unique: true,
            fields: ['uuid', 'email'],
          },
        ],

        define: {
          defaultScope: {
            attributes: { exclude: ['password'] },
          },
        },

        hooks: {
          async beforeValidate(userInstance) {
            if (userInstance.isNewRecord) {
              userInstance.password_digest = await userInstance.generatePasswordHash()
            }
          },

          async beforeSave(userInstance) {
            if (!userInstance.isNewRecord && userInstance.changed('password')) {
              if (userInstance.password !== userInstance.password_confirmation) {
                throw new Error(USER.PASSWORD.CONFIRMATION_MESSAGE)
              }
              userInstance.password_digest = await userInstance.generatePasswordHash()
            }
          },
        },
      },
    )
  }

  static associate(models) {
    this.hasMany(models.Bucket, { as: 'buckets' })
  }

  async checkPassword(password) {
    return bcrypt.compare(password, this.password_digest)
  }

  async generatePasswordHash() {
    // we choose ~10 hashes/sec
    const SALT_ROUNDS = 10

    // auto-generate a salt and hash the password
    const hash = await bcrypt.hash(this.password, SALT_ROUNDS)

    if (!hash) {
      throw new Error(USER.PASSWORD.HASH_MESSAGE)
    }

    return hash
  }

  toJSON() {
    const values = Object.assign({}, this.get())

    delete values.password_digest

    return values
  }
}
