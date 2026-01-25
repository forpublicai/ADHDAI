import { useEffect, useRef, useState } from 'react';
import './LivePreview.css';

interface LivePreviewProps {
  code: string;
  campaignDeliverables?: string;
}

export default function LivePreview({ code, campaignDeliverables }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState<'ad' | 'deliverables'>('ad');

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        const contentToShow = activeTab === 'deliverables' && campaignDeliverables 
          ? campaignDeliverables 
          : code;
        doc.write(contentToShow || '');
        doc.close();
      }
    }
  }, [code, campaignDeliverables, activeTab]);

  const hasDeliverables = !!campaignDeliverables;

  return (
    <div className="live-preview">
      <div className="preview-header">
        <span>Live Preview</span>
        {hasDeliverables && (
          <div className="preview-tabs">
            <button 
              className={activeTab === 'ad' ? 'active' : ''}
              onClick={() => setActiveTab('ad')}
            >
              Ad
            </button>
            <button 
              className={activeTab === 'deliverables' ? 'active' : ''}
              onClick={() => setActiveTab('deliverables')}
            >
              Campaign
            </button>
          </div>
        )}
      </div>
      <div className="preview-content">
        {(code || campaignDeliverables) ? (
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
