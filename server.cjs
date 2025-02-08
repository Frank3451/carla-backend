const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const fetch = require("node-fetch");

dotenv.config();
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 👉 Inserisci qui il tuo Store ID e Token Pubblico di Ecwid
const ECWID_STORE_ID = 112208810;
const ECWID_TOKEN = public_d1kqevj22iXNH8b9arhK1JhLh7qvA1SD;

// 👉 Funzione per ottenere prodotti da Ecwid
async function getProducts() {
  const response = await fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/products?token=${ECWID_TOKEN}`);
  const data = await response.json();
  if (data.items) {
    return data.items.map(item => `${item.name}: ${item.price}€`).join("\n");
  } else {
    return "Non ho trovato prodotti disponibili al momento.";
  }
}

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body.toLowerCase();

    // 👉 Se l'utente chiede informazioni sui prodotti, chiamiamo Ecwid API
    if (message.includes("prodotti") || message.includes("prezzo") || message.includes("quanto costa")) {
      const products = await getProducts();
      return res.json({ reply: `Ecco i nostri prodotti e prezzi:\n${products}` });
    }

    // 👉 Se l'utente chiede orari o indirizzo, rispondiamo direttamente
    if (message.includes("orari")) {
      return res.json({ reply: "Siamo aperti dalle 9:00 alle 18:00, dal lunedì al sabato." });
    }
    if (message.includes("indirizzo")) {
      return res.json({ reply: "Ci trovi in Via Ponte della Delizia, 11 - Sedegliano." });
    }

    // 👉 Se la domanda non riguarda prodotti, orari o indirizzo, chiamiamo GPT-4 Turbo
    const responseAI = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu sei un assistente del negozio Nebula77. Rispondi solo a domande sui prodotti, prezzi, orari e indirizzo. Non rispondere a domande non pertinenti al negozio." },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: responseAI.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server in ascolto su porta ${PORT}`));
