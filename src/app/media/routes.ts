import { Router } from "express";
import { authenticate } from "../../lib/auth/guard";
import { Tokens } from "../../lib/di/tokens";
import { container } from "../../lib/di/container";
import { MediaController } from "./controller/media.controller";

export const mediaRouter = Router();

const mediaController = container.resolve<MediaController>(Tokens.MediaController);

// system_admin / restaurant_user only, checked in service
mediaRouter.post('/upload-url', authenticate, mediaController.createUploadUrl);
mediaRouter.post('/:id/confirm', authenticate, mediaController.confirmUpload);
