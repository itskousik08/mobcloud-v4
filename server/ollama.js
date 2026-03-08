const Ollama = require('ollama').Ollama;
const fs = require('fs').promises;
const path = require('path');

const ollama = new Ollama({ host: 'http://localhost:11434' });
const previewDir = path.join(__dirname, '../preview');

// Function to get the list of locally available Ollama models
const listModels = async () => {
  const response = await ollama.list();
  return response.models.map(model => model.name);
};

// Function to generate website content using a specified model
const generateWebsite = async (prompt, model, progressCallback) => {
    await fs.mkdir(previewDir, { recursive: true });
    
    progressCallback('Generating HTML...');
    const htmlContent = await generateFileContent(prompt, model, 'html');
    await fs.writeFile(path.join(previewDir, 'index.html'), htmlContent);

    progressCallback('Generating CSS...');
    const cssContent = await generateFileContent(prompt, model, 'css', htmlContent);
    await fs.writeFile(path.join(previewDir, 'style.css'), cssContent);
    
    progressCallback('Generating JavaScript...');
    const jsContent = await generateFileContent(prompt, model, 'js', htmlContent);
    await fs.writeFile(path.join(previewDir, 'script.js'), jsContent);

    progressCallback('Finalizing...');
};

const generateFileContent = async (userPrompt, model, fileType, context = '') => {
    let systemMessage = '';
    switch (fileType) {
        case 'html':
            systemMessage = `You are an expert web developer. Based on the user's prompt, create the complete HTML structure for a modern, responsive website. The HTML should be self-contained in a single index.html file. Link to a 'style.css' stylesheet and a 'script.js' JavaScript file. Do NOT include any CSS or JavaScript code in the HTML file itself, only the structure. Do not use any placeholders. Generate the full, complete code. Respond ONLY with the raw HTML code.`;
            break;
        case 'css':
            systemMessage = `You are an expert web designer. Based on the user's prompt and the provided HTML structure, create the complete CSS for a modern, visually appealing, and responsive website. The design should be clean and professional. Do not use any placeholders. Respond ONLY with the raw CSS code. Here is the HTML structure for context:\n\n${context}`;
            break;
        case 'js':
            systemMessage = `You are an expert JavaScript developer. Based on the user's prompt and the provided HTML structure, add interactive and dynamic functionality to the website. The JavaScript should be clean and well-commented. If no special interactivity is requested, you can create a simple script for things like smooth scrolling or a mobile menu toggle. Respond ONLY with the raw JavaScript code. Here is the HTML for context:\n\n${context}`;
            break;
    }

    try {
        const response = await ollama.generate({
            model: model,
            prompt: `User Prompt: "${userPrompt}".\n\n${systemMessage}`,
            stream: false,
            format: 'json'
        });
        
        // Clean the response to extract only the code block
        let code = response.response;
        code = code.replace(/```(html|css|javascript|js)?\n/g, '');
        code = code.replace(/```/g, '');
        return code.trim();

    } catch (error) {
        console.error(`Error generating ${fileType}:`, error);
        throw new Error(`Failed to generate ${fileType} content.`);
    }
};

module.exports = { listModels, generateWebsite };
