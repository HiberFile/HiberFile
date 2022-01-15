import Router from '@koa/router';

import filesControllers from '../controllers/files.controllers';

const router = new Router();

router.get('/files/:id', filesControllers.getFile);
router.post('/files', filesControllers.createFile);

export default router
