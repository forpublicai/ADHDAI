import { useEffect, useRef } from 'react';
import './LivePreview.css';

interface LivePreviewProps {
  code: string;
}

export default function LivePreview({ code }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current && code) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(code);
        doc.close();
      }
    }
  }, [code]);

  return (
    <div className="live-preview">
      <div className="preview-header">
        <span>Live Preview</span>
      </div>
      <div className="preview-content">
        {code ? (
          <iframe
            ref={iframeRef}
            title="preview"
            className="preview-iframe"
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="preview-empty">
            <p>Preview will appear here as the ad is generated...</p>
          </div>
        )}
      </div>
    </div>
  );
}
