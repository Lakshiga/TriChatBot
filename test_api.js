const axios = require('axios');

// Replace with your computer's IP address
const API_URL = 'http://localhost:5292/api/GeminiTutor/chat';

async function testAPI() {
  try {
    console.log('Testing API endpoint:', API_URL);
    
    // Test cases to verify improved responses
    const testCases = [
      "ஹலோ, எப்படி இருக்கிறீர்கள்?",  // Tamil greeting
      "I want to learn how to introduce myself",  // English request
      "මේ දවස ආයුබෝවන්",  // Sinhala greeting
      "How do I say thank you in Tamil?",  // English question
      "Can you teach me numbers 1 to 5 in Sinhala?"  // English request
    ];

    for (let i = 0; i < testCases.length; i++) {
      console.log(`\n--- Test Case ${i + 1}: "${testCases[i]}" ---`);
      
      const requestBody = {
        userMessage: testCases[i]
      };

      const response = await axios.post(API_URL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      });

      console.log('Status:', response.status);
      console.log('AI Response:', response.data.ai_response);
      console.log('Language Used:', response.data.language_used);
      console.log('Vocabulary Suggestion:', response.data.vocabulary_suggestion);
      
      if (response.data.feedback && !response.data.feedback.is_correct) {
        console.log('Feedback:', {
          error_type: response.data.feedback.error_type,
          correction: response.data.feedback.correction
        });
      }
    }
    
    console.log('\n--- All Tests Completed Successfully ---');
  } catch (error) {
    if (error.response) {
      console.error('API Error Response Status:', error.response.status);
      console.error('API Error Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Network Error: No response received');
      console.error('Error Details:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run a single test with custom message
async function testCustomMessage(message) {
  try {
    console.log('Testing Custom Message:', message);
    
    const requestBody = {
      userMessage: message
    };

    const response = await axios.post(API_URL, requestBody, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('\n--- Custom Test Result ---');
    console.log('Status:', response.status);
    console.log('Full Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response Data:', error.response.data);
    }
  }
}

// Check command line arguments
if (process.argv.length > 2) {
  const customMessage = process.argv.slice(2).join(' ');
  testCustomMessage(customMessage);
} else {
  testAPI();
}