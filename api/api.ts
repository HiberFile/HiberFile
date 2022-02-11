import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from "koa-bodyparser";

import registerPassport from "~/api/registerPassport";
import registerRoutes from "~/api/registerRoutes";
import connectMongooseMiddleware from "~/api/middleware/connectMongoose.middleware";

const app = new Koa();
const router = new Router();

app.use(bodyParser());
app.use(connectMongooseMiddleware);

registerPassport(app);
registerRoutes(app);

app.use(router.routes());
app.use(router.allowedMethods());

export default {
  path: '/api',
  handler: app.callback()
}
