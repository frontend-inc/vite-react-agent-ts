import React from 'react';

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 rounded-lg p-6 mb-8 border border-red-200">
      <div className="flex items-start gap-3">
        <i className="ri-error-warning-line text-2xl text-red-600"></i>
        <div>
          <h3 className="font-semibold text-red-900 mb-1">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
