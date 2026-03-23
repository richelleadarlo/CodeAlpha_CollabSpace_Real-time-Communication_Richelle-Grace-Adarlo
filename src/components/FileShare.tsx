import type { SharedFile } from '@/data/mockData';
import { FileText, Upload, Download } from 'lucide-react';

interface FileShareProps {
  files: SharedFile[];
  onUpload: () => void;
}

const iconForType = (type: string) => {
  return <FileText className="w-5 h-5 text-primary" />;
};

export default function FileShare({ files, onUpload }: FileShareProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground text-lg">Shared Files</h2>
        <button onClick={onUpload} className="control-btn-primary w-8 h-8 rounded-lg">
          <Upload className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {files.map((file, i) => (
          <div
            key={file.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors animate-reveal"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {iconForType(file.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{file.size} · {file.sharedBy}</p>
            </div>
            <button className="control-btn-default w-8 h-8 rounded-lg shrink-0">
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
