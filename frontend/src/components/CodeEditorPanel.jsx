import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon } from "lucide-react";

// --- SURGICAL FIX: Define LANGUAGE_CONFIG locally to avoid the broken import ---
const LANGUAGE_CONFIG = {
  javascript: {
    name: "JavaScript",
    icon: "/javascript.png",
    monacoLang: "javascript",
  },
  python: {
    name: "Python",
    icon: "/python.png",
    monacoLang: "python",
  },
  java: {
    name: "Java",
    icon: "/java.png",
    monacoLang: "java",
  },
};

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
}) {
  return (
    <div className="h-full bg-base-300 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-base-100 border-t border-base-300">
        <div className="flex items-center gap-3">
          {/* Safety check added to prevent crash if language isn't loaded yet */}
          <img
            src={LANGUAGE_CONFIG[selectedLanguage]?.icon || "/javascript.png"}
            alt={LANGUAGE_CONFIG[selectedLanguage]?.name || "Language"}
            className="size-6"
          />
          <select 
            className="select select-sm font-sans" 
            value={selectedLanguage} 
            onChange={onLanguageChange}
          >
            {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
              <option key={key} value={key}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button 
          className="btn btn-primary btn-sm gap-2" 
          disabled={isRunning} 
          onClick={onRunCode}
        >
          {isRunning ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <PlayIcon className="size-4" />
              Run Code
            </>
          )}
        </button>
      </div>

      <div className="flex-1">
        <Editor
          height={"100%"}
          language={LANGUAGE_CONFIG[selectedLanguage]?.monacoLang || "javascript"}
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 16,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditorPanel;