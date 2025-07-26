import { Router } from 'express';
import userRoutes from './user.routes';
import activityRoutes from './activity.routes';
import commentRoutes from './comment.routes';

const mainRouter = Router();
mainRouter.use('/users', userRoutes);
mainRouter.use('/activities', activityRoutes);
mainRouter.use('/comments', commentRoutes);

export default mainRouter;