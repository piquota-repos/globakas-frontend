import React, { useState, useRef, useCallback } from 'react';
import Layout from './Layout';
import ExcelJS from 'exceljs';
import { useTranslation } from 'react-i18next';
import { FaFileUpload } from 'react-icons/fa';

const workerCode = `
self.importScripts('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js');

// Optimized constants
const MAX_ROWS_PER_BATCH = 10000; // Increased batch size for fewer updates
const PROGRESS_UPDATE_FREQUENCY = 0.05; // Only update progress every 5% (reduces message passing overhead)

self.onmessage = async (e) => {
  const { txtFileData, excelFileData } = e.data;
  const startTime = performance.now();
  
  try {
    // Parse text data outside the main processing loop for better performance
    const rows = parseTextData(txtFileData);
    const totalRows = rows.length;
    
    // Load workbook
    const workbook = new self.ExcelJS.Workbook();
    await workbook.xlsx.load(excelFileData);
    const worksheet = workbook.getWorksheet('detail');
    
    if (!worksheet) {
      throw new Error('Could not find "detail" worksheet');
    }
    
    // Cache template information
    const templateInfo = cacheTemplateInfo(worksheet);
    
    // Process rows efficiently
    await processAllRows(rows, worksheet, templateInfo, totalRows);
    
    // Update summary sheet only once at the end
    updateSummarySheet(workbook, templateInfo.templateRow);
    
    // Get buffer and send back
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Log total processing time
    const processingTime = ((performance.now() - startTime) / 1000).toFixed(2);
    
    // Send explicit completion message - MOVED BELOW progress updates
    self.postMessage({
      type: 'complete',
      buffer: buffer,
      processingTime: processingTime,
      totalRows: totalRows
    });
    
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: error.message
    });
  }
};

// Optimized text parsing function
function parseTextData(txtFileData) {
  return txtFileData.split('\\n')
    .map(line => {
      // Only process non-empty lines
      if (line.trim().length === 0) return null;
      const parts = line.split(';');
      return parts.length > 0 ? parts.slice(0, 14) : null;
    })
    .filter(Boolean); // Remove null entries (empty lines)
}

// Cache all template information in one pass
function cacheTemplateInfo(worksheet) {
  const templateRow = worksheet.getRow(2);
  const templateCellStyles = {};
  const formulaColumns = [];
  const formulaTemplates = {};
  
  // Store template styles and identify formula columns
  templateRow.eachCell((cell, colNumber) => {
    templateCellStyles[colNumber] = cell.style;
    
    if (cell.formula) {
      formulaColumns.push(colNumber);
      formulaTemplates[colNumber] = cell.formula;
    }
  });
  
  return {
    templateRow,
    templateCellStyles,
    formulaColumns,
    formulaTemplates,
    columnCount: worksheet.columnCount
  };
}

// Process all rows with optimized batching
async function processAllRows(rows, worksheet, templateInfo, totalRows) {
  const { templateCellStyles, formulaColumns, formulaTemplates, columnCount } = templateInfo;
  
  let processedRows = 0;
  let lastReportedProgress = 0;
  let rowIndex = 2; // Excel starts at row 1, row 2 is template
  
  // Pre-compile the regex pattern outside the loop
  const formulaRegex = /([A-Za-z]+)(\\d+)/g;
  
  // Process rows in larger batches
  for (let i = 0; i < rows.length; i += MAX_ROWS_PER_BATCH) {
    const batchEndIndex = Math.min(i + MAX_ROWS_PER_BATCH, rows.length);
    const batch = rows.slice(i, batchEndIndex);
    const batchSize = batch.length;
    
    // Process batch in one operation
    processBatchOptimized(
      batch, 
      worksheet, 
      rowIndex, 
      templateCellStyles, 
      formulaColumns,
      formulaTemplates,
      formulaRegex,
      columnCount
    );
    
    rowIndex += batchSize;
    processedRows += batchSize;
    
    // Only report progress at certain intervals to reduce overhead
    const currentProgress = Math.floor((processedRows / totalRows) * 100);
    if (currentProgress >= lastReportedProgress + (PROGRESS_UPDATE_FREQUENCY * 100)) {
      self.postMessage({
        type: 'progress',
        processedRows,
        totalRows,
        progress: Math.min(currentProgress, 99) // Cap at 99% until fully complete
      });
      lastReportedProgress = currentProgress;
    }
    
    // Yield to the event loop occasionally to prevent blocking
    if (i % (MAX_ROWS_PER_BATCH * 5) === 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  // Send final progress update ONLY after all rows are processed
  // This should be the last progress message before the completion message
  self.postMessage({
    type: 'progress',
    processedRows: totalRows, // Ensure consistency 
    totalRows: totalRows,
    progress: 100
  });
}

// Optimized batch processing function
function processBatchOptimized(
  batch, 
  worksheet, 
  startRow, 
  templateCellStyles, 
  formulaColumns,
  formulaTemplates,
  formulaRegex,
  columnCount
) {
  batch.forEach((rowData, idx) => {
    const currentRow = worksheet.getRow(startRow + idx);
    const targetRowNum = startRow + idx;
    
    // Set values for columns A to N (1-14) in one loop
    rowData.forEach((value, colIdx) => {
      const cell = currentRow.getCell(colIdx + 1);
      cell.value = value;
      
      // Only apply style if it exists
      const style = templateCellStyles[colIdx + 1];
      if (style) {
        cell.style = style;
      }
    });
    
    // Apply formulas only to known formula columns (faster than checking each cell)
    formulaColumns.forEach(col => {
      if (col > 14) { // Only need to process columns after the data (O onwards)
        const cell = currentRow.getCell(col);
        
        // Apply formula with optimized row number calculation
        let formula = formulaTemplates[col].replace(
          formulaRegex,
          (match, column, row) => column + (parseInt(row) + targetRowNum - 2)
        );
        
        cell.value = { formula };
        
        // Apply style only if needed
        const style = templateCellStyles[col];
        if (style) {
          cell.style = style;
        }
      }
    });
    
    // Commit row to save changes
    currentRow.commit();
  });
}

// Update summary sheet function
function updateSummarySheet(workbook, templateRow) {
  const summarySheet = workbook.getWorksheet('summary');
  if (summarySheet) {
    const dateCell = summarySheet.getCell(5, 4);
    dateCell.value = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    // Only apply style if needed
    const style = templateRow.getCell(4).style;
    if (style) {
      dateCell.style = style;
    }
  }
}
`;

