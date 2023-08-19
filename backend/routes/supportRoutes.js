import express from "express";
import {
  createTicket,
  getTickets,
  getTicketsByUser,
  getTicketsByID,
  closeTicket,
} from "../controllers/supportController.js";
import protect from "../middlewares/authMiddleware.js";
import hasRole from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getTicketsByUser).post(protect, createTicket);
router.route("/all-tickets").get(protect, hasRole, getTickets);
router.route("/:id").get(protect, getTicketsByID);
router.route("/:id").put(protect, hasRole, closeTicket);

export default router;
