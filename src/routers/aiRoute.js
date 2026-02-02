require('dotenv').config();
const express = require('express');
const { InferenceClient } = require('@huggingface/inference');
const router = express.Router();

const client = new InferenceClient(process.env.HF_API_KEY);

router.post('/summariseReviews', async (req, res) => {
  const { reviews, merchName } = req.body;

  if (!reviews?.length) {
    return res.status(400).json({ summary: 'No reviews provided.' });
  }

  try {
    // Label reviews
    const labelledReviews = reviews.map((r, i) => `Review ${i + 1}: ${r}`).join("\n");

    // Chat prompt
    const messages = [
      //initial prompt
      {
        role: "system",
        content: "You summarise customer reviews into 2-3 clear sentences. Do NOT repeat exact review sentences. Focus on overall sentiment, key positives, and major issues."
      },
      //supply reviewdata 
      {
        role: "user",
        content: `Summarise reviews for "${merchName}":\n${labelledReviews}`
      }
    ];

    // Use chatCompletion endpoint
    const output = await client.chatCompletion({
      model: "meta-llama/Llama-3.2-1B-Instruct",
      messages
    });

    // Extract summary
    const summary = output?.choices?.[0]?.message?.content?.trim() || "No summary generated.";

    res.json({ summary });

  } catch (err) {
    console.error("Error in summariseReviews:", err);
    res.status(500).json({ summary: "Error generating summary. Please try again." });
  }
});

router.post('/merchHelp', async (req, res) => {
  const { question, merch } = req.body;
  // console.log("merchnaems:" + merch);
  if (!question) {
    return res.status(400).json({ answer: 'No question provided.' });
  }

  try {
    // Chat prompt for merch help
    const messages = [
      {
        role: "system",
        content:`
          You are a helpful merch assistant for an online store. 
          Answer customer questions clearly and politely. 
          Provide guidance about the given question if relevant.
          Give the answer in a clean and consise manner, in point form.
          Do not mention merchandise outside of the current ones in the page,
          the merchandise currently on the page is: "${merch}".
          GIVE THE ANSWER ONLY IN POINT FORM.
          `
      },
      {
        role: "user",
        content: question
      }
    ];

    // Use chatCompletion endpoint
    const output = await client.chatCompletion({
      model: "meta-llama/Llama-3.2-1B-Instruct",
      messages
    });

    const answer = output?.choices?.[0]?.message?.content?.trim() || "No answer generated.";

    res.json({ answer });

  } catch (err) {
    console.error("Error in merchHelp:", err);
    res.status(500).json({ answer: "Error generating answer. Please try again." });
  }
});

module.exports = router;
