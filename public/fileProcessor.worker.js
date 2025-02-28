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
    console.log(worksheet)
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
  return txtFileData.split('\n')
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
  const formulaRegex = /([A-Za-z]+)(\d+)/g;
  
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
  console.log("Final progress sent to main thread.");
  // Send final progress update ONLY after all rows are processed
  // This should be the last progress message before the completion message
  self.postMessage({
    type: 'progress',
    processedRows: totalRows, // Ensure consistency 
    totalRows: totalRows,
    progress: 100
  });
  console.log("Complete message sent.");
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