import React from 'react';
import { Image, Text, View } from 'react-native';

interface InitialsAvatarProps {
  initials: string;
  size?: number;
  avatarUrl?: string | null;
  localAvatarUri?: string | null;
}

export const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ initials, size = 44, avatarUrl, localAvatarUri }) => {
  const borderRadius = size / 2;
  const sourceUri = localAvatarUri || avatarUrl;

  if (sourceUri) {
    return (
      <Image
        source={{ uri: sourceUri }}
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
