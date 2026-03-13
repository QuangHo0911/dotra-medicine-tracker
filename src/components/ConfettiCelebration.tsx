import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  trigger,
  onComplete,
}) => {
  const confettiRef = useRef<ConfettiCannon>(null);

  useEffect(() => {
    if (trigger && confettiRef.current) {
      confettiRef.current.start();
    }
  }, [trigger]);

  if (!trigger) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <ConfettiCannon
        ref={confettiRef}
        count={100}
        origin={{ x: 200, y: 0 }}
        autoStart={false}
        fadeOut={true}
        onAnimationEnd={onComplete}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    pointerEvents: 'none',
  },
});
