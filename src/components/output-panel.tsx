import { Editor as MonacoEditor } from '@monaco-editor/react';

interface OutputPanelProps {
  value: string;
  isLoading?: boolean;
}

export default function OutputPanel({value, isLoading = false }: OutputPanelProps) {
  const options = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on' as const,
    automaticLayout: true,
    padding: { top: 10 },
    wordWrap: 'on' as const,
    readOnly: true,
  };

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
      <div className="flex-1">
        <MonacoEditor
          language="promela"
          value={value}
          options={options}
          theme="vs-dark"
          className="h-full w-full"
          loading={isLoading ? "Loading..." : undefined}
        />
      </div>
    </div>
  );
}