# Setup Guide for Deadline Bloom

## Features Added

### 1. Local Storage Persistence
- All project data is automatically saved to your browser's local storage
- Data persists between browser sessions and page refreshes
- No login required to use the app

### 2. Import/Export Functionality
- Export your data as JSON files for backup
- Import previously exported data to restore your projects
- Access via the "Settings" tab

### 3. Firebase Authentication & Cloud Sync (Optional)
- Sign up/login with email and password
- Sync your data across devices
- Automatic conflict resolution (newest data wins)

## Setup Instructions

### Basic Setup (Local Storage Only)
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Your data will be automatically saved to local storage

### Firebase Setup (For Cloud Sync)

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication

3. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in test mode (for development)

4. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click the web app icon (</>) to add a web app
   - Copy the configuration object

5. Create environment file:
   ```bash
   # Create .env.local file in the root directory
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

6. Set up Firestore security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/data/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

## How to Use

### Local Storage (Default)
- All data is automatically saved to your browser
- No account required
- Data is device-specific

### Export/Import Data
1. Go to Settings tab
2. Click "Export Data" to download a JSON backup
3. Click "Import Data" to restore from a backup file
4. Use "Clear All Data" to reset to default projects

### Cloud Sync (Optional)
1. Go to Settings tab
2. Click "Sign In / Sign Up"
3. Create an account or sign in
4. Your data will automatically sync with the cloud
5. Sign in on other devices to access your data

## Data Structure

The app exports/imports data in this format:
```json
{
  "projects": [...],
  "timelineEvents": [...],
  "lastUpdated": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

## Troubleshooting

### Firebase Issues
- Ensure all environment variables are set correctly
- Check Firebase console for authentication and database setup
- Verify Firestore security rules allow read/write for authenticated users

### Import Issues
- Ensure the JSON file was exported from this app
- Check that the file contains the required data structure
- Try exporting fresh data and importing it to test

### Local Storage Issues
- Clear browser cache and local storage if data seems corrupted
- Check browser console for any errors
- Ensure JavaScript is enabled in your browser

## Security Notes

- Local storage data is not encrypted
- Firebase data is protected by authentication
- Export files contain all your project data - keep them secure
- Consider regular backups for important projects
