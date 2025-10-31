import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, Alert, Modal, Pressable, Dimensions, Animated, Easing } from 'react-native';
import axios from 'axios';

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// --- Main Notice (API URL) ---
// Use your computer's IP address. 'localhost' will not work with physical devices.
// To find your computer's IP:
// Windows: ipconfig | findstr "IPv4"
// Mac/Linux: ifconfig | grep "inet "
// The API runs on port 5292 (HTTP) by default
const API_URL = 'http://10.89.92.148:5292/api/GeminiTutor/chat'; // Use your computer's actual IP address
// For Android Emulator: http://10.0.2.2:5292/api/GeminiTutor/chat
// For Physical Device: http://YOUR_COMPUTER_IP:5292/api/GeminiTutor/chat
// Example: const API_URL = 'http://192.168.1.5:5292/api/GeminiTutor/chat';

export default function App() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');
  
  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  const handleSend = async () => {
    if (userInput.trim() === '') return;

    // Add user message to chat history immediately
    const userMessage = { id: Date.now(), text: userInput, sender: 'user' };
    setChatHistory(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    setError('');

    try {
      const requestBody = {
        userMessage: userInput,
      };

      // Using Axios to send POST request to backend
      const response = await axios.post(API_URL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 45000, // 45 second timeout for better reliability
      });

      // Process and validate the response
      const processedResponse = {
        id: Date.now() + 1,
        text: response.data.ai_response || "I'm here to help you practice languages! What would you like to learn?",
        sender: 'ai',
        feedback: response.data.feedback || { is_correct: true, error_type: "None" },
        vocabulary: response.data.vocabulary_suggestion || "Keep practicing your language skills!",
        language: response.data.language_used || "Unknown",
        codeExample: response.data.code_example || null
      };

      // Add AI response to chat history
      setChatHistory(prev => [...prev, processedResponse]);

    } catch (err) {
      console.error(err); // Log error to console
      let errorMessage = 'An unknown error occurred';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = `Server Error: ${err.response.status} - ${err.response.statusText}`;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Network Error: Please check if the server is running and accessible.';
      } else {
        // Something else happened
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      
      // Add error message to chat history with a helpful response
      const errorMessageObj = { 
        id: Date.now() + 1, 
        text: "I'm experiencing some technical difficulties right now, but I'm still here to help! Try asking me about basic greetings, introductions, or common phrases in Tamil, Sinhala, or English.",
        sender: 'ai',
        feedback: { is_correct: true, error_type: "None" },
        vocabulary: "Technical issues - temporary problems that resolve",
        language: "Error",
        codeExample: "// Error handling example\ntry {\n  // Your code here\n} catch (error) {\n  print('Error occurred, but we keep learning!');\n}"
      };
      setChatHistory(prev => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
      setUserInput(''); // Clear input field
    }
  };

  const clearChat = () => {
    if (chatHistory.length > 0) {
      Alert.alert(
        "Clear Chat",
        "Are you sure you want to clear the conversation?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Clear", onPress: () => setChatHistory([]) }
        ]
      );
    }
  };

  const showCodeExample = (code) => {
    setModalContent(code);
    setModalVisible(true);
    
    // Animate modal entrance
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  const hideCodeExample = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  // Function to get language-specific color
  const getLanguageColor = (language) => {
    switch (language.toLowerCase()) {
      case 'tamil':
        return '#ff6b35'; // Tamil orange
      case 'sinhala':
        return '#00a896'; // Sinhala green
      case 'english':
        return '#3b82f6'; // English blue
      default:
        return '#9ca3af'; // Default gray
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f7" />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Tri-Chat AI Tutor</Text>
          <Text style={styles.subtitle}>Learn Tamil, Sinhala & English</Text>
        </View>
        {chatHistory.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <ScrollView style={styles.chatContainer} 
                  contentContainerStyle={styles.chatContent}
                  showsVerticalScrollIndicator={false}>
        {chatHistory.length === 0 && (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeIcon}>
              <Text style={styles.welcomeIconText}>💬</Text>
            </View>
            <Text style={styles.welcomeTitle}>Welcome to Tri-Chat!</Text>
            <Text style={styles.welcomeText}>Start by typing a message in Tamil, Sinhala, or English.</Text>
            <Text style={styles.welcomeText}>I'll help you practice all three languages!</Text>
            <Text style={styles.welcomeText}>Ask for code examples to see programming tips!</Text>
            <Text style={styles.welcomeText}>I'll always try to answer your questions!</Text>
          </View>
        )}
        
        {chatHistory.map((message, index) => (
          <Animated.View 
            key={message.id} 
            style={[
              styles.messageContainer, 
              message.sender === 'user' ? styles.userMessageContainer : styles.aiMessageContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
            onLayout={() => {
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                delay: index * 50,
                useNativeDriver: true,
              }).start();
              Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                delay: index * 50,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
              }).start();
            }}
          >
            {message.sender === 'user' ? (
              <>
                <View style={styles.userMessageHeader}>
                  <Text style={styles.userHeaderLabel}>You</Text>
                </View>
                <Text style={styles.userMessageText}>{message.text}</Text>
              </>
            ) : (
              <>
                <View style={styles.aiMessageHeader}>
                  <Text style={[styles.aiHeaderLabel, { color: getLanguageColor(message.language) }]}>
                    {message.language}
                  </Text>
                </View>
                <Text style={styles.aiMessageText}>{message.text}</Text>
                
                {message.feedback && !message.feedback.is_correct && (
                  <View style={styles.feedbackBox}>
                    <View style={styles.feedbackHeader}>
                      <Text style={styles.feedbackTitle}>_correction_</Text>
                    </View>
                    <Text style={styles.feedbackText}>Original: "{message.feedback.user_original}"</Text>
                    <Text style={styles.feedbackText}>Correct: "{message.feedback.correction}"</Text>
                    <Text style={styles.feedbackText}>Explanation: {message.feedback.tamil_explanation}</Text>
                  </View>
                )}

                {message.vocabulary && (
                  <View style={styles.vocabBox}>
                    <View style={styles.vocabHeader}>
                      <Text style={styles.feedbackTitle}>_new_word_</Text>
                    </View>
                    <Text style={styles.feedbackText}>{message.vocabulary}</Text>
                  </View>
                )}
                
                {message.codeExample && (
                  <TouchableOpacity 
                    style={styles.codeExampleBox} 
                    onPress={() => showCodeExample(message.codeExample)}
                  >
                    <View style={styles.codeHeader}>
                      <Text style={styles.feedbackTitle}>_code_example_</Text>
                    </View>
                    <Text style={styles.codePreview} numberOfLines={2}>
                      {message.codeExample}
                    </Text>
                    <Text style={styles.tapToView}>Tap to view full example</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </Animated.View>
        ))}
        
        {isLoading && (
          <Animated.View 
            style={[
              styles.loadingContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
            onLayout={() => {
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }).start();
              Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
              }).start();
            }}
          >
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </Animated.View>
        )}
      </ScrollView>

      {/* User Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message in Tamil, Sinhala, or English..."
          value={userInput}
          onChangeText={setUserInput}
          onSubmitEditing={handleSend}
          multiline
          numberOfLines={2}
          maxLength={300}
        />
        <TouchableOpacity 
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
          onPress={handleSend} 
          disabled={isLoading || userInput.trim() === ''}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      
      {/* Code Example Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={hideCodeExample}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={hideCodeExample}
          />
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Code Example</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={hideCodeExample}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.codeContainer}>
              <Text style={styles.codeText}>{modalContent}</Text>
            </ScrollView>
            <Pressable
              style={styles.modalAction}
              onPress={hideCodeExample}
            >
              <Text style={styles.modalActionText}>Close</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// --- Enhanced Styles with Proper Alignment and CSS Styles ---
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f0f4f7',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerContent: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#1e293b',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  chatContainer: { 
    flex: 1, 
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  chatContent: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
    borderRadius: 25,
    marginHorizontal: 10,
    width: width * 0.9,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  welcomeIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  welcomeIconText: {
    fontSize: 45,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 24,
    fontWeight: '500',
  },
  messageContainer: {
    maxWidth: '88%',
    borderRadius: 22,
    padding: 18,
    marginVertical: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userMessageContainer: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  aiMessageContainer: { 
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  userMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  userHeaderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  aiHeaderLabel: {
    fontSize: 13,
    fontWeight: '800',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  userMessageText: { 
    fontSize: 17, 
    color: '#ffffff',
    lineHeight: 24,
    fontWeight: '500',
  },
  aiMessageText: { 
    fontSize: 17, 
    color: '#334155',
    lineHeight: 24,
    fontWeight: '500',
  },
  feedbackBox: { 
    backgroundColor: '#fff8e1', 
    borderRadius: 18, 
    padding: 16, 
    marginTop: 18, 
    borderWidth: 1, 
    borderColor: '#ffecb3',
    shadowColor: '#d3a000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  feedbackHeader: {
    marginBottom: 10,
  },
  vocabBox: { 
    backgroundColor: '#e3f2fd', 
    borderRadius: 18, 
    padding: 16, 
    marginTop: 15, 
    borderWidth: 1, 
    borderColor: '#bbdefb',
    shadowColor: '#1e88e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  vocabHeader: {
    marginBottom: 10,
  },
  codeExampleBox: {
    backgroundColor: '#f1f8e9', 
    borderRadius: 18, 
    padding: 16, 
    marginTop: 15, 
    borderWidth: 1, 
    borderColor: '#c5e1a5',
    shadowColor: '#7cb342',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  codeHeader: {
    marginBottom: 10,
  },
  feedbackTitle: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#555555',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  feedbackText: { 
    fontSize: 16, 
    color: '#334155', 
    marginBottom: 6,
    lineHeight: 22,
    fontWeight: '500',
  },
  codePreview: {
    fontSize: 14,
    color: '#334155',
    fontFamily: 'monospace',
    marginBottom: 10,
    lineHeight: 20,
    fontWeight: '500',
  },
  tapToView: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
    textAlign: 'right',
    fontWeight: '600',
  },
  inputContainer: { 
    flexDirection: 'row', 
    padding: 18, 
    borderTopWidth: 1, 
    borderColor: '#e2e8f0', 
    backgroundColor: '#ffffff',
    alignItems: 'flex-end',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#cbd5e1', 
    borderRadius: 28, 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    backgroundColor: '#f8fafc',
    maxHeight: 130,
    fontSize: 17,
    fontWeight: '500',
    color: '#1e293b',
    marginRight: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sendButton: { 
    backgroundColor: '#007AFF', 
    borderRadius: 28, 
    paddingVertical: 16, 
    paddingHorizontal: 25, 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowColor: '#94a3b8',
  },
  sendButtonText: { 
    color: '#ffffff', 
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#dbeafe',
    borderRadius: 22,
    marginVertical: 10,
    alignSelf: 'flex-start',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginLeft: 15,
    color: '#007AFF',
    fontStyle: 'italic',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '85%',
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e293b',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#94a3b8',
    fontWeight: '600',
  },
  codeContainer: {
    backgroundColor: '#f8fafc',
    padding: 22,
    maxHeight: height * 0.6,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    fontWeight: '500',
  },
  modalAction: {
    backgroundColor: '#007AFF',
    padding: 18,
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  modalActionText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});