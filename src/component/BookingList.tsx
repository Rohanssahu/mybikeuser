import React from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Define the data type for each booking item
interface BookingItem {
  id: string;
  bookingId: string;
  amount: string;
  date: string;
  onCallPress: () => void;
  onViewBillPress: () => void;
}

// Define props for the component
interface BookingListProps {
  data: BookingItem[];
}

const BookingList: React.FC<BookingListProps> = ({ data }) => {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Booking ID</Text>
            <Text style={styles.label}>Amount:</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.value}>{item.bookingId}</Text>
            <Text style={styles.amount}>${item.amount}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date</Text>
          </View>
          <Text style={styles.value}>{item.date}</Text>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.callButton} onPress={item.onCallPress}>
              <MaterialIcons name="phone" size={24} color="#FFD700" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.billButton} onPress={item.onViewBillPress}>
              <Text style={styles.billText}>View Bill</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#2C2F5B', // Dark blue background
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    width: '100%',
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  value: {
    fontSize: 16,
    color: '#A0A3BD', // Light gray text
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  callButton: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 30,
  },
  billButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  billText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default BookingList;
