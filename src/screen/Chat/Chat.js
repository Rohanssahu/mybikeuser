import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';

const Chat = () => {
  const route = useRoute();
  const { reciverId } = route.params;
  const user = useSelector((state) => state.auth.userData);
  const senderId = user?.data?.user_data.id;

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
console.log('reciverId',reciverId);

  const sendMessage = async () => {
    console.log('sendMessage=>>>>>');
    
    if (inputText.trim()) {
      const myHeaders = new Headers();
      myHeaders.append(
        'Authorization',
        `Bearer ${user?.data.token}`
      );

      const formdata = new FormData();
      formdata.append('receiver_id', reciverId);
      formdata.append('message', inputText);

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow',
      };

      try {
        const response = await fetch(
          'https://server-php-8-3.technorizen.com/braza/api/business/send-message',
          requestOptions
        );
        const result = await response.json();

        if (result.success) {
      console.log('mesg send success');
      
          setInputText('');
        } else {
          console.error('Error sending message:', result.message);
        }
      } catch (error) {
        console.error('Error: sendMessage', error);
      }
    }
  };


  const getMessages = async () => {
    console.log('getMessages=>>>>>.');
    
    const myHeaders = new Headers();
    myHeaders.append(
      'Authorization',
       `Bearer ${user?.data.token}`
    );

    const formData = new FormData()


    formData.append('user_id',reciverId)
    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formData,
      redirect: 'follow',
    };

    try {
      const response = await fetch(
        'https://server-php-8-3.technorizen.com/braza/api/business/get-messages',
        requestOptions
      );
      const result = await response.json();
console.log('result.data',result.data);

      if (result.success) {
        setMessages(result.data);
      } else {
        console.error('Error fetching messages:', result.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    // Fetch messages on component mount
    getMessages();

    // Poll messages every 2 seconds
    const interval = setInterval(() => {
      getMessages();
    }, 4000);

    // Clear interval on unmount
    return () => clearInterval(interval);
  }, []);

  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={{zIndexL:10}}
        >
          <Image
            source={require('../../assets/Cropping/Back_Navs2x.png')}
            style={{ height: 30, width: 30 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Support</Text>
      </View>
      {/* Chat Messages */}
     {messages?.length > 0 ? <ScrollView contentContainerStyle={styles.chatContainer}>
        {messages?.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender_id === senderId
                ? styles.sentMessage
                : styles.receivedMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.sender_id === senderId&& { color: '#fff', fontWeight: '600' },
              ]}
            >
              {msg.message}
            </Text>
          </View>
        ))}
      </ScrollView>
    :
    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}> 

        <Text style={{color:'#ccc',fontSize:14,fontWeight:'700'}}>Start Chat</Text>
        </View>  
    }
      {/* Input Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Send Message"
          placeholderTextColor="#888"
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Image
            source={require('../../assets/Cropping/send3x.png')}
            style={{ height: 30, width: 30 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#fff',
      },
      header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    marginVertical:15,
    paddingHorizontal:10
      },
      backButton: {
        backgroundColor: '#009838',
        borderRadius: 50,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
      },
      backText: {
        color: '#fff',
        fontSize: 18,
      },
      headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginLeft:-15
      },
      chatContainer: {
        flexGrow: 1,
        padding: 16,
      },
      messageBubble: {
        maxWidth: '80%',
        padding: 15,
        borderRadius:30,
        marginVertical: 4,
        marginTop:10
      },
      sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#4CAF50',
        borderTopRightRadius: 0,
      },
      receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#F0F0F0',
        borderBottomLeftRadius: 0,
      },
      messageText: {
        fontSize: 14,
        color: '#000',
      },
      inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        
        elevation: 5,
        borderRadius: 30,
        margin: 10,
        paddingLeft: 16,
      },
      textInput: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        paddingVertical: 8,
      },
      sendButton: {
       
        borderRadius: 30,
        padding: 10,
        margin: 4,
    
      },
    });
    
    export default Chat;
    