# TriChat AI Tutor - Setup Guide

## Prerequisites
1. [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)
2. [Node.js](https://nodejs.org/) (LTS version recommended)
3. [Expo CLI](https://docs.expo.dev/get-started/installation/)
4. Android Studio or physical Android device for testing

## Getting Started

### 1. Set up the Backend (TriChatTutorAPI)

1. Get a Gemini API Key from [Google AI Studio](https://aistudio.google.com/)
2. Update `appsettings.json` in the TriChatTutorAPI folder:
   ```json
   {
     "Logging": {
       "LogLevel": {
         "Default": "Information",
         "Microsoft.AspNetCore": "Warning"
       }
     },
     "AllowedHosts": "*",
     "GeminiApiKey": "YOUR_ACTUAL_GEMINI_API_KEY_HERE"
   }
   ```

3. Run the API:
   ```bash
   cd TriChatTutorAPI
   dotnet run
   ```
   
   Note the URL where the API is running (typically `http://localhost:5292`)

### 2. Set up the Frontend (TriChatTutorApp)

1. Install dependencies:
   ```bash
   cd TriChatTutorApp
   npm install
   ```

2. Update the API URL in `App.js`:
   - For Android Emulator: `http://10.0.2.2:5292/api/GeminiTutor/chat`
   - For Physical Device: `http://YOUR_COMPUTER_IP:5292/api/GeminiTutor/chat`

3. Run the app:
   ```bash
   npx expo start
   ```

### 3. Testing the Connection

1. Make sure the API is running
2. Make sure your mobile device/emulator can access your computer's IP
3. Send a test message from the app

## Troubleshooting

### Network Errors
- Ensure both the API and mobile device are on the same network
- Check firewall settings
- Verify the API URL in App.js matches where your API is running

### Common Issues
1. **Axios Network Error**: Usually caused by incorrect API URL or network connectivity
2. **CORS Issues**: Already configured in the backend
3. **Invalid API Key**: Will show as a server error in the app