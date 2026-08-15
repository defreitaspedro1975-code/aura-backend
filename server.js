import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;

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

    // URL corrigida incluindo models/gemini-1.5-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro retornado pela Google:', data);
      return res.status(response.status).json({ 
        error: data.error?.message || 'Erro de comunicação com o Gemini' 
      });
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta da IA';
    res.json({ reply: replyText });

  } catch (error) {
    console.error('Erro interno:', error);
    res.status(500).json({ error: 'Erro ao processar resposta IA: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AURA rodando na porta ${PORT}`);
});