import React from 'react';
import { Image, Text, View } from 'react-native';

interface InitialsAvatarProps {
  initials: string;
  size?: number;
  avatarUrl?: string | null;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ initials, size = 44, avatarUrl }) => {
  const borderRadius = size / 2;

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius }}
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        backgroundColor: '#E4DDCB',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#024039', fontSize: size * 0.34, fontWeight: '700' }}>{initials}</Text>
    </View>
  );
};
