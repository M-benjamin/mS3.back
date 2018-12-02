import { NODE_ENV, PORT } from '@env'
import express from 'express'
import bodyParser from 'body-parser'
import passport from 'passport'
import cors from 'cors'

import os from 'os'
import path from 'path'

import mArg from 'utils/mArg'
import mLog from 'utils/mLog'

import './middleware/passport'
import { initialize } from './libs/services/storage'

import { db as database } from './models'
import api from './routes/api'

// Entry point function
const start = async () => {
  try {
    const args = mArg({
      '--port': Number,

      // aliases
      '-p': '--port',
    })

    // Setting the application port depending to environment
    const networkInterfaces = os.networkInterfaces()

    const host = networkInterfaces.lo0[0].address || HOST
    const port = args.port || PORT
    // database synchronization ...
    await database.authenticate()

    mLog('Connected to SQL database!', 'green')

    if (NODE_ENV === 'development') {
      mLog('Synchronizing database!')
      // creates tables from models
      database.sync({
        force: false,
        logging(str) {
          mLog(str, 'magenta')
        },
      })
    }

    // initialize filesystem stuff
    await initialize()

    // instantiate express application
    const app = express()

    // authentication middleware
    app.use(passport.initialize())

    // body data en+decoding
    app.use(bodyParser.urlencoded())
    app.use(bodyParser.json())
    app.use(cors())

    app.use((req, res, next) => {
      // version the media type and extend the language for api versionning
      res.setHeader('Accept', 'application/vnd.upload.island.v1+json')

      // website we wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')

      // request methods we wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

      // request headers we wish to allow
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-Requested-With, Accept, Authorization, Content-Type',
      )

      // set to true if we need the website to include cookies in the requests sent
      // to the API (e.g. in case we use sessions)
      res.setHeader('Access-Control-Allow-Credentials', true)

      // pass to next layer of middleware
      next()
    })

    app.get('/', (req, res) => {
      res.send(`Please feel free to use our api in ${host}:${port}/api`)
    })

    // About routes definition
    app.use('/api', api)

    // Catching 404 error and forwarding to error handler
    app.use((req, res, next) => {
      const err = new Error('Routes not found')
      err.status = 404
      next(err)
    })

    // error handler
    app.use((err, req, res) => {
      res.status(err.status || 500).json({ err: err.message })
    })

    // ... and finally server listening
    app.listen(port, (err) => {
      if (err) throw err

      mLog(`Server is running on port ${port}`)
    })
  } catch (err) {
    mLog(err, 'red')
    process.exit(42)
  }
}

// Let's Rock!
start()
