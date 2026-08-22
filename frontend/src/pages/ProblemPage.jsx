import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import Navbar from "../components/Navbar";
import ProblemDescription from "../components/ProblemDescription";
import OutputPanel from "../components/OutputPanel";
import CodeEditorPanel from "../components/CodeEditorPanel";

// API Bridge
import { executeCode } from "../lib/piston";

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // --- STATE MANAGEMENT ---
  const [problem, setProblem] = useState(null); 
  const [allProblems, setAllProblems] = useState([]); 
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(""); // Initialize as empty string
  const [error, setError] = useState("");
  const [testResults, setTestResults] = useState([]); // ✅ Explicitly track results
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("results");

  // 1. FETCH ALL PROBLEMS
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/problems");
        if (res.data.success) setAllProblems(res.data.data);
      } catch (err) {
        console.error("Failed to load problems list:", err);
      }
    };
    fetchAll();
  }, []);

  // 2. FETCH SPECIFIC PROBLEM DATA
  useEffect(() => {
    const fetchProblemDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:8080/api/problems/${id}`);
        const data = res.data.data;
        setProblem(data);
        
        if (data.starterCode?.[selectedLanguage]) {
          setCode(data.starterCode[selectedLanguage]);
        }
        // Reset state for new problem
        setOutput("");
        setError("");
        setTestResults([]);
      } catch (err) {
        console.error("Failed to load problem details:", err);
        toast.error("Problem not found");
        navigate("/problems");
      } finally {
        setLoading(false);
      }
    };
    fetchProblemDetails();
  }, [id, navigate, selectedLanguage]);

  // --- EVENT HANDLERS ---
  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const handleProblemChange = (newProblemId) => {
    navigate(`/problem/${newProblemId}`);
  };

  const triggerConfetti = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    // A mix of Forest Theme greens: Primary, Emerald, and Mint
    colors: ["#10b981", "#059669", "#34d399", "#a7f3d0", "#ffffff"],
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  // Cannon 1: Left Burst
  fire(0.25, {
    spread: 26,
    startVelocity: 55,
    angle: 60,
    origin: { x: 0, y: 0.8 }
  });

  // Cannon 2: Right Burst
  fire(0.2, {
    spread: 60,
    angle: 120,
    origin: { x: 1, y: 0.8 }
  });

  // Center "Celebration" Pop
  fire(0.35, {
    spread: 100,
    decay: 0.91,
    scalar: 0.8,
    origin: { y: 0.6 }
  });
};

  const handleRunCode = async () => {
    if (!code.trim()) return toast.error("Please write some code first!");
    
    setIsRunning(true);
    setOutput("");
    setError("");
    setTestResults([]);
    setActiveTab("results");

    try {
      const result = await executeCode(selectedLanguage, code, id);
      
      // ✅ Properly unpack the result object
      setOutput(result.output || "");
      setError(result.error || "");
      setTestResults(result.testResults || []);

      if (result.testResults?.length > 0) {
        const allPassed = result.testResults.every((res) => res.passed);
        if (allPassed) {
          triggerConfetti();
          toast.success("Accepted!", { icon: "🚀" });
        } else {
          toast.error("Wrong Answer.");
        }
      } else if (result.error) {
        setActiveTab("console");
        toast.error("Execution Error");
      }
    } catch (error) {
      console.error("Execution error:", error);
      toast.error("Network error: Could not connect to Judge");
    } finally {
      setIsRunning(false);
    }
  };

  if (loading) return (
    <div className="h-screen bg-base-100 flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary"></span>
    </div>
  );

  return (
    <div className="h-screen bg-base-100 flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={35} minSize={25}>
            <ProblemDescription
              problem={problem}
              currentProblemId={id}
              onProblemChange={handleProblemChange}
              allProblems={allProblems}
            />
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-base-300 hover:bg-emerald-500/50 transition-all cursor-col-resize" />

          <Panel defaultSize={65}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={65}>
                <CodeEditorPanel
                  selectedLanguage={selectedLanguage}
                  code={code}
                  isRunning={isRunning}
                  onLanguageChange={handleLanguageChange}
                  onCodeChange={setCode}
                  onRunCode={handleRunCode}
                />
              </Panel>

              <PanelResizeHandle className="h-1.5 bg-base-300 hover:bg-emerald-500/50 transition-all cursor-row-resize" />

              <Panel defaultSize={35}>
                <OutputPanel 
                   activeTab={activeTab}
                   setActiveTab={setActiveTab}
                   testResults={testResults} 
                   output={output} 
                   error={error}
                   isRunning={isRunning}
                />
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;