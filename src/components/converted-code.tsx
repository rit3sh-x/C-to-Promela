"use client";

import { useState } from 'react';
import { Editor } from '@/components/editor';
import { Header } from '@/components/header';
import { OutputPanel } from '@/components/output-panel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { toast } from 'sonner';
import { useRecoilState, useRecoilValue } from 'recoil';
import { promelaCode, cCode, isLLM } from '@/utils/store';

export function CodeConverter() {
  const [isLoading, setIsLoading] = useState(false);
  const [promelaCodeState, setPromelaCodeState] = useRecoilState(promelaCode);
  const [cCodeState, setCCodeState] = useRecoilState(cCode);
  const isLLMState = useRecoilValue(isLLM);

  const handleCodeChange = (value: string | undefined) => {
    setCCodeState(value || '');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setPromelaCodeState('');

    const apiRoute = isLLMState ? '/api/convert-v1' : '/api/convert-v2';

    try {
      const res = await fetch(apiRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: cCodeState }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || res.statusText);
      }

      const data = res.body;
      if (!data) return;

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedCode = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });

        if (chunkValue) {
          accumulatedCode += chunkValue;
          const cleanedCode = accumulatedCode
            .replace(/```promela\n/gi, '')
            .replace(/promela\n/gi, '')
            .replace(/```/g, '')
            .replace(/\n{2,}/g, '\n')
            .replace(/<PROMELA_START>/gi, '')
            .replace(/<PROMELA_END>/gi, '');
          setPromelaCodeState(cleanedCode);
        }
      }
    } catch (error) {
      console.error('Conversion error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to convert code.';
      toast('Error!', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (promelaCode) {
      navigator.clipboard.writeText(promelaCodeState);
      toast('Copied!', { description: 'Promela code copied to clipboard.' });
    } else {
      toast('Nothing to copy!', { description: 'No Promela code available.' });
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#121212]">
      <Header onCopy={handleCopy} onConvert={handleSubmit} isConverting={isLoading} />
      <div className='w-[98%] h-[90%] mx-auto my-4 shadow-2xl'>
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 rounded-lg border border-neutral-800 bg-[#1a1a1a]"
        >
          <ResizablePanel defaultSize={50} minSize={30}>
            <div className="h-full p-1">
              <div className="rounded-md overflow-hidden h-full">
                <Editor
                  value={cCodeState}
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
                  isLoading={isLoading}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}