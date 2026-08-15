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

    if (!apiKey) {
      return res.status(500).json({ error: 'Chave GROQ_API_KEY não configurada no Render.' });
    }

    // Inicializa o histórico com a instrução do sistema
    let messages = [SYSTEM_PROMPT];

    // Se veio um histórico completo de mensagens do frontend, usa-o
    if (history && Array.isArray(history) && history.length > 0) {
      const cleanHistory = history.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: String(msg.content)
      }));
      messages = messages.concat(cleanHistory);
    } 
    // Se veio apenas um prompt simples isolado
    else if (prompt) {
      messages.push({ role: 'user', content: String(prompt) });
    } 
    else {
      return res.status(400).json({ error: 'Nenhum prompt ou histórico fornecido.' });
    }

    // Envia o histórico completo para a API da Groq
    const completion = await groq.chat.completions.create({
      messages: messages,
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