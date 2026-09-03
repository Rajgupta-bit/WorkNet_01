import { Router } from "express";

import {
  create,
  list,
  mine,
  update,
} from "../controllers/providers.js";

import { protect } from "../middleware/auth.js";

const router = Router();

/* PUBLIC */

router.get("/", list);

/* PROTECTED */

router.use(protect);

router.get("/mine", mine);

router.post("/", create);

router.patch("/:id", update);

export default router;