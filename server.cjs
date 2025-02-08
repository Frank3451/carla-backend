const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const puppeteer = require("puppeteer");

dotenv.config();
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 🔹 Funzione per estrarre i contenuti del sito
async function scrapeWebsite(url) {
  try {
    const browser = await puppeteer.launch({
      headless: true, // Esegui in modalità headless
      args: ["--no-sandbox", "--disable-setuid-sandbox"] // Necessario per Render
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Estrai il testo visibile dal sito
    const content = await page.evaluate(() => {
      return document.body.innerText;
    });

    await browser.close();
    return content.substring(0, 2000); // 🔹 Limitiamo il testo per evitare risposte troppo lunghe
  } catch (error) {
    console.error("Errore nel web scraping:", error);
    return "Errore nell'ottenere le informazioni dal sito.";
  }
}

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // 🔹 Se la domanda riguarda il sito, estraiamo i dati in tempo reale
    if (message.toLowerCase().includes("info sito") || message.toLowerCase().includes("negozio")) {
      const siteContent = await scrapeWebsite("https://nebula77.company.site");
      return res.json({ reply: `Ecco alcune informazioni dal sito: ${siteContent}` });
    }

    // 🔹 Se non riguarda il sito, usa GPT-4 Turbo per rispondere
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Ti chiami Carla e sei un'assistente clienti di un negozio di abbigliamento. Se il cliente chiede informazioni sul sito, usa il contenuto estratto tramite web scraping." },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Errore nel chatbot:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server in ascolto su porta ${PORT}`));

