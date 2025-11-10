// This file handles all communication with the Google Apps Script backend.
import { GOOGLE_SCRIPT_URL } from './config';

const SCRIPT_URL = GOOGLE_SCRIPT_URL;

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// FIX: Cast SCRIPT_URL to string to bypass TypeScript's literal type checking.
// This preserves the check for whether the placeholder URL is still in use.
const isApiConfigured = SCRIPT_URL && (SCRIPT_URL as string) !== 'YOUR_URL_HERE';

async function performFetch(action: string, payload: Record<string, any>): Promise<ApiResponse> {
    if (!isApiConfigured) {
        const errorMsg = "Google Script URL is not configured in config.ts.";
        console.error(errorMsg);
        return { success: false, error: errorMsg };
    }

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Required for Apps Script POST
            },
            body: JSON.stringify({ action, ...payload }),
            redirect: 'follow', // Important for handling Apps Script redirects
        });

        const textResponse = await response.text();

        if (!response.ok) {
             console.error(`Raw response from Google Script (Error ${response.status}):`, textResponse);
             throw new Error(`Network response was not ok. Status: ${response.status}.`);
        }
        
        try {
            // Attempt to parse the text as JSON
            const jsonResponse: ApiResponse = JSON.parse(textResponse);
            return jsonResponse;
        } catch (jsonError) {
            // This block catches errors if the response isn't valid JSON (e.g., an HTML error page from Google)
            console.error('Failed to parse JSON. Raw response from Google Script:', textResponse);
            return { success: false, error: 'Invalid response from server. It might be an HTML error page. Check the developer console for the raw response.' };
        }

    } catch (error) {
        console.error(`Error during fetch for action "${action}":`, error);
        return { success: false, error: `Failed to fetch: ${(error as Error).message}` };
    }
}


/**
 * Fetches data from the Google Apps Script backend using the reliable POST method.
 * @param action - The function to call in the backend (e.g., 'login', 'getAllData').
 * @param params - An object of parameters to send with the request.
 * @returns A promise that resolves to the API response.
 */
export async function fetchData(action: string, params: Record<string, any> = {}): Promise<ApiResponse> {
  return performFetch(action, params);
}

/**
 * Sends data to be updated or created in the Google Apps Script backend.
 * @param action - The function to call in the backend (e.g., 'saveGame', 'updateUsers').
 * @param payload - The data to send in the request body.
 * @returns A promise that resolves to the API response.
 */
export async function updateData(action: string, payload: Record<string, any>): Promise<ApiResponse> {
   return performFetch(action, payload);
}
