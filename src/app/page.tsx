"use client";

import { useState } from "react";
import Header from "@/components/header";
import ContractInput from "@/components/contract-input";
import ResultsModal from "@/components/result-modal";
import { analyzeContract } from "@/utils/ai-prompt";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [contract, setContract] = useState("");
  const [results, setResults] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const analyze = async () => {
    setLoading(true);
    setIsModalOpen(true);
    try {
      const analysisResults = await analyzeContract(contract);
      setResults(analysisResults);
    } catch (error) {
      console.error('Error analyzing contract:', error);
      // Handle error state if needed
    } finally {
      setLoading(false);
    }
  };

  const fixIssues = async () => {
    // Implementation pending
    console.log("Fix issues functionality not implemented yet");
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-between p-24">
      <Header />
      <ContractInput
        contract={contract}
        setContract={setContract}
        analyze={analyze}
      />
      <ResultsModal
        isOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
        loading={loading}
        results={results}
        fixIssues={fixIssues}
      />
    </main>
  );
}