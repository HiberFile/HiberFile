import Koa from "koa";

import filesRoutes from "~/api/routes/files.routes";
import usersRoutes from "~/api/routes/users.routes";

export default (app: Koa) => {
  app.use(filesRoutes.routes());
  app.use(filesRoutes.allowedMethods());

  app.use(usersRoutes.routes());
  app.use(usersRoutes.allowedMethods());
};
