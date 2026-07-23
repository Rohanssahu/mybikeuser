import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {color} from '../../constant';
import Icon from '../Icon';
import {icon} from '../Image';

export interface StepperStep {
  label: string;
  done: boolean;
}

interface StepperProps {
  steps: StepperStep[];
}

const StepDot: React.FC<{step: StepperStep; index: number; isActive: boolean}> = ({
  step,
  index,
  isActive,
}) => {
  const scale = useRef(new Animated.Value(step.done || isActive ? 1 : 0.92)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: step.done || isActive ? 1 : 0.92,
      useNativeDriver: true,
      friction: 6,
      tension: 80,
    }).start();
  }, [step.done, isActive, scale]);

  return (
    <View style={styles.dotWrap}>
      <Animated.View
        style={[
          styles.dot,
          {transform: [{scale}]},
          isActive && !step.done && styles.dotActive,
          step.done && styles.dotDone,
        ]}>
        {step.done ? (
          <Icon source={icon.check} size={13} tintColor="#0B1330" />
        ) : (
          <Text style={[styles.dotLabel, isActive && styles.dotLabelActive]}>
            {index + 1}
          </Text>
        )}
      </Animated.View>
      <Text
        numberOfLines={1}
        style={[styles.stepText, (step.done || isActive) && styles.stepTextActive]}>
        {step.label}
      </Text>
    </View>
  );
};

const StepLine: React.FC<{done: boolean}> = ({done}) => {
  const progress = useRef(new Animated.Value(done ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: done ? 1 : 0,
      duration: 320,
      useNativeDriver: false,
    }).start();
  }, [done, progress]);

  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.12)', color.buttonColor],
  });

  return <Animated.View style={[styles.line, {backgroundColor}]} />;
};

const Stepper: React.FC<StepperProps> = ({steps}) => {
  const firstUndone = steps.findIndex(s => !s.done);
  const activeIndex = firstUndone === -1 ? steps.length - 1 : firstUndone;

  return (
    <View style={styles.container}>
      {steps.map((step, i) => (
        <React.Fragment key={step.label}>
          <StepDot step={step} index={i} isActive={i === activeIndex} />
          {i < steps.length - 1 && <StepLine done={steps[i + 1].done} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
    marginBottom: 28,
  },
  dotWrap: {flex: 1, alignItems: 'center'},
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    borderColor: color.buttonColor,
    backgroundColor: 'rgba(254,212,40,0.14)',
  },
  dotDone: {
    backgroundColor: color.buttonColor,
    borderColor: color.buttonColor,
  },
  dotLabel: {fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.38)'},
  dotLabelActive: {color: color.buttonColor},
  stepText: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },
  stepTextActive: {color: '#fff'},
  line: {
    flex: 1,
    height: 2,
    marginTop: 14,
    marginHorizontal: -8,
    borderRadius: 1,
  },
});

export default Stepper;
