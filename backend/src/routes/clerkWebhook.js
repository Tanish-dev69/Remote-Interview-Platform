import express from "express";
import { inngest } from "../lib/inngest.js";

const router = express.Router();

router.post("/clerk", async (req, res) => {
  try {
    const event = req.body;

    // SEND EVENT TO INNGEST
    await inngest.send({
      name: event.type,
      data: event.data,
    });

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Webhook error");
  }
});

export default router;
