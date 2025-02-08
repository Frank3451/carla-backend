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

const ECWID_STORE_ID = "112208810";
const ECWID_TOKEN = "public_d1kqevj22iXNH8b9arhK1JhLh7qvA1SD";

// ✅ INSERISCI QUI la funzione per ottenere dettagli del negozio da Ecwid
async function getStoreDetails() {
  const response = await fetch(`https://app.ecwid.com/api/v3/${ECWID_STORE_ID}/profile`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${ECWID_TOKEN}`,
      "Content-Type": "application/json"
    }
  });

  const data = await response.json();
  return data;
}

// ✅ Ora il chatbot può usare i dati di Ecwid
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body.toLowerCase();

    if (message.includes("indirizzo") || message.includes("orari")) {
      const storeDetails = await getStoreDetails();

      // Verifica se i dati esistono, altrimenti usa un valore predefinito
      const address = storeDetails?.company?.address || "Indirizzo non disponibile";
      const openingHours = storeDetails?.company?.openingHours || "Orari non disponibili";

      return res.json({ reply: `Ci trovi in: ${address}. Orari: ${openingHours}` });
    }

    // Se la domanda è diversa, usa GPT-4 Turbo
    const responseAI = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Fornisci assistenza ai clienti solo per domande pertinenti il negozio di abbigliamento. Per il resto non rispondere, tendendo comunque buona educazione. Rispondi al primo messaggio con Ciao sono Carla, come posso aiutarti?. Rispondi in modo prettamente inerente la domanda senza dilungarti troppo" },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: responseAI.choices[0].message.content });

  } catch (error) {
    console.error("Errore nel chatbot:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Definito UNA SOLA VOLTA
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server in ascolto su porta ${PORT}`));

