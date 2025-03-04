import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image } from 'react-native';
import { icon } from '../../component/Image';
import Icon from '../../component/Icon';
import { color } from '../../constant';
import { hp } from '../../component/utils/Constant';
import { get_profile } from '../../redux/Api/apiRequests';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const Help: React.FC = () => {
  const [User, setUser] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! Thanks for contacting MRbike. Please select your service type.\n\n" +
        "1. Service\n" +
        "2. Bike Repair\n" +
        "3. Complain\n" +
        "4. Payment\n\n" +
        "Reply with the option number (e.g., 1 for Service).",
      sender: 'bot'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [currentState, setCurrentState] = useState<'main' | 'bikeRepair' | 'serviceLocation' | 'enterPincode'>('main');

  // Function to send a message
  const sendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputText('');

    // Handle chatbot responses
    handleUserSelection(inputText.trim());
  };

  // Function to handle user's selection
  const handleUserSelection = (option: string) => {
    let botReplyText = '';

    if (currentState === 'main') {
      switch (option) {
        case '1':
          botReplyText = "You selected **Service**. How can we assist you?";
          break;
        case '2':
          botReplyText = "You can choose from the following options:\n\n" +
            "1. Waiting for Pickup\n" +
            "2. Reschedule Order\n" +
            "3. Cancel Order\n" +
            "4. Service Availability\n" +
            "5. Invoice Related Issues\n" +
            "6. Wrong Cancellation\n" +
            "7. FAQs\n\n" +
            "OR\n\n" +
            "Type 'home 🏠' to go to the main menu.";
          setCurrentState('bikeRepair');
          break;
        case '3':
          botReplyText = "You selected **Complain**. Kindly provide more details.";
          break;
        case '4':
          botReplyText = "Please help me with some details about the service location.\n\n" +
            "1. Enter a pincode\n" +
            "2. Pick from my saved addresses\n\n" +
            "OR\n\n" +
            "Type 'home 🏠' to go to the main menu.";
          break;
        default:
          botReplyText = "Invalid option. Please reply with a number between 1 and 4.";
          break;
      }
    } else if (currentState === 'bikeRepair') {
      // Handle the bikeRepair state
      switch (option) {
        case '1':
          botReplyText = "Waiting for Pickup.";
          break;
        case '2':
          botReplyText = "Reschedule Order.";
          break;
        case '3':
          botReplyText = "Cancel Order.";
          break;
        case '4':
          botReplyText = "Please help me with some details\n" +
            "about the service location.\n\n" +
            "1. Enter a pincode\n" +
            "2. Pick from my saved addresses\n\n" +
            "OR \n\n" +
            "Type home 🏠 to go to the main menu\n" +
            setCurrentState('serviceLocation');
          break;
        case '5':
          botReplyText = "Invoice Related Issues.";
          break;
        case '6':
          botReplyText = "Wrong Cancellation.";
          break;
        case '7':
          botReplyText = "FAQs.";
          break;
        default:
          botReplyText = "Invalid option. Please reply with a valid option.";
          break;
      }
    } else if (currentState === 'serviceLocation') {
      if (option === '1') {
        botReplyText = "Please provide me your area pincode.\n\n" +
          "OR\n" +
          "Type 'home 🏠' to go to the main menu.";
        setCurrentState('enterPincode');
      } else if (option === '2') {
        botReplyText = "You can choose from your saved addresses.";
        // Logic for selecting saved addresses can be added here
      }
    } else if (currentState === 'enterPincode') {
      // Here, you would validate the pincode entered by the user
      if (option.match(/^\d{6}$/)) { // Example for 6-digit pincode format
        botReplyText = `We provide the following services in your area:\n\n` +
          "Bike Repair, Battery Repair, Front Light Repair, Break Repair, Clutch Repair, " +
          "Charging battery Repair, horn Repair, Back Panel Repair, Proximity Sensor Repair, " +
          "Seat Repair, Back light Repair.\n\n" +
          "To know more about repair services, please click on the link below and search for your device.\n\n" +
          "https://mrbikesupport/\n\n" +
          "Thank you for taking out time to chat with me.\n\n" +
          "OR\n\n" +
          "Type 'home 🏠' to go to the main menu.";
          
      } else {
        botReplyText = "Invalid pincode. Please enter a valid pincode.\n\n" +
          "OR\n" +
          "Type 'home 🏠' to go to the main menu.";
      }
    }

    const botReply: Message = { id: Date.now().toString(), text: botReplyText, sender: 'bot' };
    setMessages((prevMessages) => [...prevMessages, botReply]);
  };




  const getUser = async () => {
    
    const res = await get_profile();
    if (res.success) {
        setUser(res.data);
        console.log(res.data); // Log the response to verify
    } else {
        setUser('');
    }
   
};

useEffect(() => {

  getUser()
}, [])
  // Render each message in chat
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
          <Icon source={icon.phone} size={40} />
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <Text style={styles.greetingText}>Hello, <Text style={styles.highlight}>{User?.first_name}</Text></Text>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListFooterComponent={({ item }) => <View style={{ height: hp(10) }} />}
        contentContainerStyle={styles.chatContainer}
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
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => { }}>
            <Icon size={25} source={icon.mic} />
          </TouchableOpacity>
          <TouchableOpacity onPress={sendMessage} style={{ marginLeft: 10 }}>
            <Icon size={25} source={icon.send} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Help;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.baground,
    paddingHorizontal: 20,
    paddingTop: 10,
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
    textAlign: 'center',
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
    padding: 15,
    borderRadius: 30,
    borderTopRightRadius: 0,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#9E9E9E',
    padding: 15,
    borderRadius: 30,
    borderBottomLeftRadius: 0,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 12,
    width: '85%',
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
    bottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
