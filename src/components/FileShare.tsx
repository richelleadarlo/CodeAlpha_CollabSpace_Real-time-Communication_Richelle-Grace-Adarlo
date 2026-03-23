import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { SharedFile } from '@/data/mockData';
import { FileText, Upload, Download } from 'lucide-react';

interface FileShareProps {
  files: SharedFile[];
  onUpload: (file: File) => Promise<void> | void;
  onDownload: (file: SharedFile) => Promise<void> | void;
  isUploading?: boolean;
}

const iconForType = (type: string) => {
  return <FileText className="w-5 h-5 text-primary" />;
};

export default function FileShare({ files, onUpload, onDownload, isUploading = false }: FileShareProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    await onUpload(picked);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground text-lg">Shared Files</h2>
        <button
          onClick={handlePickFile}
          disabled={isUploading}
          className="control-btn-primary w-8 h-8 rounded-lg disabled:opacity-60"
        >
          <Upload className="w-4 h-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {files.length === 0 && (
          <p className="text-sm text-muted-foreground px-1 py-2">No shared files yet. Upload one to get started.</p>
        )}
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
            <button
              onClick={() => onDownload(file)}
              className="control-btn-default w-8 h-8 rounded-lg shrink-0"
              aria-label={`Download ${file.name}`}
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
