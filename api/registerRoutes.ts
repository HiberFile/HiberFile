import Koa from "koa";

import filesRoutes from "~/api/routes/files.routes";

export default (app: Koa) => {
  app.use(filesRoutes.routes());
  app.use(filesRoutes.allowedMethods());
};
