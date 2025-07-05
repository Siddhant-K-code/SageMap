'use client';

import { useState, useEffect } from 'react';
import { BeliefGraph } from './BeliefGraph';
import { SimpleBeliefGraph } from './SimpleBeliefGraph';

interface GraphWrapperProps {
  key?: number;
}

export function GraphWrapper({ key }: GraphWrapperProps) {
  const [useSimpleGraph, setUseSimpleGraph] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment and if the advanced graph can load
    if (typeof window !== 'undefined') {
      try {
        // Try to detect if we can use the advanced graph
        setUseSimpleGraph(false);
      } catch (error) {
        console.warn('Advanced graph not available, using simple graph:', error);
        setUseSimpleGraph(true);
      }
    }
  }, []);

  // Error boundary for the advanced graph
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => {
      console.warn('Advanced graph failed, switching to simple graph');
      setUseSimpleGraph(true);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (useSimpleGraph || hasError) {
    return <SimpleBeliefGraph />;
  }

  try {
    return <BeliefGraph key={key} />;
  } catch (error) {
    console.warn('BeliefGraph failed to render, using SimpleBeliefGraph:', error);
    return <SimpleBeliefGraph />;
  }
}
