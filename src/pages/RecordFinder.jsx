import React, { useState } from 'react';
import Layout from './Layout';
import "../styles/dashboard.css";
import ExcelJS from 'exceljs';

const RecordFinder = () => {
  const [file, setFile] = useState(null);
  const [txtData, setTxtData] = useState('');
  const [excelFile, setExcelFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTxtData(e.target.result);
      };
      reader.readAsText(file);
      setFile(file);
    }
  };

  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
  };

  const updateSwitchFile = async () => {
    if (!excelFile) {
      alert('Please select an Excel file first');
      return;
    }

    // Parse text file data (columns A to N only)
    const rows = txtData.split('\n')
      .map((line) => line.split(';').slice(0, 14))
      .filter(row => row.length > 0);

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(excelFile);
      const worksheet = workbook.getWorksheet('detail');

      if (worksheet) {
        const templateRow = worksheet.getRow(2);
        const templateCellStyles = {};

        templateRow.eachCell((cell, colNumber) => {
          templateCellStyles[colNumber] = cell.style;
        });

        rows.forEach((row, rowIdx) => {
          const currentRow = worksheet.getRow(rowIdx + 2);
          
          // Set values for columns A to N
          row.forEach((value, colIdx) => {
            const cell = currentRow.getCell(colIdx + 1);
            cell.value = value;
            cell.style = templateCellStyles[colIdx + 1];
          });
        
          // Apply formulas for other columns (O to V)
          for (let col = 15; col <= worksheet.columnCount; col++) {
            const cell = currentRow.getCell(col);
            const templateCell = templateRow.getCell(col);
        
            if (templateCell && templateCell.formula) {
              cell.style = templateCell.style;
              
              // Update formula while preserving constant values
              let formula = templateCell.formula;
              
              // This regex matches cell references (letter followed by number)
              // but not standalone numbers
              formula = formula.replace(/([A-Za-z]+)(\d+)/g, (match, column, row) => {
                // Keep the column letter and update the row number
                const newRow = parseInt(row) + rowIdx;
                return column + newRow;
              });
              
              cell.value = { formula };
            }
          }
          
          currentRow.commit();
        });
        
        const summarySheet = workbook.getWorksheet('summary');
        if (summarySheet) {
          const currentDate = new Date();
          const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, '');
          const dateCell = summarySheet.getCell(5, 4);
          dateCell.value = formattedDate;
          dateCell.style = templateRow.getCell(4).style;
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = excelFile.name.split('.')[0] + '_updated.xlsx';
      link.click();
      
      alert('Excel file updated successfully!');

    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file: ' + error.message + '\nPlease ensure the file is valid and not corrupted.');
    }
  };

  return (
    <Layout>
      <div className="content-header">
        <h1>Record Finder Content</h1>
      </div>

      <div className="file-upload-section">
        <div className="mb-4">
          <label className="block mb-2">Step 1: Upload Text File</label>
          <input
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="mb-2"
          />
          {file && <p>Text File: {file.name}</p>}
        </div>

        <div className="mb-4">
          <label className="block mb-2">Step 2: Select Excel File to Update</label>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleExcelFileChange}
            className="mb-2"
          />
          {excelFile && <p>Excel File: {excelFile.name}</p>}
        </div>

        <button
          onClick={updateSwitchFile}
          disabled={!file || !excelFile}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Update Excel File
        </button>
      </div>
    </Layout>
  );
};

export default RecordFinder;