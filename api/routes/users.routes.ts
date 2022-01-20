import Router from '@koa/router';
import UsersControllers from "~/api/controllers/users.controllers";

const router = new Router();

router.post('/users', UsersControllers.createUser);

export default router
