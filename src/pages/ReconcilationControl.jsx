import React, { useState } from 'react';
import Layout from './Layout';
import "../styles/dashboard.css";
import "../styles/reconcilationControl.css";
import ReconcilationDropDown from '../components/ReconcilationDropDown';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReconcilationControl = () => {
  const { t } = useTranslation();

  const [dropdownSets, setDropdownSets] = useState([{ id: 1 }]);

  const addNewSet = () => {
    const newId = Math.max(...dropdownSets.map(set => set.id), 0) + 1;
    setDropdownSets([...dropdownSets, { id: newId }]);
  };

  const deleteSet = (id) => {
    if (dropdownSets.length > 1) {
      setDropdownSets(dropdownSets.filter(set => set.id !== id));
    }
  };

  return (
    <Layout>
      <div className="content-header">
        <h1>{t('reconciliation_setup')}</h1>
      </div>
      <div className='file-upload-section'>
        <button
          onClick={addNewSet}
          className="add-new-button flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} className="align-middle" />
          <span>{t('add_reconciliation')}</span>
        </button>
        <div className="space-y-4">
          {dropdownSets.map(set => (
            <ReconcilationDropDown
              key={set.id}
              id={set.id}
              onDelete={deleteSet}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ReconcilationControl;
