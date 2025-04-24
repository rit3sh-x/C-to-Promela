import { Button } from '@/components/ui/button';
import { ClipboardCopy, Play, Github } from 'lucide-react';

interface HeaderProps {
  onConvert: () => void;
  onCopy: () => void;
  isConverting?: boolean;
}

export default function Header({ onCopy, onConvert, isConverting = false }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b">
      <h1 className="text-xl font-bold">C to Promela Converter</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          disabled={isConverting}
        >
          <ClipboardCopy className="h-4 w-4" />
          Copy Output
        </Button>
        <Button
          onClick={onConvert}
          disabled={isConverting}
          size="sm"
        >
          {isConverting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Converting...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Convert
            </>
          )}
        </Button>
        <Button asChild variant="outline" size="default">
          <a href="https://github.com/rit3sh-x/C-to-Promela" target="_blank" rel="noopener noreferrer" >
            <Github className="h-4 w-4" />
            View Repository
          </a>
        </Button>
      </div>
    </header>
  );
}