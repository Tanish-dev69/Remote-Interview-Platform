import { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import Navbar from "../components/Navbar";

// import { PROBLEMS } from "../data/problems"; // ❌ GONE
import { ChevronRightIcon, Code2Icon, Loader2Icon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. DYNAMIC FETCH LOGIC ---
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/problems");
        if (res.data.success) {
          setProblems(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load problems:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  // --- 2. PRESERVED STATS LOGIC ---
  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <Loader2Icon className="size-12 animate-spin text-primary" />
          <p className="font-mono text-slate-500 animate-pulse">Syncing challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Practice Problems</h1>
          <p className="text-base-content/70">
            Sharpen your coding skills with these curated problems
          </p>
        </div>

        {/* PROBLEMS LIST */}
        <div className="space-y-4">
          {problems.map((problem) => (
            <Link
              key={problem.id}
              to={`/problem/${problem.id}`}
              className="card bg-base-100 hover:scale-[1.01] transition-transform shadow-sm border border-base-300 hover:border-primary/50"
            >
              <div className="card-body">
                <div className="flex items-center justify-between gap-4">
                  {/* LEFT SIDE */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Code2Icon className="size-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="text-xl font-bold">{problem.title}</h2>
                          <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-base-content/60"> {problem.category}</p>
                      </div>
                    </div>
                    {/* Problem text now safely comes from the backend data */}
                    <p className="text-base-content/80 mb-3 line-clamp-2">
                      {problem.description?.text}
                    </p>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex items-center gap-2 text-primary">
                    <span className="font-medium">Solve</span>
                    <ChevronRightIcon className="size-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* STATS FOOTER (Preserved) */}
        <div className="mt-12 card bg-base-100 shadow-lg border border-base-300">
          <div className="card-body">
            <div className="stats stats-vertical lg:stats-horizontal bg-transparent">
              <div className="stat">
                <div className="stat-title text-base-content/60">Total Problems</div>
                <div className="stat-value text-primary">{problems.length}</div>
              </div>

              <div className="stat">
                <div className="stat-title text-base-content/60">Easy</div>
                <div className="stat-value text-success">{easyProblemsCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title text-base-content/60">Medium</div>
                <div className="stat-value text-warning">{mediumProblemsCount}</div>
              </div>
              <div className="stat">
                <div className="stat-title text-base-content/60">Hard</div>
                <div className="stat-value text-error">{hardProblemsCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemsPage;