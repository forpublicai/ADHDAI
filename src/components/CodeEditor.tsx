import './CodeEditor.css';

interface CodeEditorProps {
  code: string;
}

export default function CodeEditor({ code }: CodeEditorProps) {
  return (
    <div className="code-editor">
      <div className="code-editor-header">
        <span>Generated Ad Code</span>
      </div>
      <div className="code-editor-content">
        <pre><code>{code || '// Code will appear here as agents work...'}</code></pre>
      </div>
    </div>
  );
}
