# AI Voice Assistant

A modern, AI-powered voice assistant built with Next.js, TypeScript, and Ant Design. Features seamless voice interactions, multilingual support, and integration with Groq's powerful LLM models.

## 🚀 Features

- **Voice Command Support**: Natural speech recognition using Web Speech API
- **Multilingual Capabilities**: Support for 13+ languages
- **AI-Powered Responses**: Integration with Groq API and Llama models
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)
- **Real-time Transcription**: Live voice-to-text conversion
- **Text-to-Speech**: Browser-based speech synthesis
- **Modern UI**: Beautiful interface with Ant Design components
- **Serverless Architecture**: Vercel-ready API routes

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Groq API key (get it from [console.groq.com](https://console.groq.com))

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/ai-voice-assistant.git
cd ai-voice-assistant
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Groq API key:

```
GROQ_API_KEY=your_groq_api_key_here
```

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment on Vercel

1. **Install Vercel CLI** (optional)

```bash
npm i -g vercel
```

2. **Deploy using Vercel CLI**

```bash
vercel
```

Or deploy via GitHub:

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add `GROQ_API_KEY` environment variable
4. Deploy!

## 📁 Project Structure

```
ai-voice-assistant/
├── src/
│   ├── app/
│   │   ├── api/              # Vercel serverless functions
│   │   │   ├── chat/         # Chat completion endpoint
│   │   │   ├── speech-to-text/ # Speech recognition endpoint
│   │   │   └── text-to-speech/ # Text-to-speech endpoint
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── VoiceAssistant/   # Main voice assistant component
│   │   ├── LanguageSelector/ # Language selection
│   │   └── ModelSelector/    # AI model selection
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── .env.example            # Environment variables template
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies
└── tsconfig.json           # TypeScript configuration
```

## 🔑 API Routes

### POST /api/chat

Chat completion with AI models

```typescript
Request: {
  messages: Array<{ role: string; content: string }>;
  model: string;
  language?: string;
}

Response: {
  message: string;
  model: string;
  usage?: { ... };
}
```

### POST /api/speech-to-text

Convert speech to text (uses Groq Whisper)

```typescript
Request: {
  audio: string; // base64 encoded
  language?: string;
}

Response: {
  text: string;
  language: string;
}
```

### POST /api/text-to-speech

Convert text to speech

```typescript
Request: {
  text: string;
  language?: string;
}

Response: {
  useClientTTS: boolean;
  // Uses browser Web Speech API
}
```

## 🎨 Customization

### Adding New Languages

Edit `src/lib/constants.ts`:

```typescript
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  // Add your language here
];
```

### Adding New Models

Edit `src/lib/constants.ts`:

```typescript
export const GROQ_MODELS: GroqModel[] = [
  {
    id: "model-id",
    name: "Model Name",
    description: "Model description",
  },
];
```

## 🔧 Technologies Used

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI Library**: Ant Design
- **Styling**: Tailwind CSS
- **AI Integration**: Groq SDK
- **Voice Recognition**: Web Speech API
- **Deployment**: Vercel Serverless Functions

## 📝 Available Models

- **Llama 3.3 70B Versatile**: Most capable model
- **Llama 3.1 70B Versatile**: Previous generation
- **Llama 3.1 8B Instant**: Fast responses
- **Mixtral 8x7B**: Large context window
- **Gemma 2 9B**: Instruction-tuned

## 🌍 Supported Languages

English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, Hindi, Urdu, and more!

## 🐛 Troubleshooting

**Voice recognition not working?**

- Use Chrome, Edge, or Safari (Firefox doesn't support Web Speech API)
- Grant microphone permissions
- Use HTTPS (required for microphone access)

**API errors?**

- Verify your Groq API key in `.env.local`
- Check API rate limits
- Ensure you have internet connection

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js and Groq AI
