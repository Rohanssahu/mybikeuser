
  import React, { useState } from 'react';
  import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  import { color } from '../../constant';
import { icon } from '../../component/Image';
import Icon from '../../component/Icon';
  
  interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
  }
  
  const Help: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
      { id: '1', text: 'Hello chatGPT, how are you today?', sender: 'user' },
      { id: '2', text: "Hello, I'm fine, how can I help you?", sender: 'bot' },
    ]);
    const [inputText, setInputText] = useState('');
  
    const sendMessage = () => {
      if (!inputText.trim()) return;
      
      const newMessage: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Simulating a bot reply
      setTimeout(() => {
        const botReply: Message = { id: Date.now().toString(), text: "I'm here to help!", sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, botReply]);
      }, 1000);
    };
  
    const renderMessage = ({ item }: { item: Message }) => (
      <View style={[styles.messageContainer, item.sender === 'user' ? styles.userMessage : styles.botMessage]}>
        {item.sender === 'bot' && <Image source={icon.avtar} style={styles.avatar} />}
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Support</Text>
          <TouchableOpacity>
            <Icon  source={icon.phone} size={40}  />
          </TouchableOpacity>
        </View>
  
        {/* Greeting */}
        <Text style={styles.greetingText}>Hello, <Text style={styles.highlight}>Johan</Text></Text>
  
        {/* Chat Messages */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          inverted
        />
  
        {/* Message Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask Chatbot"
            placeholderTextColor="#fff"
            value={inputText}
            onChangeText={setInputText}
          />
          <View style={{flexDirection:'row'}}>
          <TouchableOpacity onPress={()=>{}}>
            <Icon size={25} source={icon.mic} />
          </TouchableOpacity>
          <TouchableOpacity onPress={sendMessage} style={{marginLeft:10}}>
            <Icon size={25} source={icon.send} />
          </TouchableOpacity>

          </View>
        </View>
      </View>
    );
  };
  
  export default Help;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0E1333',
      paddingHorizontal: 20,
      paddingTop: 50,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerText: {
      fontSize: 18,
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    greetingText: {
      fontSize: 22,
      color: '#FFD700',
      fontWeight: 'bold',
      marginVertical: 20,
      textAlign:'center'
    },
    highlight: {
      color: '#FFD700',
    },
    chatContainer: {
      flexGrow: 1,
      justifyContent: 'flex-end',
    },
    messageContainer: {
      maxWidth: '75%',
      padding: 10,
      borderRadius: 10,
      marginVertical: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#9E9E9E',
      padding:15,
      borderRadius:30,
      borderTopRightRadius:0
    },
    botMessage: {
      alignSelf: 'flex-start',
      backgroundColor: '#9E9E9E',
      padding:15,
      borderRadius:30,
      borderBottomLeftRadius:0
    },
    messageText: {
      color: '#FFFFFF',
      fontSize: 14,
    },
    avatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginRight: 10,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#282F5A',
      borderRadius: 30,
      paddingHorizontal: 15,
      height: 50,
      marginTop: 10,
      bottom:20
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: '#FFFFFF',
    },
    micIcon: {
      marginLeft: 10,
    },
  });
  