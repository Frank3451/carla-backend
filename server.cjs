const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv"); // Importato UNA SOLA VOLTA
const { Configuration, OpenAIApi } = require("openai");

dotenv.config();
const app = express();
app.use(cors({ origin: "*" })); // 🔹 Abilita CORS per tutte le origini
app.use(express.json());

const openai = new OpenAIApi(
    new Configuration({ apiKey: process.env.OPENAI_API_KEY })
);

app.post("/chat", async (req, res) => {
    try {
        const { message } = req.body;
        const response = await openai.createChatCompletion({
            model: "gpt-4-turbo",
            messages: [{ role: "system", content: "Tu sei Carla, un chatbot amichevole e utile." }, { role: "user", content: message }],
        });
        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server in ascolto su porta ${PORT}`));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server in ascolto su porta ${PORT}`));
