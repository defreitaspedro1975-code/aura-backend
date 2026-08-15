import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

// Inicializa a SDK com a nova chave AQ.Ab8...
const ai = new GoogleGenAI({ apiKey });

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

    // Usa o nome completo do modelo compatível com o novo formato de chave
    const response = await ai.models.generateContent({
      model: 'models/gemini-1.5-flash',
      contents: prompt,
    });

    res.json({ reply: response.text });

  } catch (error) {
    console.error('Erro na API Gemini:', error);
    res.status(500).json({ error: 'Erro ao processar resposta IA: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AURA rodando na porta ${PORT}`);
});