import React from 'react';
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

export const CircleCarousel: React.FC<CircleCarouselProps> = ({
  totalDoses,
  checkedDoses,
  onToggleCheck,
  onToggleUncheck,
}) => {
  // Always show at least one empty circle
  const displayCount = Math.max(totalDoses, 1);

  const handleCirclePress = (index: number) => {
    if (index < checkedDoses) {
      // This circle is checked, uncheck it
      onToggleUncheck();
    } else {
      // This circle is unchecked, check it
      onToggleCheck();
    }
  };

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
          >
            <View
              style={[
                styles.circle,
                isChecked ? styles.circleChecked : styles.circleUnchecked,
              ]}
            >
              {isChecked && (
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color="#fff"
                />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  circleWrapper: {
    marginHorizontal: 6,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
});
