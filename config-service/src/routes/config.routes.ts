import { Router } from "express";
import * as configController from "../controllers/config.controller";
import { validate } from "../middleware/validate";
import { createConfigSchema, updateConfigSchema } from "../schemas/config.schema";

const router = Router();

router.get("/configs", configController.getAll);
router.get("/configs/:key", configController.getByKey);
router.post("/configs", validate(createConfigSchema), configController.create);
router.put("/configs/:key", validate(updateConfigSchema), configController.update);
router.delete("/configs/:key", configController.remove);

export default router;
