const axios = require('axios');

// Replace with your computer's IP address
const API_URL = 'http://localhost:5292/api/GeminiTutor/chat';

async function testCodeExamples() {
  try {
    console.log('Testing Code Example Generation for API endpoint:', API_URL);
    
    // Test cases that should trigger code examples
    const testCases = [
      "Show me how to print hello world in Tamil",
      "Can you give me a code example for introductions?",
      "How do I write a simple program in Sinhala?",
      "Give me a Python example for language learning",
      "Show me code for basic greetings"
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
      
      if (response.data.code_example) {
        console.log('✅ Code Example Provided:');
        console.log(response.data.code_example);
      } else {
        console.log('⚠️  No Code Example Provided');
      }
    }
    
    console.log('\n--- Code Example Tests Completed ---');
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

testCodeExamples();