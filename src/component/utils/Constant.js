import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Dimensions } from 'react-native';
import {
    widthPercentageToDP as wp,
    heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { trigger } from 'react-native-haptic-feedback';
import moment from 'moment';


const { height, width, fontScale, scale } = Dimensions.get('screen');

export const restrictInput = (val, type = '') => {
    switch (type) {
        case 'Number':
            return val?.replace(/[^0-9]/g, '');
        case 'Space':
            return;
        case 'Special Character':
            return val?.replace(/[`~0-9!@#$%^&*()_"'|+\-=?;:,.<>\{\}\[\]\\\/]/gi, '');
        case 'script':
            return val?.replace(/[`~#$%&*()|\<>\{\}\[\]\\\/]/gi, '');
        default:
            return errorToast('Value not found');
    }
};
const impactOptions = {
    light_both: 'impactlight',
    medium_both: 'impactMedium',
    heavy_both: 'impactHeavy',
    rigid_both: 'rigid', 
    soft_both: 'soft',
    notification_success_both: 'notificationSuccess',
    notification_warning_both: 'notificationWarning',
    notification_error: 'notificationError',
};
const hapticFeedback = (impact = 'impactLight') => {
    return trigger(impact, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });
};
const regex = {
    email: /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/g,
};
const getExtension = (val = '') => {
    let extension = val?.split('.')?.pop()?.toUpperCase();
    return extension;
};
const getName = (val = '') => {
    let name = val?.split('.')?.shift();
    return name;
};

const UTCFormat = (timeStamp = 1683526848) => {
    let dateTime = new Date(timeStamp * 1000);
    return dateTime?.toISOString();
};

const calculateDuration = event_time =>
    moment.duration(
        Math.max(event_time - Math.floor(Date.now() / 1000), 0),
        'seconds',
    );

const Countdown = ({ eventTime = 1683526848, interval = 1000 }) => {
    const [duration, setDuration] = useState(calculateDuration(eventTime));
    const timerRef = useRef(0);
    const timerCallback = useCallback(() => {
        setDuration(calculateDuration(eventTime));
    }, [eventTime]);

    useEffect(() => {
        timerRef.current = setInterval(timerCallback, interval);

        return () => {
            clearInterval(timerRef.current);
        };
    }, [eventTime]);

    return (
        <Text size={14} fontWeight="700" color="#FFF">
            This class start in - {duration.days()}D : {duration.hours()}H :{' '}
            {duration.minutes()}M : {duration.seconds()}S
        </Text>
    );
};
const getCloser = (value, checkOne, checkTwo) =>
    Math.abs(value - checkOne) < Math.abs(value - checkTwo) ? checkOne : checkTwo;

export {
    hp,
    wp,
    height,
    width,
    fontScale as fs,
    scale as s,
    hapticFeedback,
    impactOptions,
    regex,
    getExtension,
    getName,
    UTCFormat,
    Countdown,
    getCloser,
};