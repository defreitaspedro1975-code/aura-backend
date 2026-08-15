import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
const groq = new Groq({ apiKey });

// Prompt de Sistema: A Personalidade do AURA
const SYSTEM_PROMPT = {
  role: 'system',
  content: `Você é o AURA, um assistente pessoal de elite: direto, inteligente, eficiente e extremamente cortês. 
Sua missão é resolver os problemas do usuário de forma clara, organizada e acionável.
Sempre formate suas respostas de maneira elegante usando Markdown (listas, destaques em negrito, tópicos claros).
Seja conciso e evite rodeios inúteis.`
};

app.get('/api', (req, res) => {
  res.json({ status: 'AURA Backend Online (Groq Engine v2)' });
});

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { prompt, history } = req.body;

    if (!prompt && (!history || history.length === 0)) {
      return res.status(400).json({ error: 'Prompt ou histórico não fornecidos.' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });
    }

    // Constrói o histórico da conversa completo
    let messages = [SYSTEM_PROMPT];

    if (history && Array.isArray(history)) {
      // Adiciona mensagens anteriores enviadas pelo frontend
      messages = messages.concat(history);
    } else if (prompt) {
      messages.push({ role: 'user', content: prompt });
    }

    // Chamada ultra-rápida ao Llama 3.3
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.6,
      max_tokens: 2048,
    });

    const reply = completion.choices[0]?.message?.content || 'Sem resposta gerada.';

    res.json({ reply });

  } catch (error) {
    console.error('Erro no AURA Backend:', error);
    res.status(500).json({ error: 'Erro ao processar resposta: ' + error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AURA rodando na porta ${PORT}`);
});