const RecordFinder = () => {
  const [file, setFile] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [processedRows, setProcessedRows] = useState(0);
  const [processingTime, setProcessingTime] = useState(null);
  const workerRef = useRef(null);
  const workerBlobURLRef = useRef(null);
  const { t } = useTranslation();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      countTotalRows(file);
    }
  };
  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    setExcelFile(file);
  };
  const countTotalRows = async (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const count = text.split('\n').filter(line => line.trim().length > 0).length;
      setTotalRows(count);
    };
    reader.readAsText(file);
  };
  const createWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    if (workerBlobURLRef.current) {
      URL.revokeObjectURL(workerBlobURLRef.current);
    }
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    workerBlobURLRef.current = URL.createObjectURL(blob);
    workerRef.current = new Worker(workerBlobURLRef.current);

    return workerRef.current;
  }, []);

  const updateSwitchFile = async () => {
    if (!file || !excelFile) {
      alert('Please select both files first');
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProcessedRows(0);
    setProcessingTime(null);

    try {
      const txtFileData = await readFileAsText(file);
      const excelFileData = await readFileAsArrayBuffer(excelFile);
      const worker = createWorker();
      worker.onmessage = (e) => {
        const { type, processedRows, totalRows, progress, buffer, message, processingTime } = e.data;
        console.log(type)
        if (type === 'progress') {
          setProcessedRows(processedRows);
          setProgress(progress);
        }
        else if (type === 'complete') {
          setProgress(100);
          setProcessedRows(totalRows);

          // Create download
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
          setTimeout(() => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${excelFile.name.split('.')[0]}_updated.xlsx`;
            document.body.appendChild(link); // Append to body for Firefox compatibility
            link.click();

            setTimeout(() => {
              URL.revokeObjectURL(link.href);
              document.body.removeChild(link);
            }, 500);

            if (processingTime) {
              setProcessingTime(processingTime);
            }

            alert(`Excel file updated successfully! Processed ${totalRows.toLocaleString()} rows in ${processingTime || 'N/A'} seconds.`);
            setProcessing(false);
          }, 200);
        }
        else if (type === 'error') {
          alert('Error processing file: ' + message);
          console.error('Error processing file:', message);
          setProcessing(false);
        }
      };
      worker.postMessage({
        txtFileData,
        excelFileData
      });

    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file: ' + error.message);
      setProcessing(false);
    }
  };

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const readFileAsArrayBuffer = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  React.useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }

      if (workerBlobURLRef.current) {
        URL.revokeObjectURL(workerBlobURLRef.current);
        workerBlobURLRef.current = null;
      }
    };
  }, []);

  return (
    <Layout>
      <div className="content-header">
        <h1>{t('Record_finder_content')}</h1>
      </div>
      <div className="comparison-box">
        <div className="file-input">
          <label>{t('Step1')}</label>
          <div className="file-upload-wrapper" onClick={() => document.getElementById('fileInput1').click()}>
            <FaFileUpload className="upload-icon" />
            <span>{file ? file.name : t('Click to Upload')}</span>
            <input
              id="fileInput1"
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              disabled={processing}
              style={{ display: 'none' }}
            />
          </div>
        </div>
        <br></br><br></br>
        <div className="file-input">
          <label>{t('Step2')}</label>
          <div className="file-upload-wrapper" onClick={() => document.getElementById('fileInput2').click()}>
            <FaFileUpload className="upload-icon" />
            <span>{excelFile ? excelFile.name : t('Click to Upload')}</span>
            <input
              id="fileInput2"
              type="file"
              accept=".xlsx"
              onChange={handleExcelFileChange}
              disabled={processing}
              style={{ display: 'none' }}
            />
          </div>
        </div><br></br>
        {processing && (
          <div className="space-y-2 mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              Processed {processedRows.toLocaleString()} of {totalRows.toLocaleString()} rows ({Math.round(progress)}%)
            </p>
          </div>
        )}

        {processingTime && !processing && (
          <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              Last processing completed in {processingTime} seconds
            </p>
          </div>
        )}

        <button
          onClick={updateSwitchFile}
          disabled={!file || !excelFile || processing}
          className="w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? 'Processing...' : t('Update_Excel_File')}
        </button>
      </div>
    </Layout>
  );
};

export default RecordFinder;