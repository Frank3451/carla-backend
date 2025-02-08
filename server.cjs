const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();
const app = express();
app.use(cors({ origin: "*" })); // 🔹 Abilita CORS per tutte le origini
app.use(express.json());
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Ti chiami Carla e sei una assistente clienti di un negozio di abbigliamento." },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000; // ✅ Definito UNA SOLA VOLTA
app.listen(PORT, () => console.log(`Server in ascolto su porta ${PORT}`));

