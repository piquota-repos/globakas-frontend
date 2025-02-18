import React from 'react';
import { Trash2 } from 'lucide-react';
import "../styles/reconcilationControl.css";

const ReconcilationDropDown = ({ onDelete, id }) => {
  return (
    <div className="dropdown-container">

      <div className="dropdown-item">
        <label htmlFor={`option1-${id}`} className="dropdown-label">Concilation</label>
        <select id={`option1-${id}`} className="dropdown-select">
          <option value="">Select Option 1</option>
          <option value="1">Option 1A</option>
          <option value="2">Option 1B</option>
          <option value="3">Option 1C</option>
        </select>
      </div>

      <div className="dropdown-item">
        <label htmlFor={`option2-${id}`} className="dropdown-label">Amount Column A</label>
        <select id={`option2-${id}`} className="dropdown-select">
          <option value="">Select Option 2</option>
          <option value="1">Option 2A</option>
          <option value="2">Option 2B</option>
          <option value="3">Option 2C</option>
        </select>
      </div>

      <div className="dropdown-item">
        <label htmlFor={`option3-${id}`} className="dropdown-label">Amount Column B</label>
        <select id={`option3-${id}`} className="dropdown-select">
          <option value="">Select Option 3</option>
          <option value="1">Option 3A</option>
          <option value="2">Option 3B</option>
          <option value="3">Option 3C</option>
        </select>
      </div>

      <button
        onClick={() => onDelete(id)}
        className="p-2 text-red-600 hover:text-red-800"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
};

export default ReconcilationDropDown;
