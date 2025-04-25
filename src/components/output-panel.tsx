"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useRecoilValue } from 'recoil';
import { promelaCode } from '@/utils/store';
import type { editor } from 'monaco-editor';

interface OutputPanelProps {
  isLoading?: boolean;
}

export default function OutputPanel({ isLoading = false }: OutputPanelProps) {
  const response = useRecoilValue(promelaCode);
  const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (
    editor: editor.IStandaloneCodeEditor, 
    monaco: typeof import('monaco-editor')
  ): void => {
    editorRef.current = editor;

    monaco.languages.register({ id: 'promela' });

    monaco.languages.setMonarchTokensProvider('promela', {
      tokenizer: {
        root: [
          [/\b(proctype|init|never|trace|notrace|ltl|mtype|active|priority|d_step|atomic|inline|hidden|show|typedef)\b/, 'keyword.control'],
          [/\b(if|fi|do|od|for|select|goto|break|skip|else)\b/, 'keyword.control'],
          [/\b(printf|assert|true|false)\b/, 'keyword'],
          [/\b(bit|bool|byte|short|int|chan|unless|timeout)\b/, 'keyword.type'],
          [/\b(len|run|enabled|np_|pc_value|full|empty|nempty|nfull)\b/, 'keyword.function'],
          [/[a-zA-Z_]\w*/, 'identifier'],
          [/\b\d+\b/, 'number'],
          [/\b0x[0-9a-fA-F]+\b/, 'number.hex'],
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
          [/\/\/.*$/, 'comment'],
          [/\/\*/, 'comment', '@comment'],
          [/[{}()\[\]]/, '@brackets'],
          [/::/, 'delimiter'],
          [/;/, 'delimiter'],
          [/[!&|^\-+*\/%<>]=?/, 'operator'],
          [/\->|\<->/, 'operator'],
          [/\++|\--/, 'operator'],
          [/\<<|\>>|\&\&|\|\|/, 'operator'],
        ],
        string: [
          [/[^\\"]+/, 'string'],
          [/\\./, 'string.escape'],
          [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
        ],
        comment: [
          [/[^\/*]+/, 'comment'],
          [/\/\*/, 'comment', '@push'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment'],
        ],
      },
    });

    monaco.editor.defineTheme('promela-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'keyword.control', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'keyword.type', foreground: '4EC9B0' },
        { token: 'keyword.function', foreground: 'DCDCAA' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'string.escape', foreground: 'D7BA7D' },
        { token: 'string.invalid', foreground: 'FF0000', fontStyle: 'underline' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'number.hex', foreground: 'B5CEA8' },
        { token: 'delimiter', foreground: 'D4D4D4' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: '@brackets', foreground: 'F8F8F2' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.lineHighlightBackground': '#2D2D30',
        'editorCursor.foreground': '#FFFFFF',
      },
    });

    monaco.editor.setModelLanguage(editor.getModel()!, 'promela');
    monaco.editor.setTheme('promela-dark');
    
    setIsEditorReady(true);
  };

  useEffect(() => {
    if (editorRef.current && isEditorReady) {
      const resizeEditor = (): void => {
        if (editorRef.current) {
          editorRef.current.layout();
        }
      };
      
      resizeEditor();
      window.addEventListener('resize', resizeEditor);
      
      return () => {
        window.removeEventListener('resize', resizeEditor);
      };
    }
  }, [isEditorReady]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/50">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">Promela</h3>
          {isLoading && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
        </div>
      </div>
      <div className="flex-1 rounded-b-lg overflow-hidden">
        <MonacoEditor
          height="100%"
          language="promela"
          value={response}
          onMount={handleEditorDidMount}
          theme="promela-dark"
          options={{
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            wordWrap: 'on',
            lineNumbers: 'on',
            readOnly: true,
            automaticLayout: true,
            padding: {
              top: 10,
            },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            renderLineHighlight: 'all',
            roundedSelection: true,
          }}
          loading={isLoading ? "Loading..." : undefined}
        />
      </div>
    </div>
  );
}