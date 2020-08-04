import IORedis from 'ioredis'

const CONTEXT_REDIS = Symbol('context#redis')

class Redis {
  constructor (opt) {
    this.name = 'redis'
    this.isLono = true
    this.opt = opt
    this.connectionMap = {}
  }
  install (app) {
    if (app.context.hasOwnProperty(CONTEXT_REDIS)) return
    const config = app.$config.redis || this.opt
    if (config && config.client) {
      if (Array.isArray(config.client)) {
        config.client.forEach((item) => {
          this.createDB(item)
        })
      } else if (typeof config.client === 'object') {
        this.createDB(config.client)
      }
    }
    Object.defineProperties(app.context, {
      [CONTEXT_REDIS]: {
        value: this,
        writable: false
      },
      'redis': {
        value: this,
        writable: false
      }
    })
  }
  async createDB (client) {
    const name = client.name || 'default'
    const redis = new IORedis(client)
    redis.on('connect', () => {
      console.log(`redis ${name} connect success`)
    })
    this.connectionMap[name] = redis
  }
  get (name) {
    return this.connectionMap[name || 'default']
  }
}

export default function (...arg) {
  return new Redis(...arg)
}
