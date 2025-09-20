import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { color } from '../../constant';
import { get_tikit } from '../../redux/Api/apiRequests';
import SupportFormModal from './SupportFormModal';
import ScreenNameEnum from '../../routes/screenName.enum';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {format} from 'date-fns';

interface Ticket {
    id: string; // using string ID to match the API response
    subject: string;
    created_at: string;
    status: 'Open' | 'Closed';
    messages: Array<{ message: string }>; // assuming 'messages' is an array of objects with a 'message' field
}

const TicketList: React.FC = ({ navigation }) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTab, setSelectedTab] = useState<'Open' | 'Closed'>('Open');
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        tikit_list();
    }, []);

    const tikit_list = async () => {
        try { 
             const user_id = await  AsyncStorage.getItem('user_id')            
            const res = await get_tikit(user_id);
            if (res?.success) {
                setTickets(res?.data);
            } else {
                console.error('Failed to fetch tickets', res?.message);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    const filteredTickets = tickets.filter(ticket => ticket.status === selectedTab);


    const formatDate = dateString => {
        return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
      };
    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'Open' && styles.activeTab]}
                    onPress={() => setSelectedTab('Open')}
                >
                    <Text style={styles.tabText}>Open Tickets</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'Closed' && styles.activeTab]}
                    onPress={() => setSelectedTab('Closed')}
                >
                    <Text style={styles.tabText}>Closed Tickets</Text>
                </TouchableOpacity>
            </View>

            <View
        style={{
          flex: 1,
          marginTop: 30,
        }}>
        {filteredTickets?.length > 0 ? (
          <FlatList
            data={filteredTickets}
            keyExtractor={item => item.id} // ID is now string
            renderItem={({item}) => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate(ScreenNameEnum.CHAT_SCREEN, {
                    ticket: item,
                  });
                }}
                style={styles.ticketItem}>
                <Text style={styles.ticketTitle}>T-{item?.ticketNo}</Text>
                <Text style={[styles.ticketTitle, {fontSize: 16}]}>
                  {item?.subject}
                </Text>
                <Text style={{fontWeight: '800', fontSize: 16}}>
                  Created at: {formatDate(item?.created_at)}
                </Text>
                <Text style={{fontWeight: '800', fontSize: 16}}>
                  Last Message: {item?.messages[item?.messages?.length - 1]?.message?.slice(0,50)}
                </Text>

                <View
                  style={[
                    styles.statusButton,
                    item.status === 'Open'
                      ? styles.openButton
                      : styles.closeButton,
                  ]}>
                  <Text style={styles.buttonText}>Status: {item.status}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontSize: 16,
                color: '#fff',
                fontWeight: '600',
              }}>
              No Tickets Found
            </Text>
          </View>
        )}
      </View>
            <TouchableOpacity
                onPress={() => {
                    setModalVisible(true);
                }}
                style={{
                    position: 'absolute',
                    bottom: 20, right: 20,
                    backgroundColor: color.buttonColor, height: 60, width: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center'
                }}
            >
                <Text style={{ fontSize: 24, color: '#fff' }}>+</Text>
            </TouchableOpacity>

            {/* Support Modal */}
            {/* Assuming you have a modal component for adding tickets */}
            <SupportFormModal visible={modalVisible} onClose={() => {
                tikit_list()
                setModalVisible(false)
            }} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: color.baground,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    tab: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderColor: 'transparent',
    },
    activeTab: {
        borderColor: '#fff',
    },
    tabText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    ticketItem: {
        backgroundColor: '#f8f9fa',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    ticketTitle: {
        fontWeight: 'bold',
        color: '#007bff',
        fontSize: 16
    },
    statusButton: {
        marginTop: 5,
        padding: 5,
        borderRadius: 5,
        alignItems: 'center',
        alignSelf: 'flex-end',
        position: 'absolute',
        right: 10, top: 10
    },
    openButton: {
        backgroundColor: '#28a745',
    },
    closeButton: {
        backgroundColor: '#dc3545',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginTop: 5,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    addButton: {
        backgroundColor: '#d9534f',
        padding: 12,
        borderRadius: 5,
        marginTop: 15,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default TicketList;
