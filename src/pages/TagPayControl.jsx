import React, { useState, useRef } from 'react';
import Layout from './Layout';
import "../styles/dashboard.css";
import "../styles/reconcilationControl.css";
import { Download, PlayCircle, Upload } from 'lucide-react'; 
import ExcelJS from 'exceljs';

const TagPayControl = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [switchFileName, setSwitchFileName] = useState(null);
  const [switchFile, setSwitchFile] = useState(null);
  const [downloadedFile, setDownloadedFile] = useState(null);
  const [processedTagPayFile, setProcessedTagPayFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const switchFileInputRef = useRef(null);
 
  const downloadFromGoogleSheets = async () => {
    try {
      setIsProcessing(true);
      setStatusMessage('Downloading TransaccionesTagPayDummy.xlsx from Google Sheets...'); 
      const googleSheetsUrl = 'https://docs.google.com/spreadsheets/d/1Xp5A2MyrnQqcmnmG60SWJy4LyvIoks3B6LHu2uPdpG4/export?format=xlsx';
      const response = await fetch(googleSheetsUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob(); 
      const file = new File(
        [blob],
        'TransaccionesTagPayDummy.xlsx',
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );
      setDownloadedFile(file);
 
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'TransaccionesTagPayDummy.xlsx';
      link.click();
      URL.revokeObjectURL(link.href);
      setStatusMessage('TransaccionesTagPayDummy.xlsx successfully downloaded!');
    } catch (error) {
      console.error('Error downloading file:', error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };
 
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setUploadedFileName(file.name);
      setStatusMessage(`File "${file.name}" uploaded successfully!`);
    } else {
      setUploadedFile(null);
      setUploadedFileName(null);
      setStatusMessage('No file selected.');
    }
  };
 
  const handleSwitchFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSwitchFile(file);
      setSwitchFileName(file.name);
      setStatusMessage(`Switch file "${file.name}" uploaded successfully!`);
    } else {
      setSwitchFile(null);
      setSwitchFileName(null);
      setStatusMessage('No Switch file selected.');
    }
  };

  const processUploadedFile = async () => {
    if (!downloadedFile || !uploadedFile) {
      setStatusMessage('Error: Both downloaded and uploaded files are required.');
      return;
    }
    try {
      setIsProcessing(true);
      setProgress(0);
      setStatusMessage('Processing files and filtering data...');
      const downloadedBuffer = await downloadedFile.arrayBuffer();
      const uploadedBuffer = await uploadedFile.arrayBuffer();
      const downloadedWorkbook = new ExcelJS.Workbook();
      const uploadedWorkbook = new ExcelJS.Workbook();
      await downloadedWorkbook.xlsx.load(downloadedBuffer);
      await uploadedWorkbook.xlsx.load(uploadedBuffer);
      const downloadedSheet = downloadedWorkbook.getWorksheet('Transacciones');
      const uploadedSheet = uploadedWorkbook.getWorksheet('TAGPAY');
      const tagpayOKOriginalSheet = uploadedWorkbook.getWorksheet('TAGPAY OK');

      setProgress(20);

      if (!downloadedSheet || !uploadedSheet) {
        setStatusMessage('Error: Required sheets not found in either downloaded or uploaded file.');
        return;
      }
      if (!tagpayOKOriginalSheet) {
        setStatusMessage('Error: "TAGPAY OK" sheet not found in the uploaded file.');
        return;
      }
 
      const newWorkbook = new ExcelJS.Workbook();
      uploadedWorkbook.eachSheet((sheet, sheetId) => { 
        if (sheet.name !== 'TAGPAY' && sheet.name !== 'TAGPAY OK') {
          const newSheet = newWorkbook.addWorksheet(sheet.name, {
            properties: sheet.properties,
            pageSetup: sheet.pageSetup,
          });
          // Copy all rows including formatting
          sheet.eachRow((row, rowNumber) => {
            const newRow = newSheet.addRow(row.values);
            // Copy cell styles
            row.eachCell((cell, colNumber) => {
              const newCell = newRow.getCell(colNumber);
              newCell.style = Object.assign({}, cell.style);
              newCell.value = cell.value;
            });
            // Copy row height and formatting
            newRow.height = row.height;
          });
          // Copy column widths
          sheet.columns.forEach((col, index) => {
            if (col.width) {
              newSheet.getColumn(index + 1).width = col.width;
            }
          });
        }
      });

      setProgress(40);
      
      // Create the TAGPAY sheet with original formatting
      const newTagpaySheet = newWorkbook.addWorksheet('TAGPAY', {
        properties: uploadedSheet.properties,
        pageSetup: uploadedSheet.pageSetup,
      });
      // Copy the header row with formatting from the original TAGPAY sheet
      const tagpayHeaderRow = uploadedSheet.getRow(1);
      const newTagpayHeaderRow = newTagpaySheet.addRow(tagpayHeaderRow.values);
      // Copy header styles
      tagpayHeaderRow.eachCell((cell, colNumber) => {
        if (cell.value) {
          const newCell = newTagpayHeaderRow.getCell(colNumber);
          newCell.style = Object.assign({}, cell.style);
          newCell.value = cell.value;
        }
      });
      // Copy column widths
      uploadedSheet.columns.forEach((col, index) => {
        if (col.width) {
          newTagpaySheet.getColumn(index + 1).width = col.width;
        }
      });
      // Get the header names from both sheets for proper mapping
      const downloadedHeaders = [];
      downloadedSheet.getRow(1).eachCell((cell, colNumber) => {
        downloadedHeaders[colNumber] = cell.value;
      });
      const tagpayHeaders = [];
      tagpayHeaderRow.eachCell((cell, colNumber) => {
        tagpayHeaders[colNumber] = cell.value;
      }); 

      setProgress(50);
      
      // Copy data from downloaded sheet to TAGPAY sheet
      downloadedSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const rowValues = [];
          // Copy values from downloaded sheet to their corresponding positions in TAGPAY sheet
          row.eachCell((cell, colNumber) => {
            // Find matching header in TAGPAY sheet
            const headerName = downloadedHeaders[colNumber];
            const targetColIndex = tagpayHeaders.indexOf(headerName);
            if (targetColIndex > 0) {
              rowValues[targetColIndex] = cell.value;
            } else {
              // If header not found, use the same column index
              rowValues[colNumber] = cell.value;
            }
          });
          newTagpaySheet.addRow(rowValues);
        }
      });

      setProgress(60);
      
      // Create a new "TAGPAY OK" sheet with preserved formatting from the original
      const newTagpayOKSheet = newWorkbook.addWorksheet('TAGPAY OK', {
        properties: tagpayOKOriginalSheet.properties,
        pageSetup: tagpayOKOriginalSheet.pageSetup,
      });
      // Copy the header row with formatting from the original TAGPAY OK sheet
      const originalHeaderRow = tagpayOKOriginalSheet.getRow(1);
      const newHeaderRow = newTagpayOKSheet.addRow(originalHeaderRow.values);
      // Copy header styles
      originalHeaderRow.eachCell((cell, colNumber) => {
        if (cell.value) {
          const newCell = newHeaderRow.getCell(colNumber);
          newCell.style = Object.assign({}, cell.style);
          newCell.value = cell.value;
        }
      });
      // Copy column widths
      tagpayOKOriginalSheet.columns.forEach((col, index) => {
        if (col.width) {
          newTagpayOKSheet.getColumn(index + 1).width = col.width;
        }
      });

      setProgress(70);
      
      // Get the TAGPAY data and filter it - Using a more memory-efficient approach
      let tagpayDataCount = 0;
      
      // First pass to filter and sort
      const tagpayData = [];
      
      // Apply filtering criteria: Estado = "OK" (column 5) and Tipo = "DEBIT/CREDIT API" (column 10)
      newTagpaySheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const estado = row.getCell(5).value; // Column E (Estado)
          const tipo = row.getCell(10).value;  // Column J (Tipo)
          // Apply exact filtering criteria
          if (estado === 'OK' && tipo === 'DEBIT/CREDIT API') {
            // Only store necessary information for sorting
            tagpayData.push({
              rowNumber: rowNumber,
              columnG: row.getCell(7).value || ''
            });
            tagpayDataCount++;
          }
        }
      }); 

      // If no rows matched, provide a clear message
      if (tagpayData.length === 0) {
        setStatusMessage('Warning: No rows matched the filter criteria (Estado="OK" AND Tipo="DEBIT/CREDIT API")');
      } else { 
        // Sort by column G
        tagpayData.sort((a, b) => {
          let valueA = a.columnG;
          let valueB = b.columnG;
 
          if (valueA !== null && valueA !== undefined) {
            valueA = valueA.toString();
          } else {
            valueA = '';
          }

          if (valueB !== null && valueB !== undefined) {
            valueB = valueB.toString();
          } else {
            valueB = '';
          } 
          return valueA.localeCompare(valueB);
        });
      }

      setProgress(80);
      
      // Second pass to add rows in sorted order - more memory efficient
      for (let i = 0; i < tagpayData.length; i++) {
        const item = tagpayData[i];
        const originalRow = newTagpaySheet.getRow(item.rowNumber);
        const newRow = newTagpayOKSheet.addRow(originalRow.values);
        
        // Copy cell styles
        originalRow.eachCell((cell, colNumber) => {
          if (cell.value !== undefined) {
            const newCell = newRow.getCell(colNumber);
            newCell.style = Object.assign({}, cell.style);
          }
        });
        
        // Update progress periodically
        if (i % 100 === 0) {
          setProgress(80 + Math.floor((i / tagpayData.length) * 15));
          // Allow UI to update by yielding execution
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      // Clear memory
      tagpayData.length = 0;
      
      if (!newWorkbook.getWorksheet('GKN OK')) {
        newWorkbook.addWorksheet('GKN OK');
      }
      
      if (!newWorkbook.getWorksheet('GKN ERROR')) {
        newWorkbook.addWorksheet('GKN ERROR');
      } 

      setProgress(95);
      
      const updatedBuffer = await newWorkbook.xlsx.writeBuffer();
      const blob = new Blob([updatedBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const updatedFileName = `Updated_${uploadedFileName}`;
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = updatedFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Store the processed TagPay file for later use with the Switch file
      const processedFile = new File(
        [blob],
        updatedFileName,
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );
      setProcessedTagPayFile(processedFile);

      setStatusMessage(`Success! Created "${updatedFileName}" with ${tagpayDataCount} filtered rows in TAGPAY OK sheet, sorted by column G.`);
      setProgress(100);
    } catch (error) {
      console.error('Error processing files:', error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const processSwitchFile = async () => {
    if (!switchFile || !processedTagPayFile) {
      setStatusMessage('Error: Both Switch file and processed TagPay file are required.');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(0);
      setStatusMessage('Processing Switch file and updating TagPay file...');

      const switchBuffer = await switchFile.arrayBuffer();
      const tagpayBuffer = await processedTagPayFile.arrayBuffer();

      const switchWorkbook = new ExcelJS.Workbook();
      const tagpayWorkbook = new ExcelJS.Workbook();

      await switchWorkbook.xlsx.load(switchBuffer);
      await tagpayWorkbook.xlsx.load(tagpayBuffer);

      setProgress(10);

      // Get the Detail sheet from the Switch file
      const detailSheet = switchWorkbook.getWorksheet('detail');
      if (!detailSheet) {
        setStatusMessage('Error: "Detail" sheet not found in the Switch file.');
        return;
      } 
      
      // Count total rows for progress tracking
      const totalRows = detailSheet.rowCount;
      
      let gknOKSheet = tagpayWorkbook.getWorksheet('GKN OK');
      let gknErrorSheet = tagpayWorkbook.getWorksheet('GKN ERROR'); 
      
      if (gknOKSheet) {
        // Save properties and column widths
        const properties = Object.assign({}, gknOKSheet.properties);
        const pageSetup = Object.assign({}, gknOKSheet.pageSetup);
        const columnWidths = [];
        gknOKSheet.columns.forEach((col, index) => {
          if (col.width) {
            columnWidths[index] = col.width;
          }
        });
         
        tagpayWorkbook.removeWorksheet(gknOKSheet.id);
        gknOKSheet = tagpayWorkbook.addWorksheet('GKN OK', { properties, pageSetup }); 
        columnWidths.forEach((width, index) => {
          if (width) {
            gknOKSheet.getColumn(index + 1).width = width;
          }
        });
      } else {
        gknOKSheet = tagpayWorkbook.addWorksheet('GKN OK');
      }

      if (gknErrorSheet) {
        // Save properties and column widths
        const properties = Object.assign({}, gknErrorSheet.properties);
        const pageSetup = Object.assign({}, gknErrorSheet.pageSetup);
        const columnWidths = [];
        gknErrorSheet.columns.forEach((col, index) => {
          if (col.width) {
            columnWidths[index] = col.width;
          }
        }); 
        tagpayWorkbook.removeWorksheet(gknErrorSheet.id);
        gknErrorSheet = tagpayWorkbook.addWorksheet('GKN ERROR', { properties, pageSetup }); 
        columnWidths.forEach((width, index) => {
          if (width) {
            gknErrorSheet.getColumn(index + 1).width = width;
          }
        });
      } else {
        gknErrorSheet = tagpayWorkbook.addWorksheet('GKN ERROR');
      }

      setProgress(20);
      
      const headerRow = detailSheet.getRow(1); 
      let actualDateColIndex = -1;
      let paymentTypeColIndex = -1;
      let statusColIndex = -1;
      let tagpayClearingColIndex = -1;

      headerRow.eachCell((cell, colNumber) => {
        const headerValue = cell.value ? cell.value.toString().trim() : '';
        if (headerValue === 'FECHA REAL') {
          actualDateColIndex = colNumber;
        } else if (headerValue === 'TIP_PAGO') {
          paymentTypeColIndex = colNumber;
        } else if (headerValue === 'ESTADO') {
          statusColIndex = colNumber;
        } else if (headerValue === 'COMPENSO') {
          tagpayClearingColIndex = colNumber;
        }
      });

      if (
        actualDateColIndex === -1 || 
        paymentTypeColIndex === -1 || 
        statusColIndex === -1 || 
        tagpayClearingColIndex === -1
      ) {
        setStatusMessage('Error: Required columns not found in the Detail sheet.');
        return;
      } 
      
      const headerValues = [];
      for (let i = 1; i <= 13; i++) { // Columns A to M
        headerValues[i] = headerRow.getCell(i).value;
      }
      
      const gknOKHeaderRow = gknOKSheet.addRow(headerValues);
      const gknErrorHeaderRow = gknErrorSheet.addRow(headerValues);

      // Copy header styles
      headerRow.eachCell((cell, colNumber) => {
        if (colNumber <= 13 && cell.value) { // Only columns A to M
          const gknOKCell = gknOKHeaderRow.getCell(colNumber);
          const gknErrorCell = gknErrorHeaderRow.getCell(colNumber);
          
          gknOKCell.style = Object.assign({}, cell.style);
          gknErrorCell.style = Object.assign({}, cell.style);
          
          gknOKCell.value = cell.value;
          gknErrorCell.value = cell.value;
        }
      }); 

      setProgress(30);
      
      // Process data in chunks to prevent memory issues
      const CHUNK_SIZE = 1000; // Process 1000 rows at a time
      let okRowCount = 0;
      let errorRowCount = 0;
      
      // Function to process a range of rows
      const processRowChunk = async (startRow, endRow) => {
        const okRows = [];
        const errorRows = [];
        
        for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
          if (rowNumber <= totalRows) { // Make sure we don't exceed actual rows
            const row = detailSheet.getRow(rowNumber);
            
            if (rowNumber > 1) { // Skip header row
              const actualDate = row.getCell(actualDateColIndex).value;
              const paymentType = row.getCell(paymentTypeColIndex).value;
              const status = row.getCell(statusColIndex).value;
              const tagpayClearing = row.getCell(tagpayClearingColIndex).value;
     
              if (actualDate && paymentType && status !== undefined && tagpayClearing) { 
                const paymentTypeStr = paymentType.toString().trim();
                const statusStr = status.toString().trim();
     
                if (paymentTypeStr === 'EF') { 
                  const rowValues = [];
                  for (let i = 1; i <= 13; i++) {  
                    rowValues[i] = row.getCell(i).value;
                  }
     
                  if (statusStr === 'OK') {
                    okRows.push({
                      values: rowValues,
                      styles: row
                    });
                  } else if (statusStr === 'ERROR') {
                    errorRows.push({
                      values: rowValues,
                      styles: row
                    });
                  }
                }
              }
            }
          }
        }
        
        // Add ok rows to sheet
        for (const rowData of okRows) {
          const newRow = gknOKSheet.addRow(rowData.values);
          
          // Copy styles
          rowData.styles.eachCell((cell, colNumber) => {
            if (colNumber <= 13 && cell.value !== undefined) {
              const newCell = newRow.getCell(colNumber);
              newCell.style = Object.assign({}, cell.style);
            }
          });
        }
        
        // Add error rows to sheet
        for (const rowData of errorRows) {
          const newRow = gknErrorSheet.addRow(rowData.values);
          
          // Copy styles
          rowData.styles.eachCell((cell, colNumber) => {
            if (colNumber <= 13 && cell.value !== undefined) {
              const newCell = newRow.getCell(colNumber);
              newCell.style = Object.assign({}, cell.style);
            }
          });
        }
        
        okRowCount += okRows.length;
        errorRowCount += errorRows.length;
        
        // Free memory
        okRows.length = 0;
        errorRows.length = 0;
      };
      
      // Process the file in chunks
      for (let startRow = 2; startRow <= totalRows; startRow += CHUNK_SIZE) {
        const endRow = Math.min(startRow + CHUNK_SIZE - 1, totalRows);
        await processRowChunk(startRow, endRow);
        
        // Update progress
        const progressPercentage = 30 + Math.floor(((startRow + CHUNK_SIZE) / totalRows) * 50);
        setProgress(Math.min(progressPercentage, 80));
        
        // Allow UI to update by yielding execution
        await new Promise(resolve => setTimeout(resolve, 0));
        
        setStatusMessage(`Processing Switch file... Processed ${startRow + CHUNK_SIZE > totalRows ? totalRows : startRow + CHUNK_SIZE} of ${totalRows} rows`);
      }
      
      // Set column widths
      for (let i = 1; i <= 13; i++) {
        const originalWidth = detailSheet.getColumn(i).width;
        if (originalWidth) {
          // Only set if not already set
          if (!gknOKSheet.getColumn(i).width) {
            gknOKSheet.getColumn(i).width = originalWidth;
          }
          if (!gknErrorSheet.getColumn(i).width) {
            gknErrorSheet.getColumn(i).width = originalWidth;
          }
        }
      }

      setProgress(90);
      setStatusMessage("Creating final Excel file...");
      
      const finalBuffer = await tagpayWorkbook.xlsx.writeBuffer();
      const blob = new Blob([finalBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const finalFileName = `Final_${uploadedFileName}`;
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = finalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setProgress(100);
      setStatusMessage(`Success! Created "${finalFileName}" with ${okRowCount} rows in GKN OK sheet and ${errorRowCount} rows in GKN ERROR sheet.`);
    } catch (error) {
      console.error('Error processing Switch file:', error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="content-header">
        <h4 className="page-title">Tag Pay File Updation</h4>
      </div>
  
      <div className="file-upload-section">
        <div className="card p-6 mb-6 shadow-md">
          <div className="step-container">
            <h2 className="step-title">Step 1: Download Google Sheet</h2>
            <button
              className="step-btn download-btn"
              onClick={downloadFromGoogleSheets}
              disabled={isProcessing}
            >
              <Download size={18} />
              Download TransaccionesTagPay
            </button>
          </div>
  
          <div className="step-container">
            <h2 className="step-title">Step 2: Upload Sample TagPay File</h2>
            <button
              className="step-btn upload-btn"
              onClick={() => fileInputRef.current.click()}
              disabled={isProcessing}
            >
              <Upload size={18} />
              Select TagPay File
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden" 
            />
          </div>
  
          <div className="step-container">
            <h2 className="step-title">Step 3: Process Uploaded File</h2>
            <button
              className="step-btn process-btn"
              onClick={processUploadedFile}
              disabled={!uploadedFileName || !downloadedFile || isProcessing}
            >
              <PlayCircle size={18} className={isProcessing ? "animate-spin" : ""} />
              {isProcessing ? 'Processing...' : 'Update TagPay & TagPay Ok Sheet'}
            </button>
          </div>
  
          <div className="step-container">
            <h2 className="step-title">Step 4: Upload Switch File</h2>
            <button
              className="step-btn upload-btn"
              onClick={() => switchFileInputRef.current.click()}
              disabled={isProcessing}
            >
              <Upload size={18} />
              Select Switch File
            </button>
            <input
              type="file"
              ref={switchFileInputRef}
              accept=".xlsx, .xls"
              onChange={handleSwitchFileUpload}
              className="hidden" 
            />
          </div>
  
          <div className="step-container">
            <h2 className="step-title">Step 5: Process Switch File</h2>
            <button
              className="step-btn process-btn"
              onClick={processSwitchFile}
              disabled={!switchFileName || !processedTagPayFile || isProcessing}
            >
              <PlayCircle size={18} className={isProcessing ? "animate-spin" : ""} />
              {isProcessing ? 'Processing...' : 'Update GKN OK & GKN Error Sheet'}
            </button>
          </div>
  
          {/* Progress Bar */}
          {isProcessing && (
            <div className="progress-bar-container">
              <div className="progress-bar-background">
                <div className="progress-bar" style={{width: `${progress}%`}}></div>
              </div>
              <div className="progress-text">{progress}%</div>
            </div>
          )}
  
          {/* Status Message */}
          {statusMessage && (
            <div className={`status-message ${statusMessage.includes('Error') ? 'error-message' : 'success-message'}`}>
              {statusMessage}
            </div>
          )}
  
          {uploadedFileName && (
            <div className="file-info">
              <strong>Uploaded TagPay File:</strong> {uploadedFileName}
            </div>
          )}
  
          {switchFileName && (
            <div className="file-info">
              <strong>Uploaded Switch File:</strong> {switchFileName}
            </div>
          )}
  
          {downloadedFile && (
            <div className="file-info">
              <strong>Downloaded File:</strong> TransaccionesTagPayDummy.xlsx
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
  
};

export default TagPayControl;