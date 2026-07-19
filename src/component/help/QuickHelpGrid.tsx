import React, {memo} from 'react';
import {StyleSheet, View} from 'react-native';
import QuickHelpCard, {QuickHelpCardProps} from './QuickHelpCard';

export interface QuickHelpItem extends QuickHelpCardProps {
  key: string;
}

interface QuickHelpGridProps {
  items: QuickHelpItem[];
}

// Fixed-size (8 item) responsive 2-column grid — plain flex-wrap rather
// than FlatList so it can sit inside HelpCenter's outer ScrollView without
// tripping the "VirtualizedList inside ScrollView" warning.
const QuickHelpGrid: React.FC<QuickHelpGridProps> = ({items}) => {
  return (
    <View style={styles.grid}>
      {items.map(({key, ...cardProps}) => (
        <QuickHelpCard key={key} {...cardProps} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});

export default memo(QuickHelpGrid);
