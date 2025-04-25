"use client";

import { useEffect, useState, useCallback } from 'react';
import { Editor as MonacoEditor } from '@monaco-editor/react';

interface EditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  readOnly?: boolean;
}

export default function Editor({ value, onChange, readOnly = false }: EditorProps) {
  const [code, setCode] = useState<string>(value);
  const [isMounted, setIsMounted] = useState(false);

  const stableOnChange = useCallback(onChange, [onChange]);

  useEffect(() => {
    setIsMounted(true);
    const saved = typeof window !== 'undefined' ? localStorage.getItem(`editor-c-code`) : null;
    if (saved) {
      setCode(saved);
      stableOnChange(saved);
    }
  }, [stableOnChange]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem(`editor-c-code`, code);
      stableOnChange(code);
    }
  }, [code, isMounted, stableOnChange]);

  const options = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on' as const,
    automaticLayout: true,
    padding: { top: 10 },
    wordWrap: 'on' as const,
    readOnly
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/50">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-medium">C Code</h3>
        </div>
      </div>
      <div className="flex-1">
        <MonacoEditor
          language="c"
          value={code}
          onChange={(val) => setCode(val ?? '')}
          options={options}
          theme="vs-dark"
          className="h-full w-full"
        />
      </div>
    </div>
  );
}