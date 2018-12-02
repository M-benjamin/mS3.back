import {
  NODE_ENV, MAILER_HOST, MAILER_PORT, MAILER_USER, MAILER_PASS,
} from '@env'
import nodemailer from 'nodemailer'

function initialize() {
  let options = {
    host: MAILER_HOST,
    port: MAILER_PORT,
    secure: false, // true for 465, false for other ports
    ignoreTLS: true,
  }

  if (NODE_ENV !== 'development') {
    options = Object.assign({}, options, {
      auth: {
        user: MAILER_USER,
        pass: MAILER_PASS,
      },
    })
  }

  const transporter = nodemailer.createTransport(options)

  const template = {
    from: '"Admin" <g0ku@kamécraft.com>',
  }

  return { transporter, template }
}

export function send(to, subject, text, html) {
  const { transporter, template } = initialize()

  const options = Object.assign(template, {
    to,
    subject,
    text,
    html,
  })

  transporter.sendMail(options, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log('Message sent: %s', info.messageId)
    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  })
}

export default {
  initialize,
  send,
}
