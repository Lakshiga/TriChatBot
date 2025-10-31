const axios = require('axios');

// Replace with your computer's IP address
const API_URL = 'http://localhost:5292/api/GeminiTutor/chat';

async function testComprehensive() {
  try {
    console.log('Comprehensive Testing for API endpoint:', API_URL);
    
    // Test cases covering various scenarios
    const testCases = [
      // Language-specific tests
      "ஹலோ, எப்படி இருக்கிறீர்கள்?",  // Tamil greeting
      "මේ දවස ආයුබෝවන්",  // Sinhala greeting
      "Hello, how are you today?",  // English greeting
      
      // Specific requests
      "I want to learn how to introduce myself",  // Request for help
      "Can you give me a code example for greetings?",  // Request for code
      "What is the capital of Japan?",  // General knowledge
      
      // Error correction scenarios
      "I am go to school yesterday",  // Grammar error
      "How to say thank you in Tamil?",  // Question
      
      // Edge cases
      "",  // Empty message
      "asdfghjkl",  // Gibberish
      "Can you speak in Hindi?",  // Prohibited language request
    ];

    for (let i = 0; i < testCases.length; i++) {
      console.log(`\n--- Test Case ${i + 1}: "${testCases[i]}" ---`);
      
      const requestBody = {
        userMessage: testCases[i] || " "  // Handle empty string
      };

      const response = await axios.post(API_URL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 45000, // 45 second timeout
      });

      console.log('Status:', response.status);
      console.log('Language Used:', response.data.language_used);
      console.log('AI Response:', response.data.ai_response);
      
      // Check feedback section
      if (response.data.feedback) {
        console.log('Feedback Provided:', response.data.feedback.is_correct !== undefined);
      }
      
      // Check vocabulary suggestion
      if (response.data.vocabulary_suggestion) {
        console.log('Vocabulary Suggestion:', response.data.vocabulary_suggestion);
      }
      
      // Check code example
      if (response.data.code_example) {
        console.log('✅ Code Example Provided');
      } else {
        console.log('⚠️  No Code Example');
      }
      
      // Validate language restriction (check for Hindi characters)
      const hindiRegex = /[\u0900-\u097F]/;
      const hasHindi = hindiRegex.test(response.data.ai_response);
      if (hasHindi) {
        console.log('❌ WARNING: Response contains Hindi characters!');
      } else {
        console.log('✅ Response does not contain Hindi characters');
      }
    }
    
    console.log('\n--- Comprehensive Tests Completed ---');
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

testComprehensive();