"use client";

import { Button } from '@/components/ui/button';
import { ClipboardCopy, Play, Github, Brain, Code2Icon, Eraser } from 'lucide-react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { isLLM, promelaCode } from '@/utils/store';

interface HeaderProps {
  onConvert: () => void;
  onCopy: () => void;
  isConverting?: boolean;
}

export function Header({ onCopy, onConvert, isConverting = false }: HeaderProps) {
  const [isLLMState, setIsLLMState] = useRecoilState(isLLM);
  const setPromelaCodeState = useSetRecoilState(promelaCode);
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <h1 className="text-xl font-bold text-neutral-100">C to Promela Converter</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPromelaCodeState('')}
          disabled={isConverting}
          className="cursor-pointer bg-neutral-700 text-white hover:bg-white hover:text-neutral-900 border-none"
        >
          <Eraser className="h-4 w-4" />
          Clear
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          disabled={isConverting}
          className="cursor-pointer bg-neutral-700 text-white hover:bg-white hover:text-neutral-900 border-none"
        >
          <ClipboardCopy className="h-4 w-4" />
          Copy Output
        </Button>
        <Button
          onClick={onConvert}
          disabled={isConverting}
          size="sm"
          className={`cursor-pointer bg-neutral-700 text-white hover:bg-white hover:text-neutral-900 ${isConverting ? 'opacity-50' : ''} border-none`}
        >
          {isConverting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Converting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Convert
            </>
          )}
        </Button>
        <Button
          onClick={() => setIsLLMState(prev => !prev)}
          size="sm"
          variant="outline"
          className="cursor-pointer bg-neutral-700 text-white hover:bg-white hover:text-neutral-900 border-none"
        >
          {isLLMState ? (
            <>
              <Brain className="h-4 w-4" />
              LLM Mode
            </>
          ) : (
            <>
              <Code2Icon className="h-4 w-4" />
              Regex Mode
            </>
          )}
        </Button>
        <Button asChild variant="outline" size="default" className="cursor-pointer bg-neutral-700 text-white hover:bg-white hover:text-neutral-900 border-none">
          <a href="https://github.com/rit3sh-x/C-to-Promela" target="_blank" rel="noopener noreferrer" >
            <Github className="h-4 w-4" />
            View Repository
          </a>
        </Button>
      </div>
    </header>
  );
}