/**
 * Google Apps Script Backend for Chronograph Attendance
 * 
 * Instructions:
 * 1. Open a Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this code and Save.
 * 4. Click 'Deploy' > 'New Deployment'.
 * 5. Select 'Web App'.
 * 6. Execute as 'Me', Who has access: 'Anyone'.
 * 7. Copy the Web App URL and paste it into config.js.
 */

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName('Data') || ss.insertSheet('Data');
  
  const content = dataSheet.getRange(1, 1).getValue();
  return ContentService.createTextOutput(content || '{}')
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dataSheet = ss.getSheetByName('Data') || ss.insertSheet('Data');
  const logSheet = ss.getSheetByName('Logs') || ss.insertSheet('Logs');
  
  const postData = JSON.parse(e.postData.contents);
  const action = postData.action;
  
  if (action === 'sync') {
    // Overwrite the entire state (for simplicity in this demo)
    dataSheet.getRange(1, 1).setValue(JSON.stringify(postData.data));
    
    // Log the sync event
    logSheet.appendRow([new Date(), 'SYNC_EVENT', 'Full State Synchronized']);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}
