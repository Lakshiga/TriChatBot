const axios = require('axios');

// Replace with your computer's IP address
const API_URL = 'http://localhost:5292/api/GeminiTutor/chat';

async function testLanguageRestrictions() {
  try {
    console.log('Testing Language Restrictions for API endpoint:', API_URL);
    
    // Test cases that might trigger Hindi responses
    const testCases = [
      "Can you speak in Hindi?",
      "मैं हिंदी सीखना चाहता हूँ",  // Hindi text: "I want to learn Hindi"
      "How do you say hello in Hindi?",
      "Please respond in Hindi"
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
      
      // Check if response contains Hindi characters
      const hindiRegex = /[\u0900-\u097F]/;
      const hasHindi = hindiRegex.test(response.data.ai_response);
      
      if (hasHindi) {
        console.log('⚠️  WARNING: Response contains Hindi characters!');
      } else {
        console.log('✅ Response does not contain Hindi characters');
      }
    }
    
    console.log('\n--- Language Restriction Tests Completed ---');
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

testLanguageRestrictions();