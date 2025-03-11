import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        "file_comparison": "File Comparison",
        "upload_files": "Upload Files",
        "file1": "File 1",
        "file2": "File 2",
        "compare_files": "Compare Files",
        "comparison_results": "Comparison Results",
        "please_upload": "Please upload both files.",
        "reconciliation_setup": "Setting Up Reconciliations",
        "add_reconciliation": "Add Reconciliation",
        "conciliation": "Conciliation",
        "select_option_1": "Select Option 1",
        "amount_column_a": "Amount Column A",
        "select_option_2": "Select Option 2",
        "amount_column_b": "Amount Column B",
        "select_option_3": "Select Option 3",
        "Record_finder_content": "Switch File Update Process",
        "Step1": "Step 1: Upload Text File",
        "Step2": "Step 2: Select Excel File to Update",
        "Update_Excel_File": "Update Excel File",
        "Tag_Pay_File_Updation": "Tag Pay File Updation",
        "Step 1: Download_Google_Sheet": "Step 1: Download Google Sheet",
        "Step 2: Upload_Sample_TagPay_File": "Step 2: Upload Sample TagPay File",
        "Step 3: Process_Uploaded_File": "Step 3: Process Uploaded File",
        "Step 4: Upload_Switch_File": "Step 4: Upload Switch File",
        "Step 5: Process_Switch_File": "Step 5: Process Switch File",
        "Download_TransaccionesTagPay":  "Download TransaccionesTagPay",
        "Select_TagPay_File": "Select TagPay File",
        "Update_TagPay_&_TagPay_Ok_Sheet": "Update TagPay & TagPay Ok Sheet",
        "Select_Switch_File": "Select Switch File",
        "Update_GKN_OK_&_GKN_Error_Sheet": "Update GKN OK & GKN Error Sheet",
        "Dashboard": "Dashboard",
        "Reconcilation_Control": "Reconcilation Control",
        "Switch_File_Control": "Switch File Control",
        "TagPay_Control": "TagPay Control",
        "Logout": "Logout",
      }
    },
    es: {
      translation: {
        "file_comparison": "Comparación de archivos",
        "upload_files": "Subir archivos",
        "file1": "Archivo 1",
        "file2": "Archivo 2",
        "compare_files": "Comparar archivos",
        "comparison_results": "Resultados de la comparación",
        "please_upload": "Por favor, suba ambos archivos.",
        "reconciliation_setup": "Configuración de Reconciliaciones",
        "add_reconciliation": "Agregar Reconciliación",
        "conciliation": "Conciliación",
        "select_option_1": "Seleccionar Opción 1",
        "amount_column_a": "Columna de Monto A",
        "select_option_2": "Seleccionar Opción 2",
        "amount_column_b": "Columna de Monto B",
        "select_option_3": "Seleccionar Opción 3",
        "Record_finder_content": "Contenido del buscador de registros",
        "Step1": "Paso 1: Subir archivo de texto", 
        "Step2": "Paso 2: Seleccione el archivo Excel que desea actualizar",
        "Update_Excel_File": "Actualizar archivo de Excel",
        "Tag_Pay_File_Updation": "Actualización de archivo de pago de etiquetas",
        "Step 1: Download_Google_Sheet": "Paso 1: Descargar Google Sheet",
        "Step 2: Upload_Sample_TagPay_File": "Paso 2: Cargue un archivo TagPay de muestra",
        "Step 3: Process_Uploaded_File": "Paso 3: Procesar el archivo cargado",
        "Step 4: Upload_Switch_File": "Paso 4: Cargar archivo Switch",
        "Step 5: Process_Switch_File": "Paso 5: Procesar archivo Switch",
        "Download_TransaccionesTagPay":  "Descargar TransaccionesTagPay",
        "Select_TagPay_File": "Seleccionar archivo TagPay",
        "Update_TagPay_&_TagPay_Ok_Sheet": "Actualizar TagPay y la hoja de confirmación de TagPay",
        "Select_Switch_File": "Seleccionar Cambiar archivo",
        "Update_GKN_OK_&_GKN_Error_Sheet": "Actualización de la hoja de GKN OK y GKN Error",
        "Dashboard": "Panel",
        "Reconcilation_Control": "Control de conciliación",
        "Switch_File_Control": "Cambiar control de archivos",
        "TagPay Control": "Control de pago de etiquetas",
        "Logout": "Cerrar sesión",
      }
    }
  },
  lng: "en", // Default language
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
