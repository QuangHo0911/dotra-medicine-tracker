import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { ConfettiCelebration } from '../components/ConfettiCelebration';

type Props = NativeStackScreenProps<RootStackParamList, 'Completion'>;

export const CompletionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { summary } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: '#024039', justifyContent: 'center', padding: 24 }}>
      <ConfettiCelebration trigger onComplete={() => undefined} />
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          <Check size={56} color="#024039" strokeWidth={3.5} />
        </View>
        <Text style={{ color: '#FFF', fontSize: 34, fontWeight: '700', marginBottom: 8 }}>All Doses Taken!</Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, marginBottom: 24 }}>That’s the kind of consistency that builds trust with yourself.</Text>
        <View style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 24, padding: 24, marginBottom: 28 }}>
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ color: '#FFF', fontSize: 48, fontWeight: '700' }}>{summary.streak}</Text>
            <Text style={{ color: '#E4DDCB', fontSize: 15, fontWeight: '700', textTransform: 'uppercase' }}>Day streak</Text>
          </View>
          <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingTop: 18 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700' }}>{summary.completedDoses} of {summary.totalDoses}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontSize: 12 }}>Total Doses</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700' }}>{summary.progressPercentage}%</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', fontSize: 12 }}>Daily progress</Text>
            </View>
          </View>
        </View>
        <Pressable onPress={() => navigation.navigate('MainTabs')} style={{ backgroundColor: '#E4DDCB', borderRadius: 999, paddingVertical: 18, paddingHorizontal: 36 }}>
          <Text style={{ color: '#024039', fontWeight: '700', fontSize: 16 }}>See you tomorrow</Text>
        </Pressable>
      </View>
    </View>
  );
};
