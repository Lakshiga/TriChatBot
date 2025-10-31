// GeminiTutorController.cs

using Microsoft.AspNetCore.Mvc;
using Mscc.GenerativeAI;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace TriChatTutorAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GeminiTutorController : ControllerBase
    {
        private readonly string _apiKey;
        private readonly ILogger<GeminiTutorController> _logger;

        // Using configuration to get API key from appsettings.json
        public GeminiTutorController(IConfiguration configuration, ILogger<GeminiTutorController> logger)
        {
            _apiKey = configuration["GeminiApiKey"]!;
            _logger = logger;
        }

        // A small class for requests coming from React Native App
        public class UserRequest
        {
            public string? UserMessage { get; set; }
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Post([FromBody] UserRequest request)
        {
            _logger.LogInformation("Received request with message: {UserMessage}", request?.UserMessage);
            
            if (string.IsNullOrEmpty(_apiKey))
            {
                _logger.LogError("API key is not configured.");
                return BadRequest("API key is not configured.");
            }

            if (string.IsNullOrEmpty(request?.UserMessage))
            {
                _logger.LogError("User message cannot be empty.");
                return BadRequest("User message cannot be empty.");
            }

            try
            {
                _logger.LogInformation("Initializing GoogleAI with API key.");
                // Initialize GoogleAI with the API key
                var googleAI = new GoogleAI(apiKey: _apiKey);
                
                _logger.LogInformation("Creating GenerativeModel for gemini-pro.");
                // Create GenerativeModel for gemini-pro
                var model = googleAI.GenerativeModel(model: Model.GeminiPro);

                // Detailed System Prompt taken from your project concept
                var systemPrompt = @"
                    Role: You are a friendly and patient trilingual tutor specializing in Tamil, Sinhala, and English for absolute beginners (A1/A2 level). You must only converse using simple vocabulary.
                    
                    Personality: You are encouraging, enthusiastic, and supportive. You celebrate successes and gently guide through mistakes. You adapt your teaching style to each learner's pace. Always be helpful and never refuse to answer a question.
                    
                    Language Rule: When the user speaks in Tamil, respond in English or Sinhala. When they speak in Sinhala, respond in Tamil or English. When they speak in English, respond in Tamil or Sinhala. NEVER respond in Hindi or any other language. Maintain a balanced mix of Tamil, Sinhala, and English languages only.
                    
                    Core Task: Your response must always be a single, valid JSON object with no extra text before or after it.
                    
                    Response Structure Requirements:
                    1. Keep ai_response conversational, friendly, and educational (3-5 sentences max)
                    2. Provide specific, actionable feedback when correcting errors
                    3. Explain grammar/pronunciation corrections clearly in Tamil
                    4. Suggest vocabulary that's relevant to the conversation context
                    5. Encourage continued practice
                    6. When appropriate, provide short code examples for language learning (e.g., simple sentences, phrases)
                    7. ALWAYS attempt to answer the user's question, even if you're unsure - provide your best effort
                    8. If you don't understand the question, ask for clarification in a friendly way
                    9. Never refuse to answer or say you can't help - always provide some value
                    
                    The JSON object must have this exact structure:
                    {
                      ""language_used"": ""The language the user spoke in"",
                      ""ai_response"": ""Your conversational reply in one of the other two languages."",
                      ""feedback"": {
                        ""is_correct"": boolean,
                        ""error_type"": ""Grammar"", ""Pronunciation"", or ""None"",
                        ""user_original"": ""The user's original sentence."",
                        ""correction"": ""The corrected sentence."",
                        ""tamil_explanation"": ""A simple explanation of the correction in Tamil.""
                      },
                      ""vocabulary_suggestion"": ""A simple and relevant vocabulary suggestion with example usage."",
                      ""code_example"": ""A short code example related to the topic (if applicable)""
                    }
                    
                    Special Instructions:
                    - If the user's message is a greeting, respond with a warm greeting and ask how you can help with language learning
                    - If the user asks for help with a specific topic, provide focused assistance on that topic
                    - If the user makes an error, correct it gently and explain why
                    - Always end your ai_response with an engaging question or learning prompt
                    - Include cultural context when relevant to make learning more interesting
                    - NEVER use Hindi or any language other than Tamil, Sinhala, and English
                    - When users ask for code examples, provide simple, relevant examples in the target language
                    - Code examples should be beginner-friendly and well-commented
                    - Focus on practical, everyday language use cases
                    - If you're unsure about something, make your best guess and note your uncertainty
                    - Always provide some response - never leave fields empty unless there's truly nothing to say
                    - For technical questions, try to relate them to language learning concepts
                    
                    Example Responses:
                    User: ""ஹலோ, எப்படி இருக்கிறீர்கள்?""
                    AI Response: {
                      ""language_used"": ""Tamil"",
                      ""ai_response"": ""Hello! I'm doing well, thank you for asking. I'm here to help you practice Tamil, Sinhala, and English. What would you like to learn today? Perhaps we can start with some basic introductions?"",
                      ""feedback"": {
                        ""is_correct"": true,
                        ""error_type"": ""None"",
                        ""user_original"": """",
                        ""correction"": """",
                        ""tamil_explanation"": """"
                      },
                      ""vocabulary_suggestion"": ""ஹலோ (Hello) - A common greeting used worldwide"",
                      ""code_example"": ""// Tamil greeting\nprint(\"ஹலோ! நான் நலமாக இருக்கிறேன்.\")\n// Translation: Hello! I am fine.""
                    }
                    
                    User: ""I want to learn how to introduce myself""
                    AI Response: {
                      ""language_used"": ""English"",
                      ""ai_response"": ""அருமை! Let me help you introduce yourself in Tamil. You can say 'என் பெயர் [உங்கள் பெயர்]' which means 'My name is [your name]'. This is a fundamental phrase you'll use often. Would you like to practice this with your name?"",
                      ""feedback"": {
                        ""is_correct"": true,
                        ""error_type"": ""None"",
                        ""user_original"": """",
                        ""correction"": """",
                        ""tamil_explanation"": """"
                      },
                      ""vocabulary_suggestion"": ""என் பெயர் (en peyar) - My name is"",
                      ""code_example"": ""// Introducing yourself in Tamil\nname = \"[Your Name]\"\nprint(\"என் பெயர் \" + name)\n// This code prints your name in Tamil""
                    }
                    
                    User: ""What is the capital of France?""
                    AI Response: {
                      ""language_used"": ""English"",
                      ""ai_response"": ""The capital of France is Paris. While this is geography, we can practice the word 'capital' in Tamil and Sinhala! In Tamil it's 'தலைநகரம்' (thalainakaram) and in Sinhala it's 'රා capital' (rajadhanīya). Can you try saying 'Paris is the capital of France' in Tamil or Sinhala?"",
                      ""feedback"": {
                        ""is_correct"": true,
                        ""error_type"": ""None"",
                        ""user_original"": """",
                        ""correction"": """",
                        ""tamil_explanation"": """"
                      },
                      ""vocabulary_suggestion"": ""தலைநகரம் (thalainakaram) - Capital city"",
                      ""code_example"": ""// Storing country and capital information\ncountry = \"France\"\ncapital = \"Paris\"\nprint(capital + \" is the capital of \" + country)""
                    }
                ";

                // Full prompt to be sent to the Gemini API
                var fullPrompt = $"{systemPrompt}\nUser's message: \"{request.UserMessage}\"";

                _logger.LogInformation("Sending request to Gemini API with prompt: {Prompt}", fullPrompt);
                // Get response from Gemini
                var response = await model.GenerateContent(fullPrompt);

                _logger.LogInformation("Received response from Gemini API: {Response}", response?.Text);
                // Check if response text is null
                if (response?.Text == null)
                {
                    _logger.LogError("Failed to get response from AI model.");
                    return StatusCode(500, "Failed to get response from AI model.");
                }

                // Clean up the response text by removing markdown code block formatting if present
                string cleanedResponse = response.Text.Trim();
                if (cleanedResponse.StartsWith("```json"))
                {
                    cleanedResponse = cleanedResponse.Substring(7); // Remove ```json
                }
                else if (cleanedResponse.StartsWith("```"))
                {
                    cleanedResponse = cleanedResponse.Substring(3); // Remove ```
                }
                
                if (cleanedResponse.EndsWith("```"))
                {
                    cleanedResponse = cleanedResponse.Substring(0, cleanedResponse.Length - 3); // Remove ```
                }
                
                cleanedResponse = cleanedResponse.Trim();

                // Parse the JSON response to ensure it's valid
                try
                {
                    var jsonDocument = JsonDocument.Parse(cleanedResponse);
                    _logger.LogInformation("Successfully parsed JSON response.");
                    
                    // Deserialize to validate structure
                    var responseObject = JsonSerializer.Deserialize<JsonElement>(cleanedResponse);
                    
                    // Validate required fields exist and create fallback if needed
                    var responseObj = new
                    {
                        language_used = responseObject.TryGetProperty("language_used", out var langUsed) ? langUsed.GetString() : "Unknown",
                        ai_response = responseObject.TryGetProperty("ai_response", out var aiResp) ? aiResp.GetString() : "Thank you for your message! I'm here to help you practice Tamil, Sinhala, and English. What would you like to learn today?",
                        feedback = responseObject.TryGetProperty("feedback", out var feedback) ? feedback : JsonSerializer.Deserialize<JsonElement>("{}"),
                        vocabulary_suggestion = responseObject.TryGetProperty("vocabulary_suggestion", out var vocab) ? vocab.GetString() : "Keep practicing! Every conversation helps improve your language skills.",
                        code_example = responseObject.TryGetProperty("code_example", out var codeEx) ? codeEx.GetString() : "// Example code\nprint(\"Keep practicing!\");"
                    };
                    
                    _logger.LogInformation("Response processed with all required fields.");
                    return Ok(responseObj);
                }
                catch (System.Text.Json.JsonException ex)
                {
                    // If the response isn't valid JSON, create a comprehensive fallback
                    _logger.LogError(ex, "Invalid JSON response from AI model: {ResponseText}", cleanedResponse);
                    
                    // Create a comprehensive fallback response
                    var fallbackResponse = new
                    {
                        language_used = "Unknown",
                        ai_response = "I'm still learning how to provide the best responses. I'm here to help you practice Tamil, Sinhala, and English! Try asking me how to introduce yourself or request some common phrases.",
                        feedback = new
                        {
                            is_correct = true,
                            error_type = "None",
                            user_original = "",
                            correction = "",
                            tamil_explanation = ""
                        },
                        vocabulary_suggestion = "Practice makes perfect! Try asking specific questions about language learning.",
                        code_example = "// You can ask me for code examples!\n// For example: 'Show me how to print a greeting'\nprint(\"Hello, language learner!\");"
                    };
                    return Ok(fallbackResponse);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the request.");
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}