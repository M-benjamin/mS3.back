import Sequelize, { Model } from 'sequelize'
import { BLOB } from 'constants/validation'

export default class Blob extends Model {
  static init(database) {
    return super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        path: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: {
            args: true,
            msg: BLOB.PATH.EXIST_MESSAGE,
          },
        },
        size: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        tableName: 'blobs',
        sequelize: database,

        indexes: [
          {
            unique: true,
            fields: ['id'],
          },
        ],
      },
    )
  }

  static associate(models) {
    this.belongsTo(models.Bucket, { as: 'bucket' })
  }
}
