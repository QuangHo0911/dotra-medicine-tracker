import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CircleCarouselProps {
  totalDoses: number;
  checkedDoses: number;
  onToggleCheck: () => void;
  onToggleUncheck: () => void;
}

const { width } = Dimensions.get('window');

export const CircleCarousel: React.FC<CircleCarouselProps> = React.memo(({
  totalDoses,
  checkedDoses,
  onToggleCheck,
  onToggleUncheck,
}) => {
  // Always show at least one empty circle
  const displayCount = Math.max(totalDoses, 1);

  const handleCirclePress = useCallback((index: number) => {
    if (index < checkedDoses) {
      // This circle is checked, uncheck it
      onToggleUncheck();
    } else {
      // This circle is unchecked, check it
      onToggleCheck();
    }
  }, [checkedDoses, onToggleCheck, onToggleUncheck]);

  // Memoize circle styles
  const getCircleStyle = useCallback((isChecked: boolean) => {
    return isChecked ? styles.circleChecked : styles.circleUnchecked;
  }, []);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {Array.from({ length: displayCount }).map((_, index) => {
        const isChecked = index < checkedDoses;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleCirclePress(index)}
            style={styles.circleWrapper}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
          >
            <View
              style={[
                styles.circle,
                getCircleStyle(isChecked),
              ]}
            >
              {isChecked ? (
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color="#fff"
                />
              ) : (
                <Text style={styles.circleNumber}>{index + 1}</Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

CircleCarousel.displayName = 'CircleCarousel';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  circleWrapper: {
    marginHorizontal: 6,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  circleChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  circleUnchecked: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },
  circleNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
});
