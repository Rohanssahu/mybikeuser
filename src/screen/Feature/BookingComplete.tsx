import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Text,
  ScrollView,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {color} from '../../constant';
import images from '../../component/Image';
import ScreenNameEnum from '../../routes/screenName.enum';
import {hp, wp} from '../../component/utils/Constant';
import CustomButton from '../../component/CustomButton';

interface BookingParams {
  bookingId?: string;
  garageName?: string;
  serviceName?: string;
  date?: string;
  amount?: number;
}

const DetailRow = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, highlight && styles.detailValueHighlight]}>
      {value}
    </Text>
  </View>
);

const BookingComplete: React.FC<{navigation: any}> = ({navigation}) => {
  const route = useRoute();
  const params = (route.params ?? {}) as BookingParams;
  const hasDetails = !!params.garageName;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar backgroundColor={color.baground} />
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <Image
            source={images.complete}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.textContainer}>
            <Text style={styles.title}>Booking Confirmed!</Text>
            <Text style={styles.subtitle}>
              Your bike service booking has been successfully confirmed.
            </Text>
          </View>

          {hasDetails && (
            <View style={styles.detailsCard}>
              {!!params.bookingId && (
                <DetailRow
                  label="Booking ID"
                  value={`#${params.bookingId}`}
                  highlight
                />
              )}
              {!!params.garageName && (
                <DetailRow label="Garage" value={params.garageName} />
              )}
              {!!params.serviceName && (
                <DetailRow label="Service" value={params.serviceName} />
              )}
              {!!params.date && (
                <DetailRow label="Date & Time" value={params.date} />
              )}
              {params.amount != null && (
                <DetailRow
                  label="Amount Paid"
                  value={`₹${params.amount}`}
                  highlight
                />
              )}
            </View>
          )}

          <View style={styles.btnWrapper}>
            <CustomButton
              title="Back To Home"
              onPress={() => navigation.navigate(ScreenNameEnum.BOTTAM_TAB)}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default BookingComplete;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: color.baground},
  safeArea: {flex: 1},
  scroll: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  logo: {height: hp(25), width: wp(80), marginTop: hp(4)},
  textContainer: {
    alignItems: 'center',
    marginTop: hp(3),
    paddingHorizontal: 20,
  },
  title: {fontSize: 22, color: '#FFFFFF', fontWeight: '700'},
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    color: '#9DB2BF',
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: hp(3),
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  detailLabel: {fontSize: 13, color: '#9DB2BF', flex: 1},
  detailValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  detailValueHighlight: {
    color: color.buttonColor,
    fontSize: 14,
    fontWeight: '800',
  },
  btnWrapper: {marginTop: hp(3), width: '100%'},
});
