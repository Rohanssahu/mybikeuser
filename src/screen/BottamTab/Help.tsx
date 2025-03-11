import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, Alert } from 'react-native';
import { icon } from '../../component/Image';
import Icon from '../../component/Icon';
import { color } from '../../constant';
import { hp } from '../../component/utils/Constant';
import { get_profile, get_tikitdetails, replay_tikit, tikitstatus } from '../../redux/Api/apiRequests';
import { useRoute } from '@react-navigation/native';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const Help: React.FC = ({navigation}) => {
  const [User, setUser] = useState('');
  const [TikitDetails, setTikitDetails] = useState('');
  const route = useRoute();
  const { ticket } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');

  // Fetch user and ticket details
  const getUser = async () => {
    const res = await get_profile();
    const tikit = await get_tikitdetails(ticket?._id);

    if (tikit.success) {
      setTikitDetails(tikit.data);

      const formattedMessages = tikit.data.messages.map((msg: any) => ({
        id: msg._id,
        text: msg.message,
        sender: msg.sender_type === 4 ? 'user' : 'bot',
      }));

      setMessages(formattedMessages);
    } else {
      setTikitDetails('');
    }

    if (res.success) {
      setUser(res.data);
    } else {
      setUser('');
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  // Function to send a message
  const replayTikit = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const res = await replay_tikit(ticket?._id, inputText);

      if (res.success) {
        const botReply: Message = {
          id: Date.now().toString(),
          text: res.data?.message || "Thank you for your response. Our team will get back to you.",
          sender: 'bot',
        };

        setMessages((prevMessages) => [...prevMessages, botReply]);
        getUser();
      } else {
        Alert.alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      Alert.alert("Something went wrong. Please try again.");
    }

    setInputText('');
  };
  const confirmCloseTikit = () => {
    Alert.alert(
      "Close Ticket",
      "Are you sure you want to close this ticket?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes", onPress: closeTikit },
      ]
    );
  };
  // Function to close ticket
  const closeTikit = async () => {
    try {
      const res = await tikitstatus(ticket?._id, "Closed");
      if (res.success) {
        Alert.alert("Success", "Ticket has been closed.");
        navigation.goBack()
        getUser(); // Refresh ticket details
      } else {
        Alert.alert("Error", "Failed to close ticket.");
      }
    } catch (error) {
      console.error("Error closing ticket:", error);
      Alert.alert("Something went wrong.");
    }
  };

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
        <Text style={styles.headerText}>{ticket?.ticket_number}</Text>
        <View style={{flexDirection:'row',alignItems:'center'}}>
        <TouchableOpacity style={styles.closeButton} onPress={()=>{
          confirmCloseTikit()
        }}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
        <TouchableOpacity style={{marginLeft:10}}>
          <Icon source={icon.phone} size={40} />
        </TouchableOpacity>
        </View>
      </View>

      {/* Greeting */}
      <Text style={styles.greetingText}>
        Hello, <Text style={styles.highlight}>{User?.first_name}</Text>
      </Text>

      {/* Chat Messages */}
      <FlatList
        data={messages}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        ListFooterComponent={<View style={{ height: hp(10) }} />}
        contentContainerStyle={styles.chatContainer}
      />

      {/* Close Ticket Button */}


      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#fff"
          value={inputText}
          onChangeText={setInputText}
        />
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={replayTikit} style={{ marginLeft: 10 }}>
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
  closeButton: {
    backgroundColor: '#FF5733',

    height:40,width:40,
    borderRadius: 20,
    alignItems: 'center',
   justifyContent:'center'
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
