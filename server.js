const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch'); // Ensure node-fetch v2 is installed
const app = express();
const PORT = 3000;
const OLLAMA_API = 'http://127.0.0.1:11434/api/generate';

// ---------------------------------------------
// 🔥 CHANGE HERE: Using Qwen Model
// 'qwen2.5-coder:1.5b' matches the install script
// ---------------------------------------------
const AI_MODEL = 'qwen2.5-coder:1.5b'; 

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// System prompt optimized for Qwen Coder
const SYSTEM_PROMPT = `
You are an expert Frontend Web Developer.
Your task is to generate valid HTML, CSS, and JavaScript based on the user's request.
You MUST output the response in strictly valid JSON format with three keys: "html", "css", and "js".
Do not add markdown, code blocks, or explanations outside the JSON.
`;

app.post('/generate', async (req, res) => {
    const userPrompt = req.body.prompt;
    const currentCode = req.body.currentCode || null;

    let fullPrompt = "";
    if (currentCode) {
        fullPrompt = `Update the following website code based on this instruction: "${userPrompt}".\nHTML: ${currentCode.html}\nCSS: ${currentCode.css}\nJS: ${currentCode.js}`;
    } else {
        fullPrompt = `Build a website with these requirements: ${userPrompt}`;
    }

    try {
        console.log(`🤖 Generating with ${AI_MODEL}...`);
        
        const response = await fetch(OLLAMA_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: AI_MODEL,
                prompt: fullPrompt,
                system: SYSTEM_PROMPT,
                stream: false,
                format: "json", // Important: Qwen 2.5 supports JSON mode
                options: {
                    temperature: 0.7, // Creativity balance
                    top_p: 0.9
                }
            })
        });

        const data = await response.json();
        
        if (!data.response) {
            throw new Error("Empty response from Ollama");
        }

        // Parse JSON output from AI
        let generatedData;
        try {
            generatedData = JSON.parse(data.response);
        } catch (e) {
            // Fallback cleanup if AI adds extra text
            const cleanJson = data.response.replace(/```json|```/g, '');
            generatedData = JSON.parse(cleanJson);
        }

        res.json(generatedData);

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "AI Generation failed. Check if Ollama is running." });
    }
});

app.listen(PORT, () => {
    console.log(`\n>>> MobCloud Started with ${AI_MODEL} <<<`);
    console.log(`Open: http://localhost:${PORT}`);
});
