import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from "koa-bodyparser";

import registerPassport from "./registerPassport";
import registerRoutes from "./registerRoutes";
import connectMongooseMiddleware from "./middleware/connectMongoose.middleware";

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
