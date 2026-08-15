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

const SYSTEM_PROMPT = {
  role: 'system',
  content: `Você é o AURA, um assistente pessoal de elite: direto, inteligente, eficiente e extremamente cortês. 
Sua missão é resolver os problemas do usuário de forma clara, organizada e acionável.
Sempre formate suas respostas de maneira elegante usando Markdown.`
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
      return res.status(500).json({ error: 'Chave GROQ_API_KEY não configurada no Render.' });
    }

    // Monta a lista de mensagens garantindo o formato correto
    let formattedMessages = [SYSTEM_PROMPT];

    if (history && Array.isArray(history) && history.length > 0) {
      // Converte o histórico para o formato exato esperado pela Groq/OpenAI
      const cleanHistory = history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: String(msg.content)
      }));
      formattedMessages = formattedMessages.concat(cleanHistory);
    } else if (prompt) {
      formattedMessages.push({ role: 'user', content: String(prompt) });
    }

    const completion = await groq.chat.completions.create({
      messages: formattedMessages,
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