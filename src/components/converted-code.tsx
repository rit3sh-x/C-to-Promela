"use client";

import { useState, useRef } from 'react';
import Editor from '@/components/editor';
import Header from '@/components/header';
import OutputPanel from '@/components/output-panel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { toast } from 'sonner';
import { useRecoilState } from 'recoil';
import { promelaCode, cCode } from '@/utils/store';

export default function CodeConverter() {
  const [isLoading, setIsLoading] = useState(false);
  const [promelaCodeState, setPromelaCodeState] = useRecoilState(promelaCode);
  const [cCodeState, setCCodeState] = useRecoilState(cCode);

  const handleCodeChange = (value: string | undefined) => {
    setCCodeState(value || '');
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const res = await fetch("/api/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: cCodeState }),
    });

    if (!res.ok) throw new Error(res.statusText);

    const data = res.body;
    if (!data) return;

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let accumulatedCode = promelaCodeState;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value, { stream: true });
      const cleanedChunk = chunkValue.replace(/```(promela)?/g, '').replace(/^\s*promela\s*\n?/gm, '');
      if (cleanedChunk) {
        accumulatedCode += cleanedChunk;
        setPromelaCodeState(accumulatedCode);
      }
    }
    setIsLoading(false);
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
    <div className="flex flex-col h-screen w-full">
      <Header onCopy={handleCopy} onConvert={handleSubmit} isConverting={isLoading}/>
      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 rounded-lg border bg-card"
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
  );
}