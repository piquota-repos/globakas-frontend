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
      // Get the TAGPAY data and filter it
      const tagpayData = [];
      // Apply filtering criteria: Estado = "OK" (column 5) and Tipo = "DEBIT/CREDIT API" (column 10)
      newTagpaySheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const estado = row.getCell(5).value; // Column E (Estado)
          const tipo = row.getCell(10).value;  // Column J (Tipo)
          // Apply exact filtering criteria
          if (estado === 'OK' && tipo === 'DEBIT/CREDIT API') {
            // Store the entire row with its values
            tagpayData.push({
              rowNumber: rowNumber,
              values: row.values,
              // Store column G value for sorting
              columnG: row.getCell(7).value
            });
          }
        }
      }); 
      // If no rows matched, provide a clear message
      if (tagpayData.length === 0) {
        setStatusMessage('Warning: No rows matched the filter criteria (Estado="OK" AND Tipo="DEBIT/CREDIT API")');
      } else {
        // Sort the filtered data by column G (which is index 7 in ExcelJS)
        tagpayData.sort((a, b) => {
          // Handle different data types for proper sorting
          let valueA = a.columnG;
          let valueB = b.columnG;

          // Convert to string for consistent comparison if not null/undefined
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

          // Compare the values
          return valueA.localeCompare(valueB);
        });

        console.log("Data sorted by column G");
      }

      // Add the sorted and filtered data to the new TAGPAY OK sheet
      tagpayData.forEach((item) => {
        const newRow = newTagpayOKSheet.addRow(item.values);

        // Get the original row from TAGPAY sheet to copy styles
        const originalRow = newTagpaySheet.getRow(item.rowNumber);

        // Copy cell styles
        originalRow.eachCell((cell, colNumber) => {
          if (cell.value !== undefined) {
            const newCell = newRow.getCell(colNumber);
            newCell.style = Object.assign({}, cell.style);
            newCell.value = cell.value;
          }
        });
      });

      // Check if GKN sheets already exist in the uploaded workbook and create them only if they don't exist
      // If they exist, we'll preserve them in the new workbook
      if (!newWorkbook.getWorksheet('GKN OK')) {
        newWorkbook.addWorksheet('GKN OK');
      }
      
      if (!newWorkbook.getWorksheet('GKN ERROR')) {
        newWorkbook.addWorksheet('GKN ERROR');
      }

      // Save the updated workbook
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

      setStatusMessage(`Success! Created "${updatedFileName}" with ${tagpayData.length} filtered rows in TAGPAY OK sheet, sorted by column G.`);
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
      setStatusMessage('Processing Switch file and updating TagPay file...');

      const switchBuffer = await switchFile.arrayBuffer();
      const tagpayBuffer = await processedTagPayFile.arrayBuffer();

      const switchWorkbook = new ExcelJS.Workbook();
      const tagpayWorkbook = new ExcelJS.Workbook();

      await switchWorkbook.xlsx.load(switchBuffer);
      await tagpayWorkbook.xlsx.load(tagpayBuffer);

      // Get the Detail sheet from the Switch file
      const detailSheet = switchWorkbook.getWorksheet('detail');
      if (!detailSheet) {
        setStatusMessage('Error: "Detail" sheet not found in the Switch file.');
        return;
      }

      // Get or create GKN OK and GKN ERROR sheets in the TagPay file
      let gknOKSheet = tagpayWorkbook.getWorksheet('GKN OK');
      let gknErrorSheet = tagpayWorkbook.getWorksheet('GKN ERROR');

      // If sheets exist, clear them first but keep the formatting
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
        
        // Remove the sheet and recreate it
        tagpayWorkbook.removeWorksheet(gknOKSheet.id);
        gknOKSheet = tagpayWorkbook.addWorksheet('GKN OK', { properties, pageSetup });
        
        // Restore column widths
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
        
        // Remove the sheet and recreate it
        tagpayWorkbook.removeWorksheet(gknErrorSheet.id);
        gknErrorSheet = tagpayWorkbook.addWorksheet('GKN ERROR', { properties, pageSetup });
        
        // Restore column widths
        columnWidths.forEach((width, index) => {
          if (width) {
            gknErrorSheet.getColumn(index + 1).width = width;
          }
        });
      } else {
        gknErrorSheet = tagpayWorkbook.addWorksheet('GKN ERROR');
      }

      // Get header row from Detail sheet
      const headerRow = detailSheet.getRow(1);
      
      // Find the column indexes for the filtering criteria
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

      console.log(`Column indexes - ACTUAL DATE: ${actualDateColIndex}, PAYMENT TYPE: ${paymentTypeColIndex}, STATUS: ${statusColIndex}, TAGPAY CLEARING: ${tagpayClearingColIndex}`);

      // Copy header row to both GKN sheets
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

      // Filter and copy rows from Detail sheet to GKN OK and ERROR sheets
      let okRowCount = 0;
      let errorRowCount = 0;

      detailSheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
          const actualDate = row.getCell(actualDateColIndex).value;
          const paymentType = row.getCell(paymentTypeColIndex).value;
          const status = row.getCell(statusColIndex).value;
          const tagpayClearing = row.getCell(tagpayClearingColIndex).value;

          // Check if all required columns have values
          if (actualDate && paymentType && status !== undefined && tagpayClearing) {
            // Convert to string for consistent comparison
            const paymentTypeStr = paymentType.toString().trim();
            const statusStr = status.toString().trim();

            // Filter for columns C (ACTUAL DATE), J (PAYMENT TYPE = "EF"), K (STATUS)
            if (paymentTypeStr === 'EF') {
              // Create row values for columns A to M
              const rowValues = [];
              for (let i = 1; i <= 13; i++) { // Columns A to M
                rowValues[i] = row.getCell(i).value;
              }

              // Add to appropriate sheet based on STATUS
              if (statusStr === 'OK') {
                const newRow = gknOKSheet.addRow(rowValues);
                
                // Copy cell styles
                row.eachCell((cell, colNumber) => {
                  if (colNumber <= 13 && cell.value !== undefined) { // Only columns A to M
                    const newCell = newRow.getCell(colNumber);
                    newCell.style = Object.assign({}, cell.style);
                  }
                });
                
                okRowCount++;
              } else if (statusStr === 'ERROR') {
                const newRow = gknErrorSheet.addRow(rowValues);
                
                // Copy cell styles
                row.eachCell((cell, colNumber) => {
                  if (colNumber <= 13 && cell.value !== undefined) { // Only columns A to M
                    const newCell = newRow.getCell(colNumber);
                    newCell.style = Object.assign({}, cell.style);
                  }
                });
                
                errorRowCount++;
              }
            }
          }
        }
      });

      // Set column widths for GKN sheets if they don't already have widths
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

      // Save the final file
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
        <h1>Tag Pay Updation</h1>
      </div>
      <div className="file-upload-section">
        <div className="card p-4 mb-4">
          {/* Step 1: Download Button */}
          <div>
            <h2 className="font-bold text-xl mb-2">Step 1: Download Excel File from Google Sheets</h2>
            <button
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
              onClick={downloadFromGoogleSheets}
              disabled={isProcessing}
            >
              <Download size={18} />
              Download TransaccionesTagPay
            </button>
          </div>
          <br /><br /><br />
          {/* Step 2: Upload Button */}
          <div>
            <h2 className="font-bold text-xl mb-2">Step 2: Upload Sample TagPay Excel File</h2>
            <button
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-400"
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
              className="hidden" // Hide the file input
            />
          </div>
          <br /><br /><br />
          {/* Step 3: Process Uploaded File */}
          <div>
            <h2 className="font-bold text-xl mb-2">Step 3: Process Uploaded File</h2>
            <button
              className="flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:bg-yellow-400"
              onClick={processUploadedFile}
              disabled={!uploadedFileName || !downloadedFile || isProcessing}
            >
              <PlayCircle size={18} className={isProcessing ? "animate-spin" : ""} />
              {isProcessing ? 'Processing...' : 'Update TagPay'}
            </button>
          </div>
          <br /><br /><br />
          {/* Step 4: Upload Switch File */}
          <div>
            <h2 className="font-bold text-xl mb-2">Step 4: Upload Switch Excel File</h2>
            <button
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-400"
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
              className="hidden" // Hide the file input
            />
          </div>
          <br /><br /><br />
          {/* Step 5: Process Switch File */}
          <div>
            <h2 className="font-bold text-xl mb-2">Step 5: Process Switch File</h2>
            <button
              className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-purple-400"
              onClick={processSwitchFile}
              disabled={!switchFileName || !processedTagPayFile || isProcessing}
            >
              <PlayCircle size={18} className={isProcessing ? "animate-spin" : ""} />
              {isProcessing ? 'Processing...' : 'Update with Switch Data'}
            </button>
          </div>
          {/* Status Message */}
          {statusMessage && (
            <div className={`mt-4 p-3 rounded ${statusMessage.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {statusMessage}
            </div>
          )}
          {/* Display uploaded file name */}
          {uploadedFileName && (
            <div className="mt-4 p-2 text-sm text-blue-600">
              <strong>Uploaded TagPay File:</strong> {uploadedFileName}
            </div>
          )}
          {/* Display switch file name */}
          {switchFileName && (
            <div className="mt-2 p-2 text-sm text-blue-600">
              <strong>Uploaded Switch File:</strong> {switchFileName}
            </div>
          )}
          {/* Display downloaded file status */}
          {downloadedFile && (
            <div className="mt-2 p-2 text-sm text-blue-600">
              <strong>Downloaded File:</strong> TransaccionesTagPayDummy.xlsx
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TagPayControl;