import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

// Inicializa a SDK do Gemini
const genAI = new GoogleGenerativeAI(apiKey);

app.get('/api', (req, res) => {
  res.json({ status: 'AURA Backend Online' });
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt não fornecido' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'Chave GEMINI_API_KEY não configurada no Render.' });
    }

    // Inicializa o modelo gemini-1.5-flash via SDK oficial
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const replyText = response.text();

    res.json({ reply: replyText });

  } catch (error) {
    console.error('Erro na API Gemini:', error);
    res.status(500).json({ error: 'Erro ao processar resposta IA: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AURA rodando na porta ${PORT}`);
});