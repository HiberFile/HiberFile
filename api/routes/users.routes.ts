import Router from '@koa/router';
import UsersControllers from "~/api/controllers/users.controllers";

const router = new Router();

router.post('/users', UsersControllers.createUser);

router.get('/users/:userId/tokens', UsersControllers.getTokens);
router.post('/users/:userId/tokens', UsersControllers.createToken);
router.delete('/users/:userId/tokens/:tokenId', UsersControllers.deleteToken);

router.get('/users/:userId/webhooks', UsersControllers.getWebhooks);
router.post('/users/:userId/webhooks', UsersControllers.createWebhook);
router.delete('/users/:userId/webhooks/:webhookId', UsersControllers.deleteWebhook);

export default router
