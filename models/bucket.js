import Sequelize, { Model } from 'sequelize'

export default class Bucket extends Model {
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
      },
      {
        tableName: 'buckets',
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
    this.belongsTo(models.User, { as: 'user' })
    this.hasMany(models.Blob, { as: 'blobs' })
  }
}
