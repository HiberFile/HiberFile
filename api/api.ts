import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from "koa-bodyparser";

import registerRoutes from "./registerRoutes";

const app = new Koa();
const router = new Router();

app.use(bodyParser());

registerRoutes(app);

app.use(router.routes());
app.use(router.allowedMethods());

export default {
  path: '/api',
  handler: app.callback()
}
