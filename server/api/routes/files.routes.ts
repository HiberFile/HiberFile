import Router from '@koa/router';

import FilesControllers from '../controllers/files.controllers';

const router = new Router();

router.get('/files/:id', FilesControllers.getFile);
router.post('/files', FilesControllers.createFile);

export default router
