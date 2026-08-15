import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

// Inicializa o cliente Groq (ultra-rápido)
const groq = new Groq({ apiKey });

app.get('/api', (req, res) => {
  res.json({ status: 'AURA Backend Online (Groq Engine)' });
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt não fornecido' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'Chave GROQ_API_KEY não configurada no Render.' });
    }

    // Chamada usando o Llama 3.3 70B (modelo potente e gratuito)
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Você é o AURA, um assistente pessoal inteligente, direto, prestativo e elegante.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
    });

    const reply = completion.choices[0]?.message?.content || 'Sem resposta gerada.';

    res.json({ reply });

  } catch (error) {
    console.error('Erro na API Groq:', error);
    res.status(500).json({ error: 'Erro ao processar resposta IA: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AURA rodando na porta ${PORT}`);
});