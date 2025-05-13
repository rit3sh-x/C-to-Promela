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
- **Parser**: Jison (JavaScript parser generator)
- **API**: OpenRouter for model assistance

## Conversion Architecture

The C-to-Promela converter uses a multi-stage parsing and transformation pipeline:

1. **Preprocessing**: Cleans and prepares C code for parsing
2. **Parsing**: Uses a Jison-based parser to transform C syntax into Promela
3. **Postprocessing**: Refines the Promela output for better quality
4. **Model Assistance**: Leverages an LLM for final polishing and complex transformations

### Parser Implementation

The core of the conversion process is a Jison parser that implements a context-free grammar to transform C code to Promela:

- **Lexical Analysis**: Tokenizes C code using regular expression patterns defined in the grammar's lexical rules
- **Syntax Analysis**: Applies grammar rules to build an AST-like structure that preserves the semantic meaning
- **Code Generation**: Transforms the parsed structure into equivalent Promela constructs with appropriate formatting

The parser handles:
- Variable declarations and initializations with proper type mapping
- Function definitions (converted to Promela proctypes) with parameter passing
- Control structures (if-else, switch-case, loops) with semantic equivalence
- Expressions and operators with precedence preservation
- Structs and typedefs with name resolution
- Pointer operations with appropriate Promela equivalents

### State Machine Architecture

The parser implements a sophisticated state machine through the Jison `yy` context object that maintains critical state information during parsing:

#### Type System

- **User-defined Types Registry**: Maintains a dictionary of all types (built-in and user-defined) for correct type resolution
- **Anonymous Structure Handling**: Generates unique identifiers for unnamed structures to ensure they can be referenced properly
- **Type Checking**: Provides runtime validation of type compatibility during conversion

#### Contextual Tracking

- **Function Context**: Tracks the current function being processed to ensure proper proctype generation
- **Block Scoping**: Maintains awareness of nested blocks for variable scope handling
- **Switch Statement Context**: Preserves the switch expression for case statement generation
- **Loop Depth Tracking**: Monitors nesting level of loops for correct break/continue handling

#### Label Management

- **Label Generation**: Creates unique labels for control flow constructs that need goto statements in Promela
- **Jump Target Resolution**: Ensures all goto statements reference valid labels

#### Semantic Transformations

- **Control Flow Translation**: Intelligently transforms C control flow (including breaks and continues) into Promela equivalents
- **Pattern Recognition**: Identifies common C patterns and applies idiomatic Promela conversions
- **Indentation Management**: Maintains proper code formatting for the generated Promela

This state machine approach allows the parser to handle complex C constructs and produce semantically equivalent Promela code that preserves the original program's behavior while adapting to Promela's verification-oriented paradigm.

### Grammar Implementation Details

The grammar is implemented as a series of production rules in Backus-Naur Form (BNF) that define the syntax of C and map it to Promela:

- **Top-level Productions**: Handle program structure, function definitions, and global declarations
- **Statement Productions**: Process compound statements, conditionals, loops, and jumps
- **Expression Productions**: Handle the full C expression hierarchy with proper operator precedence
- **Type-related Productions**: Process declarations, type definitions, and struct specifications

Each production rule contains semantic actions (JavaScript code) that generate the corresponding Promela code, maintaining the original program's logic while adapting to Promela's syntax requirements.

Key grammar transformations include:
- Converting C functions to Promela proctypes
- Translating C loops to Promela do-statements with appropriate break conditions
- Mapping C switch-case statements to Promela if-fi constructs
- Converting C pointer operations to Promela equivalents
- Handling C's pre/post increment and decrement operators

This grammar-driven approach provides a systematic and reliable method to transform C code into verifiable Promela models while preserving the original program's semantics.

## API Endpoints

The application provides multiple conversion approaches:

- **/api/convert-v1**: Legacy conversion using a two-stage approach
- **/api/convert-v2**: Direct parsing with Jison followed by model assistance
- **/api/generate**: Auxiliary endpoint for code transformation

All endpoints stream results for responsive user experience.

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
    │       └── convert/ # Conversion API endpoints
    │           ├── route.ts
    │           ├── convert-v1/
    │           │   └── route.ts
    │           └── convert-v2/
    │               └── route.ts
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
    ├── lib/
    │   ├── grammar.ts    # Jison grammar definitions
    │   └── utils.ts      # Utility functions
    └── types/
        └── jison.d.ts    # TypeScript declarations for Jison
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

## Grammar Extension

To extend the grammar for more C language features:
1. Modify the lexical rules in `grammar.ts` to recognize new tokens
2. Add corresponding BNF production rules for the new syntax
3. Implement appropriate Promela code generation logic

## Acknowledgments

- [SPIN Model Checker](http://spinroot.com/) for Promela verification
- [Shadcn UI](https://ui.shadcn.com/) for the UI components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Jison](https://zaa.ch/jison/) for parser generation