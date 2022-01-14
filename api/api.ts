import Koa from 'koa'
import Router from '@koa/router'

import registerRoutes from "./registerRoutes";

const app = new Koa()
const router = new Router()

registerRoutes(app)

app.use(router.routes())
app.use(router.allowedMethods())

export default {
  path: '/api',
  handler: app.callback()
}
