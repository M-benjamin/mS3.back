import arg from 'arg'

export default function (options) {
  const args = arg(options)

  delete args._

  for (const key in args) {
    args[key.substr(2)] = args[key]
    delete args[key]
  }

  return args
}
