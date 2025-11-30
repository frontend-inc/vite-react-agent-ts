import React from 'react';

interface ErrorAlertProps {
  error: string | null;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 rounded-lg p-4 mb-4 border border-red-200 flex items-start gap-3">
      <i className="ri-error-warning-line text-xl text-red-600 flex-shrink-0 mt-0.5"></i>
      <div>
        <p className="font-medium text-red-900">Error</p>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    </div>
  );
};

export default ErrorAlert;
