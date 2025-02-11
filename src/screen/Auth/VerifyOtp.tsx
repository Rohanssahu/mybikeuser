import { View, Text, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { color } from '../../constant'
import Icon from '../../component/Icon'
import { icon } from '../../component/Image'
import { hp } from '../../component/utils/Constant'
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from
    'react-native-confirmation-code-field';
export default function VerifyOtp() {
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({ value, cellCount: 4 });

    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });
    return (
        <View style={styles.container}>
            <View style={{ paddingHorizontal: 15 }}>
                <Icon source={icon.back} size={50} />
            </View>

            <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: hp(10) }}>
                <Text style={{ fontSize: 20, color: color.white, fontWeight: '500' }}>Check Your Cell Phone</Text>

                <Text style={{ fontSize: 14, color: color.white, fontWeight: '400', marginTop: 5 }}>Please put the 4 digits sent to you</Text>
                <View
                    style={{ height: hp(10), width: '50%', marginTop: hp(8), alignSelf: 'center', }} >
                    <CodeField
                        ref={ref}
                        {...props}

                        value={value}
                        onChangeText={setValue}
                        cellCount={4}
                        rootStyle={{}}

                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={({ index, symbol, isFocused }) => (
                            <View style={{ backgroundColor: '#E9E9E9', borderRadius: 15, }}>


                                <Text
                                    key={index}
                                    style={[styles.cell, isFocused && styles.focusCell]}
                                    onLayout={getCellOnLayoutHandler(index)}>
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            </View>
                        )}
                    />
                </View>
                <View>
                    <Text style={{ fontSize: 14, color: color.white, borderBottomWidth: 0.8, borderColor: '#fff' }}>RESEND OTP</Text>
                </View>
            </View>
            <View>
                
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: color.baground,
    },
    codeFieldRoot: { marginTop: 20, },
    cell: {
        width: 40,
        height: 40,
        lineHeight: 38,
        fontSize: 24,
        borderWidth: 2,
        borderColor: '#E9E9E9',
        textAlign: 'center',
        color: '#000',
        borderRadius: 10,
        // backgroundColor:'#E9E9E9',

    },
    focusCell: {
        borderColor: '#009838',

        borderRadius: 10,

    },
})