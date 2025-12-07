import React from 'react';
import "./RegisterForm.css";

const ProgressBar = ({ currentStep, totalSteps }) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-line" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
        
        {/* Paso 1 */}
        <div className="progress-step">
          <div className={`step-number ${1 <= currentStep ? 'active' : ''}`}>
            1
          </div>
          <div className="step-label">Información Personal</div>
        </div>
        
        {/* Paso 2 */}
        <div className="progress-step">
          <div className={`step-number ${2 <= currentStep ? 'active' : ''}`}>
            2
          </div>
          <div className="step-label">Dirección</div>
        </div>
        
        {/* Paso 3 */}
        <div className="progress-step">
          <div className={`step-number ${3 <= currentStep ? 'active' : ''}`}>
            3
          </div>
          <div className="step-label">Preferencias</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
