import Support from "../models/supportModel.js";
import Chat from "../models/chatModel.js";
import generateToken from "../utils/tokenGenerator.js";

// @desc    create a new ticket
// @route   POST /api/support
// @access  private
export const createTicket = async (req, res, next) => {
  try {
    const { subject, email, category, topic, description } = req.body;

    const ticket = await Support.create({
      subject,
      email,
      category,
      topic,
      description,
      user: req.user.id,
    });

    const chat = await Chat.create({
      message: ticket.description,
      replyBy: 0,
      supportID: ticket._id,
    });

    if (ticket && chat) {
      res.status(201).json({
        message: "New ticket created successfully",
        token: generateToken(req.user._id),
      });
    } else {
      res
        .status(400)
        .json({ message: "Something went wrong. Please try again later" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    get user's tickets
// @route   GET /api/support
// @access  private
export const getTickets = async (req, res, next) => {
  try {
    const tickets = await Support.find({});

    if (tickets) {
      res.status(200).json({ tickets, token: generateToken(req.user.id) });
    } else {
      res.status(400).json({ message: "No tickets found" });
    }
  } catch (error) {
    next(error);
  }
};

export const getTicketsByUser = async (req, res, next) => {
  try {
    const tickets = await Support.find({ user: req.user.id });

    if (tickets) {
      res.status(200).json({ tickets, token: generateToken(req.user.id) });
    } else {
      res.status(400).json({ message: "No tickets found for this user" });
    }
  } catch (error) {
    next(error);
  }
};

export const getTicketsByID = async (req, res, next) => {
  try {
    const ticket = await Support.findById(req.params.id);

    if (ticket) {
      res.status(200).json({ ticket, token: generateToken(req.user.id) });
    } else {
      res.status(400).json({ message: "No ticket found for this id" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    close tickets
// @route   UPDATE /api/support/:id
// @access  private
export const closeTicket = async (req, res, next) => {
  try {
    const ticketFound = await Support.findById(req.params.id);

    if (ticketFound) {
      const ticketUpdated = await Support.findByIdAndUpdate(
        req.params.id,
        {
          status: 1,
        },
        {
          new: true,
        }
      );

      if (ticketUpdated) {
        res.status(201).json({
          message: "Ticket closed successfully",
          token: generateToken(req.user.id),
        });
      } else {
        res
          .status(400)
          .json({ message: "Unable to close an ticket. Please try again" });
      }
    } else {
      res.status(400).json({ message: "Ticket not found" });
    }
  } catch (error) {
    next(error);
  }
};
