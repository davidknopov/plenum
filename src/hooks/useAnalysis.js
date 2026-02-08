import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const stages = [
  'Analyzing building geometry...',
  'Simulating daylight penetration...',
  'Calculating floor plate efficiency...',
  'Identifying dead zones...',
  'Generating feasibility report...',
];

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stage, setStage] = useState(0);
  const [stageText, setStageText] = useState('');
  const navigate = useNavigate();

  const runAnalysis = (buildingId) => {
    setIsAnalyzing(true);
    setStage(0);
    
    let currentStage = 0;
    const interval = setInterval(() => {
      setStageText(stages[currentStage]);
      setStage(currentStage + 1);
      currentStage++;
      
      if (currentStage >= stages.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsAnalyzing(false);
          navigate(`/analysis/${buildingId}`);
        }, 500);
      }
    }, 600);
  };

  return { isAnalyzing, stage, stageText, stagesTotal: stages.length, runAnalysis };
}
