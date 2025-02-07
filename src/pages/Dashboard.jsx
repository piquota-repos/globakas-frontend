import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [comparedData, setComparedData] = useState(null);

  const handleFileUpload = (e, fileNumber) => {
    const file = e.target.files[0];
    if (file) {
      if (fileNumber === 1) {
        setFile1(file);
      } else {
        setFile2(file);
      }
    }
  };

  const handleCompare = () => {
    if (!file1 || !file2) {
      alert('Please upload both files.');
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
            if (row1[key] === row2[key]) {
              comparedRow[key] = row1[key];
            } else {
              comparedRow[key] = `${row1[key]} / ${row2[key]}`;
            }
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
    <div className="Dashboard">
      <h2>Dashboard</h2>
      <p>File Upload</p>

      <div>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => handleFileUpload(e, 1)}
        />
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => handleFileUpload(e, 2)}
        />
      </div>

      <button onClick={handleCompare}>Compare</button>

      {comparedData && (
        <div>
          <h3>Compared Data:</h3>
          <pre>{JSON.stringify(comparedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
