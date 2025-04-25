# C-to-Promela Converter

A web-based tool to convert C code to Promela (Process Meta Language) for formal verification using SPIN (Simple Promela Interpreter).

## Overview

This application provides a user-friendly interface to convert C code into Promela specifications. The conversion helps in formal verification of concurrent systems, allowing users to verify properties and check for deadlocks, race conditions, and other concurrency issues in their code.

## Features

- Interactive code editor with syntax highlighting
- Real-time C to Promela conversion
- Resizable panels for better user experience
- Copy-to-clipboard functionality for converted code
- Responsive design for various screen sizes

## Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **UI Components**: Shadcn UI, ResizablePanels
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor

## Project Structure

```
frontend/
├── components.json      # Shadcn UI component configurations
├── eslint.config.mjs    # ESLint configuration
├── next.config.ts       # Next.js configuration
├── package.json         # Project dependencies
├── public/
│   └── logo.svg         # Application logo
└── src/
    ├── app/             # Next.js app router
    │   ├── globals.css  # Global styles
    │   ├── layout.tsx   # Root layout component
    │   ├── page.tsx     # Home page
    │   └── api/         # API routes
    │       └── convert/ # Conversion API endpoint
    │           └── route.ts
    ├── components/      # React components
    │   ├── converted-code.tsx # Displays converted Promela code
    │   ├── editor.tsx         # Code editor component
    │   ├── header.tsx         # Application header
    │   ├── output-panel.tsx   # Output display panel
    │   └── ui/               # UI components
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── resizable.tsx  # Resizable panel component
    │       ├── sonner.tsx     # Toast notifications
    │       └── tooltip.tsx
    └── lib/
        └── utils.ts      # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- OpenRouter API key (for code conversion functionality)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rit3sh-x/C-to-Promela
   cd C-to-Promela
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`:
     ```bash
     cp .env.example .env.local
     ```
   - Replace `your_openrouter_api_key` with your actual OpenRouter API key in `.env.local`
   - Enable training in your OpenRouter account settings at https://openrouter.ai/settings/privacy for optimal conversion results

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. Enter your C code in the left panel editor.
2. The application will automatically convert your code to Promela.
3. View the converted Promela code in the right panel.
4. Use the copy button to copy the converted code to your clipboard.

## Acknowledgments

- [SPIN Model Checker](http://spinroot.com/) for Promela verification
- [Shadcn UI](https://ui.shadcn.com/) for the UI components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor