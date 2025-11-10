
import React, { useState } from 'react';
import Logo from './Logo';

const G_SCRIPT_CODE = `
// Welcome to the Genius Workflow Hub Backend Script!
// This script runs on Google Apps Script and acts as a simple, free backend for your application.
// It uses a Google Sheet as a database.

// --- CONFIGURATION ---
// IMPORTANT: Set the email of the first administrator. This user will have permission to manage other users.
const ADMIN_EMAIL = "liorbar.workspace@gmail.com"; // <--- CHANGE THIS TO YOUR ADMIN EMAIL

// --- SHEET NAMES ---
// These are the names of the tabs (sheets) at the bottom of your Google Sheet.
const USERS_SHEET_NAME = "Users";
const GAMES_SHEET_NAME = "Games";
const LOGS_SHEET_NAME = "LoginLogs";

// --- HELPER FUNCTIONS ---
/**
 * A wrapper function to handle JSON responses for our web app.
 * @param {object} data The data to be sent.
 * @returns {ContentService.TextOutput} A JSON response.
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Checks if a user has admin privileges.
 * @param {string} email The email of the user to check.
 * @returns {boolean} True if the user is an admin, false otherwise.
 */
function isAdmin(email) {
  if (!email) return false;
  const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USERS_SHEET_NAME);
  if (!usersSheet) return false; // Sheet doesn't exist
  const data = usersSheet.getDataRange().getValues();
  // Find user by email (case-insensitive) in the first column (index 0)
  const userRow = data.find(row => row[0] && row[0].toLowerCase() === email.toLowerCase());
  // Check if role in the second column (index 1) is 'admin'
  return userRow ? userRow[1] === 'admin' : false;
}


// --- INITIAL SETUP ---
/**
 * This function runs when the script is first set up.
 * It creates the necessary sheets and adds the first admin user.
 */
function initialSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetNames = ss.getSheets().map(s => s.getName());

  // Create Users sheet if it doesn't exist
  if (!sheetNames.includes(USERS_SHEET_NAME)) {
    const usersSheet = ss.insertSheet(USERS_SHEET_NAME);
    usersSheet.appendRow(["Email", "Role"]); // Add headers
    usersSheet.appendRow([ADMIN_EMAIL, "admin"]); // Add first admin
    SpreadsheetApp.flush();
  }

  // Create Games sheet if it doesn't exist
  if (!sheetNames.includes(GAMES_SHEET_NAME)) {
    const gamesSheet = ss.insertSheet(GAMES_SHEET_NAME);
    gamesSheet.appendRow(["ID", "GameDataJSON"]); // Add headers
  }

  // Create LoginLogs sheet if it doesn't exist
  if (!sheetNames.includes(LOGS_SHEET_NAME)) {
    const logsSheet = ss.insertSheet(LOGS_SHEET_NAME);
    logsSheet.appendRow(["Timestamp", "Email"]); // Add headers
  }
  
  // Delete the default "Sheet1" if it exists
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) {
    ss.deleteSheet(defaultSheet);
  }
}

// --- API ENDPOINTS ---

/**
 * A simple GET endpoint for testing if the script is deployed correctly.
 * It doesn't handle any application logic.
 */
function doGet(e) {
  initialSetup(); // Run setup on first visit just in case.
  return ContentService.createTextOutput("Google Apps Script is running correctly. Use POST requests to interact with the application API.");
}

/**
 * Handles all POST requests from the web app.
 * This is the single entry point for all data reading and writing.
 */
function doPost(e) {
  try {
    initialSetup(); // Ensure sheets exist on every request.
    const request = JSON.parse(e.postData.contents);
    const action = request.action;

    // Security check: Only admins can perform certain dangerous write operations.
    const adminOnlyActions = ['updateUsers', 'clearGames'];
    if (adminOnlyActions.includes(action) && !isAdmin(request.userEmail)) {
      return jsonResponse({ success: false, error: 'Permission denied. Admin access required for this action.' });
    }

    switch (action) {
      // READ operations
      case 'login':
        return handleLogin(request);
      case 'getAllData':
        return getAllData(request);
      
      // WRITE operations
      case 'saveGame':
        return saveGame(request);
      case 'updateUsers':
        return updateUsers(request);
      case 'clearGames':
         return clearGames(request);

      default:
        return jsonResponse({ success: false, error: 'Invalid action specified.' });
    }
  } catch (err) {
    // Log the full error for debugging in the Apps Script console.
    console.error('Error in doPost: ' + err.toString() + ' Stack: ' + err.stack);
    return jsonResponse({ success: false, error: 'An internal server error occurred: ' + err.message });
  }
}


// --- ACTION HANDLERS ---

/**
 * Handles user login requests.
 * @param {object} request The parsed request object from doPost.
 */
function handleLogin(request) {
  const email = request.email.toLowerCase();
  const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USERS_SHEET_NAME);
  const logsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOGS_SHEET_NAME);
  
  const data = usersSheet.getDataRange().getValues();
  const userRow = data.find(row => row[0] && row[0].toLowerCase() === email);

  if (userRow) {
    logsSheet.appendRow([new Date().toISOString(), email]);
    return jsonResponse({
      success: true,
      data: {
        authorized: true,
        user: { email: userRow[0], role: userRow[1] }
      }
    });
  } else {
    return jsonResponse({ success: true, data: { authorized: false } });
  }
}

/**
 * Fetches all necessary data for the app to start.
 * @param {object} request The parsed request object from doPost.
 */
function getAllData(request) {
  const userEmail = request.userEmail;

  // --- Get Users ---
  const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USERS_SHEET_NAME);
  const usersData = usersSheet.getDataRange().getValues();
  usersData.shift(); // Remove header row
  const users = usersData.map(row => ({ email: row[0], role: row[1] })).filter(u => u.email);

  // --- Get Games ---
  const gamesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GAMES_SHEET_NAME);
  let games = [];
  if (gamesSheet.getLastRow() > 1) {
    const gamesData = gamesSheet.getRange(2, 2, gamesSheet.getLastRow() - 1, 1).getValues();
    games = gamesData.map(row => JSON.parse(row[0])).reverse(); // Newest first
  }

  // --- Get Logins (Admin only) ---
  let logins = [];
  if (isAdmin(userEmail)) {
    const logsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOGS_SHEET_NAME);
    if (logsSheet.getLastRow() > 1) {
        const logsData = logsSheet.getRange(2, 1, logsSheet.getLastRow() - 1, 2).getValues();
        logins = logsData.map(row => ({ timestamp: row[0], email: row[1] })).reverse();
    }
  }

  return jsonResponse({
    success: true,
    data: {
      users: users,
      games: games,
      logins: logins
    }
  });
}


/**
 * Saves or updates a game's details.
 * @param {object} request The request payload containing game data.
 */
function saveGame(request) {
  const game = request.game;
  const gamesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GAMES_SHEET_NAME);
  const data = gamesSheet.getDataRange().getValues();
  
  const existingRowIndex = data.findIndex(row => row[0] === game.id);

  if (existingRowIndex > -1) {
    // Update existing game
    gamesSheet.getRange(existingRowIndex + 1, 2).setValue(JSON.stringify(game));
  } else {
    // Add new game
    gamesSheet.appendRow([game.id, JSON.stringify(game)]);
  }
  return jsonResponse({ success: true, data: { message: "Game saved." } });
}

/**
 * Overwrites the entire user list.
 * @param {object} request The request payload containing the new user list.
 */
function updateUsers(request) {
  const newUsers = request.users;
  const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(USERS_SHEET_NAME);
  
  // Clear the sheet (except headers) and write the new list
  if (usersSheet.getLastRow() > 1) {
    usersSheet.getRange(2, 1, usersSheet.getLastRow() - 1, usersSheet.getLastColumn()).clearContent();
  }
  if (newUsers && newUsers.length > 0) {
    const newUserData = newUsers.map(u => [u.email, u.role]);
    usersSheet.getRange(2, 1, newUsers.length, 2).setValues(newUserData);
  }
  
  return jsonResponse({ success: true, data: { message: "Users updated." } });
}

/**
 * Clears all game data from the sheet.
 */
function clearGames(request) {
  const gamesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GAMES_SHEET_NAME);
  if (gamesSheet.getLastRow() > 1) {
      gamesSheet.getRange(2, 1, gamesSheet.getLastRow() - 1, gamesSheet.getLastColumn()).clearContent();
  }
  return jsonResponse({ success: true, data: { message: "Game history cleared." } });
}
`;

const SetupInstructionsPage: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(G_SCRIPT_CODE.trim()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        });
    };

  return (
    <div className="max-w-4xl mx-auto text-slate-300">
       <header className="bg-blue-950 text-white p-6 text-center rounded-lg shadow-lg mb-8 relative">
            <h1 className="text-3xl sm:text-4xl font-bold flex items-center justify-center gap-3">
                <Logo className="w-10 h-10" />
                <span>First-Time Setup</span>
            </h1>
            <h2 className="text-lg sm:text-xl font-light mt-1 text-slate-300">Connecting the App to a Google Sheet Backend</h2>
        </header>

        <div className="bg-slate-800 rounded-lg shadow-md p-6 sm:p-8 space-y-8">
            <div className="bg-yellow-900/50 border-l-4 border-yellow-500 p-4 rounded-md">
                <p className="font-bold text-yellow-300">Welcome, Admin!</p>
                <p className="mt-1">This one-time setup will create a free, secure backend for your application using your Google account. Please follow these steps carefully. It should take about 5 minutes.</p>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">Step 1: Create a New Google Sheet</h3>
                <p>
                    Go to <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold">sheets.new</a> to create a blank spreadsheet. You can name it "Genius App Backend" or anything you like.
                </p>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">Step 2: Open the Script Editor</h3>
                <p className="mb-2">In your new Google Sheet, go to the menu and click <code className="bg-slate-700 p-1 rounded">Extensions</code> {'>'} <code className="bg-slate-700 p-1 rounded">Apps Script</code>.</p>
                <img src="https://i.imgur.com/k2wLqQ1.png" alt="Apps Script menu location" className="rounded-md border border-slate-600"/>
            </div>

             <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">Step 3: Paste the Backend Code</h3>
                <p className="mb-2">A new tab will open with a code editor. Delete any existing code in the <code className="bg-slate-700 p-1 rounded">Code.gs</code> file and paste the entire block of code below.</p>
                 <div className="relative mt-4">
                    <textarea
                        readOnly
                        value={G_SCRIPT_CODE.trim()}
                        className="w-full h-64 bg-slate-950 text-slate-300 font-mono p-4 rounded-md border border-slate-700 text-xs"
                        dir="ltr"
                    />
                    <button
                        onClick={handleCopyCode}
                        className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-1 px-4 rounded transition-colors"
                    >
                        {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                </div>
                <p className="mt-4">
                    <span className="font-bold text-yellow-400">Important:</span> Inside the code you just pasted, find the line <code className="bg-slate-700 p-1 rounded">const ADMIN_EMAIL = "..."</code> and change the email address to your own. This will make you the first administrator.
                </p>
                 <p className="mt-2">Don't forget to click the "Save project" icon (floppy disk) at the top of the editor.</p>
            </div>

             <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">Step 4: Deploy the Script</h3>
                <p className="mb-2">Now we'll publish the script so our app can talk to it.</p>
                <ol className="list-decimal list-inside space-y-3 pl-4">
                    <li>Click the blue <code className="bg-slate-700 p-1 rounded">Deploy</code> button in the top-right corner, and select <code className="bg-slate-700 p-1 rounded">New deployment</code>.</li>
                    <li>Click the gear icon next to "Select type" and choose <code className="bg-slate-700 p-1 rounded">Web app</code>.</li>
                    <li>In the new dialog:
                        <ul className="list-disc list-inside space-y-2 pl-6 mt-2">
                            <li>For "Description", you can type "Genius App API".</li>
                            <li>For "Execute as", select <code className="bg-slate-700 p-1 rounded">Me</code>.</li>
                            <li>For "Who has access", select <code className="bg-slate-700 p-1 rounded">Anyone</code>. <span className="text-yellow-400 font-bold">(This is critical for preventing connection errors)</span></li>
                        </ul>
                    </li>
                    <li>Click <code className="bg-slate-700 p-1 rounded">Deploy</code>.</li>
                </ol>
            </div>
             <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">Step 5: Authorize Permissions</h3>
                 <p className="mb-2">Google will ask you to authorize the script to manage your spreadsheet. This is safe, as you wrote the code.</p>
                 <ol className="list-decimal list-inside space-y-3 pl-4">
                    <li>A popup will appear. Click <code className="bg-slate-700 p-1 rounded">Authorize access</code>.</li>
                    <li>Choose your Google account.</li>
                    <li>You might see a "Google hasn't verified this app" warning. This is normal. Click <code className="bg-slate-700 p-1 rounded">Advanced</code>, then click <code className="bg-slate-700 p-1 rounded">Go to Untitled project (unsafe)</code>.</li>
                    <li>On the final screen, scroll down and click <code className="bg-slate-700 p-1 rounded">Allow</code>.</li>
                 </ol>
            </div>

             <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">Step 6: Get the Web App URL</h3>
                <p className="mb-2">After authorization, a new window will appear with your "Web app URL". This is the secret key that connects the app to your sheet. <span className="font-bold text-yellow-400">Copy this URL.</span></p>
            </div>

            <div>
                <h3 className="text-2xl font-bold text-orange-400 mb-3">Step 7: Configure the App</h3>
                 <p className="mb-2">
                    Finally, you need to tell the application where to send data.
                 </p>
                 <ol className="list-decimal list-inside space-y-3 pl-4">
                    <li>In the project editor on the left, find and open the file named <code className="bg-slate-700 p-1 rounded">config.ts</code>.</li>
                    <li>Inside this file, replace the placeholder text <code className="bg-slate-700 p-1 rounded">'YOUR_URL_HERE'</code> with the URL you copied in the previous step.</li>
                 </ol>
                 <div className="bg-slate-950 p-4 rounded-md mt-4 font-mono text-slate-300" dir="ltr">
                    <span className="text-slate-500">// Before</span><br/>
                    export const GOOGLE_SCRIPT_URL = 'YOUR_URL_HERE';<br/>
                    <br/>
                    <span className="text-slate-500">// After</span><br/>
                    export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/ABCD.../exec';
                 </div>
                 <p className="mt-4 text-green-400 font-bold">Once you save the change in <code className="bg-slate-700 p-1 rounded">config.ts</code>, the application will automatically connect to your new backend. This setup page will disappear, and you'll see the login screen.</p>
            </div>
        </div>
    </div>
  );
};

export default SetupInstructionsPage;
