"use client";

import { useState, useRef } from 'react';
import Editor from '@/components/editor';
import Header from '@/components/header';
import OutputPanel from '@/components/output-panel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { toast } from 'sonner';

export default function CodeConverter() {
  const [cCode, setCCode] = useState("");
  const [promelaCode, setPromelaCode] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleCodeChange = (value: string | undefined) => {
    setCCode(value || '');
  };

  const handleCopy = () => {
    if (promelaCode) {
      navigator.clipboard.writeText(promelaCode);
      toast('Copied!', { description: 'Promela code copied to clipboard.' });
    } else {
      toast('Nothing to copy!', { description: 'No Promela code available.' });
    }
  };

  const handleConvert = async () => {
    if (!cCode.trim()) {
      toast('Error', { description: 'Please enter C code to convert.' });
      return;
    }

    console.log('Converting C code to Promela:', cCode);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsConverting(true);
    setPromelaCode("");

    try {
      console.log('Sending request to /api/convert...');
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cCode }),
        signal: abortControllerRef.current.signal,
      });

      console.log('API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert C code');
      }

      const data = await response.json();
      console.log('Received complete response');
      setPromelaCode(data.promelaCode);
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      console.error('Conversion error:', error);
      toast('Error', {
        description: error instanceof Error ? error.message : 'Failed to convert C code',
      });
    } finally {
      console.log('Conversion process completed, isConverting set to false');
      setIsConverting(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <Header onCopy={handleCopy} onConvert={handleConvert} isConverting={isConverting}/>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 rounded-lg border bg-card"
      >
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full p-1">
            <div className="rounded-md overflow-hidden h-full">
              <Editor
                value={cCode}
                onChange={handleCodeChange}
              />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full p-1">
            <div className="rounded-md overflow-hidden h-full">
              <OutputPanel
                value={promelaCode}
                isLoading={isConverting}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}