import Koa from "koa";

import filesRoutes from "./routes/files.routes";
import usersRoutes from "./routes/users.routes";

export default (app: Koa) => {
  app.use(filesRoutes.routes());
  app.use(filesRoutes.allowedMethods());

  app.use(usersRoutes.routes());
  app.use(usersRoutes.allowedMethods());
};
