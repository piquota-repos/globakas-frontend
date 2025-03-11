import React, { useState, useRef } from 'react';
import Layout from './Layout';
import "../styles/dashboard.css";
import "../styles/reconcilationControl.css";
import { Download, PlayCircle, Upload } from 'lucide-react';
import ExcelJS from 'exceljs';
import { useTranslation } from 'react-i18next';



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
  const { t } = useTranslation();

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
          sheet.eachRow((row, rowNumber) => {
            const newRow = newSheet.addRow(row.values);
            row.eachCell((cell, colNumber) => {
              const newCell = newRow.getCell(colNumber);
              newCell.style = Object.assign({}, cell.style);
              newCell.value = cell.value;
            });
            newRow.height = row.height;
          });
          sheet.columns.forEach((col, index) => {
            if (col.width) {
              newSheet.getColumn(index + 1).width = col.width;
            }
          });
        }
      });
      setProgress(40);
      const newTagpaySheet = newWorkbook.addWorksheet('TAGPAY', {
        properties: uploadedSheet.properties,
        pageSetup: uploadedSheet.pageSetup,
      });
      const tagpayHeaderRow = uploadedSheet.getRow(1);
      const newTagpayHeaderRow = newTagpaySheet.addRow(tagpayHeaderRow.values);
      tagpayHeaderRow.eachCell((cell, colNumber) => {
        if (cell.value) {
          const newCell = newTagpayHeaderRow.getCell(colNumber);
          newCell.style = Object.assign({}, cell.style);
          newCell.value = cell.value;
        }
      });
      uploadedSheet.columns.forEach((col, index) => {
        if (col.width) {
          newTagpaySheet.getColumn(index + 1).width = col.width;
        }
      });
      const downloadedHeaders = [];
      downloadedSheet.getRow(1).eachCell((cell, colNumber) => {
        downloadedHeaders[colNumber] = cell.value;
      });
      const tagpayHeaders = [];
      tagpayHeaderRow.eachCell((cell, colNumber) => {
        tagpayHeaders[colNumber] = cell.value;
      });
      setProgress(50);
      downloadedSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rowValues = [];
          row.eachCell((cell, colNumber) => {
            const headerName = downloadedHeaders[colNumber];
            const targetColIndex = tagpayHeaders.indexOf(headerName);
            if (targetColIndex > 0) {
              rowValues[targetColIndex] = cell.value;
            } else {
              rowValues[colNumber] = cell.value;
            }
          });
          const newRow = newTagpaySheet.addRow(rowValues); 
          if (newRow.getCell(7).value !== null && newRow.getCell(7).value !== undefined) {
            // Convert to string with full precision
            const value = newRow.getCell(7).value;
            if (typeof value === 'number') {
              newRow.getCell(7).value = String(value);
            }
            newRow.getCell(7).numFmt = '@';
          }
        
        }
      });
      setProgress(60);
      const newTagpayOKSheet = newWorkbook.addWorksheet('TAGPAY OK', {
        properties: tagpayOKOriginalSheet.properties,
        pageSetup: tagpayOKOriginalSheet.pageSetup,
      });
      const originalHeaderRow = tagpayOKOriginalSheet.getRow(1);
      const newHeaderRow = newTagpayOKSheet.addRow(originalHeaderRow.values);
      originalHeaderRow.eachCell((cell, colNumber) => {
        if (cell.value) {
          const newCell = newHeaderRow.getCell(colNumber);
          newCell.style = Object.assign({}, cell.style);
          newCell.value = cell.value;
        }
      });
      tagpayOKOriginalSheet.columns.forEach((col, index) => {
        if (col.width) {
          newTagpayOKSheet.getColumn(index + 1).width = col.width;
        }
      });
      setProgress(70);
      let tagpayDataCount = 0;
      const tagpayData = [];
      newTagpaySheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const estado = row.getCell(5).value;
          const tipo = row.getCell(10).value;
          if (estado === 'OK' && tipo === 'DEBIT/CREDIT API') {
            tagpayData.push({
              rowNumber: rowNumber,
              columnG: row.getCell(7).value || ''
            });
            tagpayDataCount++;
          }
        }
      });
      if (tagpayData.length === 0) {
        setStatusMessage('Warning: No rows matched the filter criteria (Estado="OK" AND Tipo="DEBIT/CREDIT API")');
      } else {
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
      for (let i = 0; i < tagpayData.length; i++) {
        const item = tagpayData[i];
        const originalRow = newTagpaySheet.getRow(item.rowNumber);
        const newRow = newTagpayOKSheet.addRow(originalRow.values);
        originalRow.eachCell((cell, colNumber) => {
          if (cell.value !== undefined) {
            const newCell = newRow.getCell(colNumber);
            newCell.style = Object.assign({}, cell.style);
          }
        });
        if (newRow.getCell(7).value !== null && newRow.getCell(7).value !== undefined) {
          // Convert to string with full precision
          const value = newRow.getCell(7).value;
          if (typeof value === 'number') {
            newRow.getCell(7).value = String(value);  // Convert number to string
          }
          newRow.getCell(7).numFmt = '@';
        }
        if (i % 100 === 0) {
          setProgress(80 + Math.floor((i / tagpayData.length) * 15));
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
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

      const detailSheet = switchWorkbook.getWorksheet('detail');
      const tagpayOKSheet = tagpayWorkbook.getWorksheet('TAGPAY OK');
      const originalGKNOKSheet = tagpayWorkbook.getWorksheet('GKN OK');
      const originalGKNErrorSheet = tagpayWorkbook.getWorksheet('GKN ERROR');

      if (!detailSheet) {
        setStatusMessage('Error: "Detail" sheet not found in the Switch file.');
        return;
      }

      if (!tagpayOKSheet || !originalGKNOKSheet || !originalGKNErrorSheet) {
        setStatusMessage('Error: Required sheets not found in the processed TagPay file.');
        return;
      }

      // Load the uploaded original TagPay file to extract formulas
      const uploadedOriginalBuffer = await uploadedFile.arrayBuffer();
      const uploadedOriginalWorkbook = new ExcelJS.Workbook();
      await uploadedOriginalWorkbook.xlsx.load(uploadedOriginalBuffer);
      const originalTagpayOKSheet = uploadedOriginalWorkbook.getWorksheet('TAGPAY OK');

      if (!originalTagpayOKSheet) {
        setStatusMessage('Error: "TAGPAY OK" sheet not found in the uploaded original TagPay file.');
        return;
      }

      // Extract formulas from the second row (assuming formulas are consistent across rows)
      const formulaRow = originalTagpayOKSheet.getRow(2);

      // Define column indices to update
      const columnsToUpdate = [
        { letter: 'U', index: 21 },
        { letter: 'V', index: 22 },
        { letter: 'Z', index: 26 },
        { letter: 'AA', index: 27 },
        { letter: 'AB', index: 28 },
        { letter: 'AC', index: 29 },
        { letter: 'AD', index: 30 },
        { letter: 'AE', index: 31 },
        { letter: 'AF', index: 32 }
      ];

      // Store formulas from original sheet
      const columnFormulas = {};

      // Extract formulas from original sheet
      columnsToUpdate.forEach(col => {
        const cell = formulaRow.getCell(col.index);
        if (cell && cell.formula) {
          columnFormulas[col.letter] = cell.formula;
        }
      });

      const columnOIndex = 15; // Column O (assuming it's the 15th column)

      // Extract formulas from the original GKN OK and GKN ERROR sheets for column O
      let gknOKFormula = '';
      let gknErrorFormula = '';

      // Retrieve the formula from the first row in column O (assuming it is the same for all rows)
      const gknOKFormulaCell = originalGKNOKSheet.getRow(2).getCell(columnOIndex);
      const gknErrorFormulaCell = originalGKNErrorSheet.getRow(2).getCell(columnOIndex);

      if (gknOKFormulaCell && gknOKFormulaCell.formula) {
        gknOKFormula = gknOKFormulaCell.formula;
      }

      if (gknErrorFormulaCell && gknErrorFormulaCell.formula) {
        gknErrorFormula = gknErrorFormulaCell.formula;
      }

      // Now, process the data and apply the formula dynamically
      setProgress(20);

      const switchHeaderRow = detailSheet.getRow(1);
      let actualDateColIndex = -1;
      let paymentTypeColIndex = -1;
      let statusColIndex = -1;
      let tagpayClearingColIndex = -1;

      switchHeaderRow.eachCell((cell, colNumber) => {
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

      setProgress(30);

      const CHUNK_SIZE = 1000;
      let okRowCount = 0;
      let errorRowCount = 0;

      // Define totalRows
      const totalRows = detailSheet.rowCount;

      // Define the GKN OK and GKN ERROR sheets
      const gknOKSheet = tagpayWorkbook.getWorksheet('GKN OK') || tagpayWorkbook.addWorksheet('GKN OK');
      const gknErrorSheet = tagpayWorkbook.getWorksheet('GKN ERROR') || tagpayWorkbook.addWorksheet('GKN ERROR');

      const processRowChunk = async (startRow, endRow) => {
        const okRows = [];
        const errorRows = [];

        for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
          if (rowNumber <= totalRows) {
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

                  // Copy values matching the columns in the original GKN OK/ERROR sheet headers
                  const originalHeaderRow = statusStr === 'OK' ? originalGKNOKSheet.getRow(1) : originalGKNErrorSheet.getRow(1);
                  originalHeaderRow.eachCell((headerCell, colNumber) => {
                    const headerValue = headerCell.value;
                    const switchColIndex = Array.from(switchHeaderRow.values).indexOf(headerValue);

                    if (switchColIndex !== -1) {
                      rowValues[colNumber] = row.getCell(switchColIndex).value;
                    } else {
                      rowValues[colNumber] = null;
                    }
                  });

                  // Formula for column O
                  if (rowValues.length >= 14) {
                    const columnEValue = row.getCell(5).value || ''; // Column E
                    const columnFValue = row.getCell(6).value || ''; // Column F
                    rowValues[14] = `${columnEValue}${columnFValue}`.trim();
                  }

                  if (statusStr === 'OK') {
                    okRows.push({
                      values: rowValues,
                      row: row
                    });
                  } else if (statusStr === 'ERROR') {
                    errorRows.push({
                      values: rowValues,
                      row: row
                    });
                  }
                }
              }
            }
          }
        }

        // Add rows to GKN OK and GKN ERROR sheets
        for (const rowData of okRows) {
          const newRow = gknOKSheet.addRow(rowData.values);

          // Apply the formula dynamically for column O
          if (gknOKFormula) {
            const formulaString = gknOKFormula.replace(/N\d+/g, `N${newRow.number}`);
            const cell = newRow.getCell(columnOIndex);
            cell.value = { formula: formulaString };
          }
        }

        for (const rowData of errorRows) {
          const newRow = gknErrorSheet.addRow(rowData.values);

          // Apply the formula dynamically for column O
          if (gknErrorFormula) {
            const formulaString = gknErrorFormula.replace(/N\d+/g, `N${newRow.number}`);
            const cell = newRow.getCell(columnOIndex);
            cell.value = { formula: formulaString };
          }
        }

        okRowCount += okRows.length;
        errorRowCount += errorRows.length;
      };

      for (let startRow = 2; startRow <= totalRows; startRow += CHUNK_SIZE) {
        const endRow = Math.min(startRow + CHUNK_SIZE - 1, totalRows);
        await processRowChunk(startRow, endRow);

        const progressPercentage = 30 + Math.floor(((startRow + CHUNK_SIZE) / totalRows) * 50);
        setProgress(Math.min(progressPercentage, 80));

        await new Promise(resolve => setTimeout(resolve, 0));
        setStatusMessage(`Processing Switch file... Processed ${startRow + CHUNK_SIZE > totalRows ? totalRows : startRow + CHUNK_SIZE} of ${totalRows} rows`);
      }

      // Update the TAGPAY OK sheet with formulas for columns U, V, Z, AA, AB, AC, AD, AE, AF
      setProgress(85);
      setStatusMessage("Updating TAGPAY OK sheet with formulas...");

      // Skip the header row (row 1)
      for (let rowNumber = 2; rowNumber <= tagpayOKSheet.rowCount; rowNumber++) {
        const row = tagpayOKSheet.getRow(rowNumber);

        // Apply formulas to specific columns
        // Update this section in the processSwitchFile function
        // In the processSwitchFile function, replace the existing code for column Z formatting with this:
// Find this section in the columnsToUpdate.forEach loop

columnsToUpdate.forEach(col => {
  if (columnFormulas[col.letter]) {
    let formulaString = columnFormulas[col.letter];
    
    // Properly update row references in the formula
    // This pattern looks for column letters followed by numbers and only updates the numbers
    formulaString = formulaString.replace(/([A-Z]+)(\d+)/g, (match, column, rowNum) => {
      return `${column}${rowNumber}`;
    });
    
    const cell = row.getCell(col.index);
    
    // Apply the formula
    cell.value = { formula: formulaString };
    
    // For column Z specifically, get format from column A
    if (col.letter === 'Z') {
      // Get the format from column A of the same row
      const columnACell = row.getCell(1);  // Column A is index 1
      
      if (columnACell && columnACell.style && columnACell.style.numFmt) {
        // Apply column A's format to column Z
        cell.numFmt = columnACell.style.numFmt;
      } else {
        // If column A has no format, try to get format from original cell
        const originalCell = originalTagpayOKSheet.getRow(2).getCell(col.index);
        if (originalCell && originalCell.style && originalCell.style.numFmt) {
          cell.numFmt = originalCell.style.numFmt;
        } else {
          // Apply a default date format if none exists anywhere
          cell.numFmt = 'dd/mm/yyyy hh:mm:ss';
        }
      }
    }
  }
});

        if (rowNumber % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
          setStatusMessage(`Updating TAGPAY OK sheet... Processed ${rowNumber} of ${tagpayOKSheet.rowCount} rows`);
        }
      }

      setProgress(90);
      setStatusMessage("Creating final Excel file...");

      const finalBuffer = await tagpayWorkbook.xlsx.writeBuffer();
      const blob = new Blob([finalBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const finalFileName = `Final_TagPay.xlsx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      setStatusMessage(`Success! Created "${finalFileName}" with ${okRowCount} rows in GKN OK sheet, ${errorRowCount} rows in GKN ERROR sheet, and updated formulas in TAGPAY OK sheet for columns U, V, Z, AA, AB, AC, AD, AE, AF.`);
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
        <h4 className="page-title">{t('Tag_Pay_File_Updation')}</h4>
      </div>
      <div className="file-upload-section">
        <div className="card p-6 mb-6 shadow-md">
          <div className="step-container">
            <h2 className="step-title">{t('Step 1: Download_Google_Sheet')}</h2>
            <button
              className="step-btn download-btn"
              onClick={downloadFromGoogleSheets}
              disabled={isProcessing} >
              <Download size={18} />
              {t('Download_TransaccionesTagPay')}
            </button>
          </div>
          <div className="step-container">
            <h2 className="step-title">{t('Step 2: Upload_Sample_TagPay_File')}</h2>
            <button
              className="step-btn upload-btn"
              onClick={() => fileInputRef.current.click()}
              disabled={isProcessing}
            >
              <Upload size={18} />
              {t('Select_TagPay_File')}
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
            <h2 className="step-title">{t('Step 3: Process_Uploaded_File')}</h2>
            <button
              className="step-btn process-btn"
              onClick={processUploadedFile}
              disabled={!uploadedFileName || !downloadedFile || isProcessing}
            >
              <PlayCircle size={18} className={isProcessing ? "animate-spin" : ""} />
              {isProcessing ? 'Processing...' : t('Update_TagPay_&_TagPay_Ok_Sheet')}
            </button>
          </div>
          <div className="step-container">
            <h2 className="step-title">{t('Step 4: Upload_Switch_File')}</h2>
            <button
              className="step-btn upload-btn"
              onClick={() => switchFileInputRef.current.click()}
              disabled={isProcessing}
            >
              <Upload size={18} />
              {t('Select_Switch_File')}
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
            <h2 className="step-title">{t('Step 5: Process_Switch_File')}</h2>
            <button
              className="step-btn process-btn"
              onClick={processSwitchFile}
              disabled={!switchFileName || !processedTagPayFile || isProcessing}
            >
              <PlayCircle size={18} className={isProcessing ? "animate-spin" : ""} />
              {isProcessing ? 'Processing...' : t('Update_GKN_OK_&_GKN_Error_Sheet')}
            </button>
          </div>
          {isProcessing && (
            <div className="progress-bar-container">
              <div className="progress-bar-background">
                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-text">{progress}%</div>
            </div>
          )}
          {statusMessage && (
            <div className={`status-message ${statusMessage.includes('Error') ? 'error-message' : 'success-message'}`}>
              {statusMessage}
            </div>
          )}
          {uploadedFileName && (
            <div className="file-info">
              <strong>{t('Uploaded TagPay File:')}</strong> {uploadedFileName}
            </div>
          )}
          {switchFileName && (
            <div className="file-info">
              <strong>{t('Uploaded Switch File:')}</strong> {switchFileName}
            </div>
          )}
          {downloadedFile && (
            <div className="file-info">
              <strong>{t('Downloaded File:')}</strong> {t('TransaccionesTagPayDummy.xlsx')}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TagPayControl;