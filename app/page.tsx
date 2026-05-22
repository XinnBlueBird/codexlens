"use client";

import { useState, useRef, useCallback } from "react";
import {
  Search,
  Shield,
  Zap,
  Code2,
  RefreshCw,
  ChevronRight,
  Terminal,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const SAMPLE_CODE = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Usage
const result = fibonacci(40);
console.log(result);`;

const FEATURES = [
  {
    icon: Search,
    title: "Complexity Analysis",
    desc: "Cyclomatic complexity, maintainability index, and cognitive load scoring",
  },
  {
    icon: Shield,
    title: "Security Audit",
    desc: "Detect injection vectors, hardcoded secrets, unsafe patterns, and more",
  },
  {
    icon: Zap,
    title: "Performance Review",
    desc: "Identify bottlenecks, unnecessary allocations, and blocking operations",
  },
  {
    icon: Code2,
    title: "Refactoring Engine",
    desc: "Concrete before/after suggestions with idiomatic patterns",
  },
];

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Rust",
  "Go",
  "Java",
  "C++",
  "Solidity",
];

function detectLanguage(code: string): string {
  if (code.includes("def ") && code.includes(":")) return "Python";
  if (code.includes("fn ") && code.includes("->")) return "Rust";
  if (code.includes("func ") && code.includes("{")) return "Go";
  if (code.includes("contract ") && code.includes("pragma")) return "Solidity";
  if (code.includes(": ") && code.includes("interface ")) return "TypeScript";
  if (code.includes("public static") || code.includes("System.out")) return "Java";
  if (code.includes("#include") || code.includes("std::")) return "C++";
  return "JavaScript";
}

function countLines(code: string): number {
  return code.split("\n").filter((l) => l.trim().length > 0).length;
}

export default function Home() {
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = useCallback(async () => {
    if (!code.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysis("");
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setAnalysis(result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsAnalyzing(false);
    }
  }, [code, isAnalyzing]);

  const handleCopy = useCallback(() => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [analysis]);

  const handleLoadSample = useCallback(() => {
    setCode(SAMPLE_CODE);
  }, []);

  const lang = code.trim() ? detectLanguage(code) : null;
  const lines = code.trim() ? countLines(code) : 0;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
              <Code2 size={15} className="text-amber-500" />
            </div>
            <span className="text-sm font-semibold text-zinc-100 tracking-tight">
              CodexLens
            </span>
          </div>
          <div className="flex items-center gap-1">
            {LANGUAGES.map((l) => (
              <span
                key={l}
                className="hidden sm:inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-zinc-500"
              >
                {l}
              </span>
            ))}
            <span className="sm:hidden text-[10px] text-zinc-600">
              {LANGUAGES.length} languages
            </span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 pt-28 pb-20">
        {/* Hero */}
        <section className="mb-16 text-center animate-fade-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1">
            <Sparkles size={12} className="text-amber-500" />
            <span className="text-xs text-zinc-400">
              Powered by MiMo v2.5 Pro
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight mb-4">
            Code analysis
            <br />
            <span className="text-zinc-400">in seconds, not hours</span>
          </h1>
          <p className="text-base text-zinc-400 max-w-lg mx-auto leading-relaxed mb-8">
            Paste any code. Get instant complexity scoring, security audits,
            performance insights, and refactoring suggestions.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="#analyzer"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-black hover:bg-amber-400 transition-colors"
            >
              Analyze Code
              <ArrowRight size={14} />
            </a>
            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-5 py-2.5 text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
            >
              <Terminal size={14} />
              Load Sample
            </button>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-zinc-800/40 rounded-xl overflow-hidden animate-fade-in">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-[#09090b] p-5">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <f.icon size={16} className="text-amber-500" />
              </div>
              <h3 className="text-sm font-medium text-zinc-200 mb-1">
                {f.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </section>

        {/* Analyzer */}
        <section id="analyzer" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Panel */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  </div>
                  <span className="text-xs text-zinc-500 ml-2">Input</span>
                </div>
                <div className="flex items-center gap-2">
                  {lang && (
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-500">
                      {lang}
                    </span>
                  )}
                  {lines > 0 && (
                    <span className="text-[10px] text-zinc-600">
                      {lines} lines
                    </span>
                  )}
                </div>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                spellCheck={false}
                className="w-full h-[400px] resize-none bg-transparent px-4 py-3 text-sm text-zinc-200 font-mono leading-relaxed placeholder:text-zinc-600 focus:outline-none"
              />
              <div className="flex items-center justify-between border-t border-zinc-800/50 px-4 py-2.5">
                <button
                  onClick={handleLoadSample}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Load sample
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={!code.trim() || isAnalyzing}
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-medium text-black hover:bg-amber-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze
                      <ChevronRight size={12} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/20" />
                  </div>
                  <span className="text-xs text-zinc-500 ml-2">Analysis</span>
                </div>
                {analysis && (
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {copied ? (
                      <Check size={10} className="text-emerald-500" />
                    ) : (
                      <Copy size={10} />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
              </div>
              <div
                ref={outputRef}
                className="h-[400px] overflow-y-auto px-4 py-3"
              >
                {error ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="text-sm text-red-400 mb-1">
                        Analysis Failed
                      </div>
                      <div className="text-xs text-zinc-500">{error}</div>
                    </div>
                  </div>
                ) : analysis ? (
                  <div className="analysis-output text-sm text-zinc-300">
                    {analysis}
                    {isAnalyzing && (
                      <span className="streaming-cursor" />
                    )}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <Code2
                        size={28}
                        className="mx-auto mb-3 text-zinc-700"
                      />
                      <p className="text-xs text-zinc-600">
                        Paste code and click Analyze to get started
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-16 text-center animate-fade-in">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-8">
            How it works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { step: "01", label: "Paste code", desc: "Any language, any size" },
              { step: "02", label: "AI analysis", desc: "MiMo v2.5 Pro reasoning" },
              { step: "03", label: "Get insights", desc: "Scores, fixes, suggestions" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 text-[10px] font-mono text-amber-500 mb-3">
                  {s.step}
                </div>
                <div className="text-sm font-medium text-zinc-200 mb-0.5">
                  {s.label}
                </div>
                <div className="text-xs text-zinc-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8">
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 size={14} className="text-amber-500" />
            <span className="text-xs text-zinc-500">CodexLens</span>
          </div>
          <span className="text-[10px] text-zinc-600">
            Built with MiMo v2.5 Pro
          </span>
        </div>
      </footer>
    </div>
  );
}
