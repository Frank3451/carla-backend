const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");
const xlsx = require("xlsx"); // 📌 Importa la libreria per leggere Excel

dotenv.config();
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 📌 Funzione per caricare i dati dal file Excel
const loadDataFromExcel = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  
  // Legge i prodotti dal foglio "Prodotti"
  const productSheet = workbook.Sheets["Prodotti"];
  const products = xlsx.utils.sheet_to_json(productSheet);

  // Legge le FAQ dal foglio "FAQ"
  const faqSheet = workbook.Sheets["FAQ"];
  const faq = xlsx.utils.sheet_to_json(faqSheet);

  // Legge le informazioni generali dal foglio "Informazioni Generali"
  const infoSheet = workbook.Sheets["Informazioni Generali"];
  const generalInfo = xlsx.utils.sheet_to_json(infoSheet);

  return { products, faq, generalInfo };
};

// 📌 Carica i dati dal file Excel
const data = loadDataFromExcel("nebula_dati.xlsx");

// 🟢 Genera il catalogo prodotti in stringa per il chatbot
const generateProductCatalog = () => {
  return data.products.map(
    (p) => `🛒 **${p["Nome Prodotto"]}** (${p["Categoria"]}) - **${p["Prezzo (€)"]}€**  
📌 ${p["Descrizione"]}  
🔗 Acquista qui: ${p["Link Acquisto"]}\n`
  ).join("\n");
};

// 🟢 Genera le risposte alle FAQ per il chatbot
const generateFAQResponses = () => {
  return data.faq.map(
    (q) => `📌 **${q["Domanda"]}**  
${q["Risposta"]}\n`
  ).join("\n");
};

// 🟢 Genera le informazioni generali
const generateGeneralInfo = () => {
  return data.generalInfo.map(
    (i) => `📌 **${i["Sezione"]}**  
${i["Informazione"]}\n`
  ).join("\n");
};

// 🟢 Prompt per il chatbot con dati aggiornati
const SYSTEM_PROMPT = `
Sei Carla, l'assistente virtuale ufficiale di Nebula. Rispondi alle domande sui prodotti, ordini, spedizioni e assistenza clienti.
Rispondi in modo amichevole e professionale. Se un cliente chiede informazioni su un prodotto, usa il catalogo prodotti per rispondere.

🔥 **Catalogo Prodotti:**  
${generateProductCatalog()}

🔥 **Domande Frequenti:**  
${generateFAQResponses()}

🔥 **Informazioni Generali:**  
${generateGeneralInfo()}

⚠ **IMPORTANTE:**  
- Se il cliente chiede un prodotto non disponibile, informalo che al momento non è in catalogo.  
- Se la domanda è fuori contesto, invita gentilmente a chiedere informazioni pertinenti.
`;

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Messaggio mancante nel corpo della richiesta." });
    }

    // 🔹 Generazione risposta basata su catalogo e FAQ aggiornati
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
    });

    res.json({ reply: response.choices[0]?.message?.content || "Non sono sicura di come rispondere, prova a contattare il supporto Nebula!" });
  } catch (error) {
    console.error("Errore API OpenAI:", error);
    res.status(500).json({ error: "Si è verificato un errore nel chatbot. Riprova più tardi." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🟢 Server in ascolto su porta ${PORT}`));

