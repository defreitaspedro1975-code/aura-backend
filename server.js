import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
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

    // Tenta primeiro com gemini-2.5-flash
    let modelName = 'gemini-2.5-flash'; 
    
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return res.json({ reply: response.text() });
    } catch (e) {
      // Se falhar, tenta gemini-1.5-pro
      console.log('Tentando modelo alternativo gemini-1.5-pro...');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return res.json({ reply: response.text() });
    }

  } catch (error) {
    console.error('Erro na API Gemini:', error);
    res.status(500).json({ error: 'Erro ao processar resposta IA: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AURA rodando na porta ${PORT}`);
});