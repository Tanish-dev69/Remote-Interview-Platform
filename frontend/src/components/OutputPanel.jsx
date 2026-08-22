import { CheckCircle2Icon, XCircleIcon, TerminalIcon, LayoutListIcon } from "lucide-react";

function OutputPanel({ activeTab, setActiveTab, testResults, output, error, isRunning }) {
  return (
    <div className="h-full flex flex-col bg-base-200/50 backdrop-blur-sm border-t border-base-300">
      {/* --- TABS HEADER (daisyUI tabs-boxed) --- */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-300/30">
        <div className="tabs tabs-boxed bg-transparent gap-2">
          <button
            onClick={() => setActiveTab("results")}
            className={`tab tab-sm gap-2 transition-all ${activeTab === "results" ? "tab-active !bg-primary !text-primary-content" : "text-base-content/60"}`}
          >
            <LayoutListIcon className="size-3.5" />
            Test Results
          </button>
          <button
            onClick={() => setActiveTab("console")}
            className={`tab tab-sm gap-2 transition-all ${activeTab === "console" ? "tab-active !bg-primary !text-primary-content" : "text-base-content/60"}`}
          >
            <TerminalIcon className="size-3.5" />
            Console
          </button>
        </div>
        
        {isRunning && (
          <span className="loading loading-spinner loading-xs text-primary mr-2"></span>
        )}
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {activeTab === "results" ? (
          /* TEST RESULTS TAB */
          <div className="space-y-3">
            {testResults && testResults.length > 0 ? (
              testResults.map((test, index) => (
                <div 
                  key={test.id} 
                  className={`alert shadow-lg bg-base-100 border-l-4 transition-all hover:translate-x-1 ${
                    test.passed ? 'border-l-success' : 'border-l-error'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-xl ${test.passed ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        {test.passed ? <CheckCircle2Icon className="size-5" /> : <XCircleIcon className="size-5" />}
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase opacity-40 tracking-[0.2em] mb-0.5">
                          Sequence_{index + 1}
                        </div>
                        <div className="font-bold text-sm tracking-tight">
                          {test.passed ? "Test Passed Successfully" : "Validation Failed"}
                        </div>
                      </div>
                    </div>
                    <div className={`badge badge-sm font-mono font-black ${test.passed ? 'badge-success outline-none border-none' : 'badge-error'}`}>
                      {test.passed ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                <LayoutListIcon className="size-12 mb-2" />
                <p className="font-mono text-sm uppercase tracking-widest">Awaiting Execution...</p>
              </div>
            )}
          </div>
        ) : (
          /* CONSOLE TAB (daisyUI mock-terminal) */
          <div className="mock-terminal bg-[#0d130d] border border-white/5 h-full rounded-xl shadow-2xl">
            <div className="px-5 py-2 font-mono text-xs leading-relaxed overflow-x-hidden">
              <div className="flex gap-2 text-primary/60 mb-2">
                <span className="opacity-50 select-none">$</span>
                <span className="animate-pulse">initializing_env...</span>
              </div>
              
              {output && (
                <pre className="text-base-content/90 whitespace-pre-wrap break-all leading-6">
                  {output}
                </pre>
              )}
              
              {error && (
                <div className="mt-2 p-3 bg-error/10 border border-error/20 rounded-lg">
                  <pre className="text-error whitespace-pre-wrap break-all font-bold italic">
                    {error}
                  </pre>
                </div>
              )}
              
              {!output && !error && (
                <p className="text-base-content/20 italic mt-4">No output recorded.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;