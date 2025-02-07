import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "system", content: "Tu sei Carla, un chatbot amichevole e utile." }, { role: "user", content: message }],
    });
    res.json({ reply: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server in ascolto su porta ${PORT}`));
