import { useEffect, useState } from "react";
import axios from "axios";
import { Code2Icon, LoaderIcon, PlusIcon } from "lucide-react";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  // --- SURGICAL FIX: Fetch problems from API instead of local file ---
  const [problems, setProblems] = useState([]);
  const [isLoadingProblems, setIsLoadingProblems] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchProblems = async () => {
        setIsLoadingProblems(true);
        try {
          const res = await axios.get("http://localhost:8080/api/problems");
          if (res.data.success) {
            setProblems(res.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch problems for modal:", error);
        } finally {
          setIsLoadingProblems(false);
        }
      };
      fetchProblems();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl bg-base-100 shadow-2xl border border-base-300">
        <h3 className="font-bold text-2xl mb-6">Create New Session</h3>

        <div className="space-y-8">
          {/* PROBLEM SELECTION */}
          <div className="space-y-2">
            <label className="label">
              <span className="label-text font-semibold">Select Problem</span>
              <span className="label-text-alt text-error">*</span>
            </label>

            <div className="relative">
              <select
                className={`select select-bordered w-full ${isLoadingProblems ? 'opacity-50' : ''}`}
                value={roomConfig.problem}
                disabled={isLoadingProblems}
                onChange={(e) => {
                  const selectedProblem = problems.find((p) => p.title === e.target.value);
                  if (selectedProblem) {
                    setRoomConfig({
                      problemId: selectedProblem.id, // Store ID for the Judge
                      difficulty: selectedProblem.difficulty,
                      problem: e.target.value, // Keep Title for UI
                    });
                  }
                }}
              >
                <option value="" disabled>
                  {isLoadingProblems ? "Loading problems..." : "Choose a coding problem..."}
                </option>

                {problems.map((problem) => (
                  <option key={problem.id} value={problem.title}>
                    {problem.title} ({problem.difficulty})
                  </option>
                ))}
              </select>
              {isLoadingProblems && (
                <div className="absolute right-10 top-3">
                  <LoaderIcon className="size-4 animate-spin text-primary" />
                </div>
              )}
            </div>
          </div>

          {/* ROOM SUMMARY */}
          {roomConfig.problem && (
            <div className="alert alert-success bg-emerald-500/10 border-emerald-500/20 text-emerald-700">
              <Code2Icon className="size-5 text-emerald-600" />
              <div>
                <p className="font-semibold">Room Summary:</p>
                <p className="text-sm">
                  Problem: <span className="font-bold">{roomConfig.problem}</span>
                </p>
                <p className="text-sm">
                  Max Participants: <span className="font-bold">2 (1-on-1 session)</span>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose} disabled={isCreating}>
            Cancel
          </button>

          <button
            className="btn btn-primary gap-2 min-w-[120px]"
            onClick={onCreateRoom}
            disabled={isCreating || !roomConfig.problem || isLoadingProblems}
          >
            {isCreating ? (
              <LoaderIcon className="size-5 animate-spin" />
            ) : (
              <PlusIcon className="size-5" />
            )}
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
    </div>
  );
}

export default CreateSessionModal;