import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { FaFileUpload } from 'react-icons/fa';
import "../styles/dashboard.css";
import Layout from './Layout';

const Dashboard = () => {
  const { t } = useTranslation();
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [comparedData, setComparedData] = useState(null);

  const handleFileUpload = (e, fileNumber) => {
    const file = e.target.files[0];
    if (file) {
      fileNumber === 1 ? setFile1(file) : setFile2(file);
    }
  };

  const handleWrapperClick = (fileNumber) => {
    if (fileNumber === 1) {
      document.getElementById("fileInput1").click();
    } else {
      document.getElementById("fileInput2").click();
    }
  };

  const handleCompare = () => {
    if (!file1 || !file2) {
      alert(t('please_upload'));
      return;
    }

    const reader1 = new FileReader();
    const reader2 = new FileReader();

    reader1.onload = (e) => {
      const workbook1 = XLSX.read(e.target.result, { type: 'binary' });
      const sheet1 = workbook1.Sheets[workbook1.SheetNames[0]];
      const data1 = XLSX.utils.sheet_to_json(sheet1);

      reader2.onload = (e) => {
        const workbook2 = XLSX.read(e.target.result, { type: 'binary' });
        const sheet2 = workbook2.Sheets[workbook2.SheetNames[0]];
        const data2 = XLSX.utils.sheet_to_json(sheet2);

        const compared = data1.map((row1, index) => {
          const row2 = data2[index] || {};
          const comparedRow = {};
          Object.keys(row1).forEach((key) => {
            comparedRow[key] = row1[key] === row2[key] ? row1[key] : `${row1[key]} / ${row2[key]}`;
          });
          return comparedRow;
        });

        setComparedData(compared);
        generateExcel(compared);
      };

      reader2.readAsBinaryString(file2);
    };

    reader1.readAsBinaryString(file1);
  };

  const generateExcel = (data) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Compared Data');

    const excelFile = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelFile], { type: 'application/octet-stream' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'compared_data.xlsx';
    link.click();
  };

  return (
    <Layout>
      <div className="content-header">
        <h1>{t('file_comparison')}</h1>
      </div>

      <div className="comparison-box">
        <h2>{t('upload_files')}</h2>
        <div className="file-upload-container">
          <div className="file-input">
            <label>{t('file1')}</label>
            <div className="file-upload-wrapper" onClick={() => handleWrapperClick(1)}>
              <FaFileUpload className="upload-icon" />
              <span>{file1 ? file1.name : t('Click to Upload')}</span>
              <input
                id="fileInput1"
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleFileUpload(e, 1)}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="file-input">
            <label>{t('file2')}</label>
            <div className="file-upload-wrapper" onClick={() => handleWrapperClick(2)}>
              <FaFileUpload className="upload-icon" />
              <span>{file2 ? file2.name : t('Click to Upload')}</span>
              <input
                id="fileInput2"
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => handleFileUpload(e, 2)}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <button className="compare-button" onClick={handleCompare}>
            {t('compare_files')}
          </button>
        </div>
      </div>

      {comparedData && (
        <div className="comparison-results">
          <h3>{t('comparison_results')}</h3>
          <div className="results-container">
            <pre>{JSON.stringify(comparedData, null, 2)}</pre>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
