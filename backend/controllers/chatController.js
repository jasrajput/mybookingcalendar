import Support from "../models/supportModel.js";
import Chat from "../models/chatModel.js";
import generateToken from "../utils/tokenGenerator.js";

// export const getTickets = async (req, res, next) => {
//   try {
//     const tickets = await Support.find({});

//     if (tickets) {
//       res.status(200).json({ tickets });
//     } else {
//       res.status(400).json({ message: "No tickets found" });
//     }
//   } catch (error) {
//     next(error);
//   }
// };

export const getAllMessages = async (req, res, next) => {
  try {
    const messages = await Chat.find({ supportID: req.params.id });

    if (messages) {
      res.status(200).json({ messages, token: generateToken(req.user.id) });
    } else {
      res.status(400).json({ message: "No message found for this ticket" });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    create a new message
// @route   POST /api/chat
// @access  private
export const sendMessage = async (req, res, next) => {
  try {
    const { message, replyBy, supportID } = req.body;

    const chat = await Chat.create({
      message: message,
      replyBy: replyBy,
      supportID: supportID,
    });

    console.log(chat);

    await Support.findOneAndUpdate(
      { id: supportID },
      {
        updatedAt: chat.updatedAt,
      }
    );

    if (chat) {
      res.status(201).json({
        message: "Message added successfully",
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
// export const getTicketsByID = async (req, res, next) => {
//   try {
//     const tickets = await Support.find({ id: req.id });

//     if (tickets) {
//       res.status(200).json({ tickets });
//     } else {
//       res.status(400).json({ message: "No tickets found for this id" });
//     }
//   } catch (error) {
//     next(error);
//   }
// };
