# TheCrux 📚

**AI-Powered Book Search**

Discover your next favorite book with intelligent recommendations tailored to your reading preferences and habits.

![TheCrux Banner](https://github.com/user-attachments/assets/9a90ecdc-abfb-4019-8db0-bb1a8b8e57d3)

## ✨ Features

- **Intelligent Search**: AI-powered book discovery based on your preferences
- **Smart Recommendations**: Personalized suggestions using advanced algorithms
- **Beautiful UI**: Clean, responsive design with vintage aesthetics
- **Fast Performance**: Built with Vite for lightning-fast development and builds
- **Modern Stack**: React 18, TypeScript, and cutting-edge web technologies

## 🚀 Tech Stack

- **[React](https://reactjs.org/)** - A JavaScript library for building user interfaces
- **[Vite](https://vitejs.dev/)** - Next generation frontend tooling
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautifully designed components built with Radix UI and Tailwind CSS
- **[Tailwind CSS](https://tailwindcss.com/)** - A utility-first CSS framework
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript with syntax for types

## 🛠️ Installation

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Get Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/TabsOverSpaces4/crux.git
   cd crux
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
   
   Update the environment variables in `.env.local`:
   ```env
   VITE_API_BASE_URL=your_api_endpoint
   VITE_AI_API_KEY=your_ai_service_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application running.

## 📦 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Run type checking
npm run type-check

# Format code with Prettier
npm run format
```

## 🏗️ Project Structure

```
crux/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   └── custom/       # Custom components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── pages/            # Application pages
│   ├── services/         # API services
│   ├── styles/           # Global styles
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Application entry point
├── .env.example          # Environment variables template
├── components.json       # shadcn/ui configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```


<div align="center">
  Made with ❤️ by Harsh Gupta
</div>
