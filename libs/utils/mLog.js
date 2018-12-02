import { NODE_ENV } from '@env'
import kleur from 'kleur'
import moment from 'moment'

import { dump, dd } from 'dumper.js'

export function mDump(obj, andDie = false) {
  if (typeof obj === 'function') {
    obj = {
      type: 'function',
      name: obj.name,
    }
  }

  andDie ? dd(obj) : dump(obj)
}

export default function (str, how = 'white', withNewLine = true, withTimestamps = true) {
  const available_colors = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'gray',
  ]

  how = available_colors.includes(how) ? how : 'white'

  let display = ''
  if (withTimestamps) {
    display += `${moment().format()} :: `
  }

  display = kleur[how](`${display}${str}`)

  if (withNewLine) {
    console.log(display)
  } else {
    process.stdout.write(display)
  }
}

// adding mDump do global scope on development to avoid import/from
if (NODE_ENV === 'development') {
  global.mDump = mDump
}
