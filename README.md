# AI Document Chat

An intelligent document chat application that allows you to upload documents and have conversations about their content using OpenAI's Assistant API.

## Features

- 📄 **Document Upload**: Upload multiple documents (PDF, TXT, etc.)
- 💬 **AI Chat**: Ask questions about your documents using OpenAI's GPT-4
- 📊 **Diagram Generation**: Request Mermaid diagrams based on document data
- 🎨 **Markdown Support**: Rich text formatting in chat responses
- 🗂️ **Multiple Assistants**: Create and manage multiple document collections
- 🗑️ **Resource Management**: Delete assistants and clean up OpenAI resources
- 🌓 **Dark/Light Mode**: Toggle between themes

## Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone git@github.com:maxdollinger/ai-document-chat.git
cd ai-document-chat
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (SQLite)
DATABASE_URL=sqlite:./sqlite.db
```

**Required Environment Variables:**
- `OPENAI_API_KEY`: Your OpenAI API key from [platform.openai.com](https://platform.openai.com/api-keys)
- `DATABASE_URL`: SQLite database path (default: `sqlite:./sqlite.db`)

### 4. Database Setup

The database will be automatically created and migrated when you first run the development server.

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Document Assistant

1. Go to the home page
2. Upload your documents (PDF, TXT, etc.)
3. Give your assistant a name
4. Click "Create Assistant"

### Chatting with Documents

1. Select an existing assistant from the chat listing
2. Ask questions about the uploaded documents
3. Request diagrams by asking for visual representations of data

### Managing Assistants

- **View all assistants**: Visit `/chat/listing`
- **Add more files**: Use the "Add Files" button on existing assistants
- **Delete assistants**: Click the trash icon to remove assistants and clean up OpenAI resources

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migrations

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: SQLite with Drizzle ORM
- **AI**: OpenAI Assistant API with File Search
- **UI**: Tailwind CSS + shadcn/ui components
- **Markdown**: react-markdown with GitHub Flavored Markdown
- **Diagrams**: Mermaid.js integration

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable UI components
├── lib/
│   ├── actions/         # Server actions
│   ├── db/             # Database schema and configuration
│   └── utils.ts        # Utility functions
└── ...
```

## License

This project is licensed under the GLWTS (Good Luck With That Shit, No LLMs) Public License. See [LICENCE.md](LICENCE.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

If you encounter any issues, please check:
1. Your OpenAI API key is valid and has sufficient credits
2. All environment variables are set correctly
3. The database file has proper permissions

---

**Happy chatting with your documents!** 🚀
