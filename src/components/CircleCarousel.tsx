import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Check } from 'lucide-react-native';

interface CircleCarouselProps {
  totalDoses: number;
  checkedDoses: number;
  onToggleCheck: () => void;
  onToggleUncheck: () => void;
}

const { width } = Dimensions.get('window');

// Circle dimensions for scroll calculations
const CIRCLE_WIDTH = 40;
const CIRCLE_MARGIN = 6;
const TOTAL_CIRCLE_WIDTH = CIRCLE_WIDTH + CIRCLE_MARGIN * 2; // 52px

export const CircleCarousel: React.FC<CircleCarouselProps> = React.memo(({
  totalDoses,
  checkedDoses,
  onToggleCheck,
  onToggleUncheck,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Always show at least one empty circle
  const displayCount = Math.max(totalDoses, 1);

  // Calculate if carousel needs peek offset (content overflows container)
  const totalContentWidth = displayCount * TOTAL_CIRCLE_WIDTH;
  const needsPeekOffset = totalContentWidth > containerWidth && containerWidth > 0;

  // Auto-scroll to first unchecked circle on mount
  useEffect(() => {
    if (scrollViewRef.current && containerWidth > 0) {
      const firstUncheckedIndex = checkedDoses;
      const scrollToX = firstUncheckedIndex * TOTAL_CIRCLE_WIDTH;

      // Only scroll if there are circles beyond what's visible and we're not at the start
      if (firstUncheckedIndex > 0 || needsPeekOffset) {
        scrollViewRef.current.scrollTo({
          x: scrollToX,
          animated: true,
        });
      }
    }
  }, [containerWidth]); // Run when container width is known (on mount/layout)

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
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        needsPeekOffset && styles.containerWithPeek,
      ]}
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
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
                <Check
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
  containerWithPeek: {
    paddingLeft: -20, // Negative offset creates peek effect
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
