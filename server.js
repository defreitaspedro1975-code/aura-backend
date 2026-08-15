import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let finances = [];

// Status do Servidor
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', name: 'AURA OS' });
});

// 1. Chat com IA
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Você é AURA, um assistente pessoal direto, prestativo e ágil.'
      }
    });
    res.json({ reply: response.text });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar resposta da IA.' });
  }
});

// 2. Gerador de E-mails
app.post('/api/emails/generate', async (req, res) => {
  try {
    const { recipient, topic, tone } = req.body;
    const prompt = `Escreva uma minuta de e-mail em português para: ${recipient}. Assunto: ${topic}. Tom: ${tone}. Seja direto e profissional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    res.json({ data: { content: response.text } });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao gerar e-mail.' });
  }
});

// 3. Finanças
app.get('/api/finances', (req, res) => {
  const balance = finances.reduce((acc, curr) => {
    return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
  }, 0);

  res.json({ summary: { balance }, transactions: finances });
});

app.post('/api/finances', (req, res) => {
  const { description, amount, type } = req.body;
  if (!description || isNaN(amount)) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const newTransaction = { id: Date.now(), description, amount: Number(amount), type };
  finances.unshift(newTransaction);
  res.json({ success: true, transaction: newTransaction });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🤖 AURA rodando na porta ${PORT}`);
});
