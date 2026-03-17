import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Check, Sparkles } from 'lucide-react-native';
import { RootStackParamList } from '../types';
import { ConfettiCelebration } from '../components/ConfettiCelebration';

type Props = NativeStackScreenProps<RootStackParamList, 'Completion'>;

export const CompletionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { summary } = route.params;
  const highlightText = summary.streak > 1 ? 'You protected your streak today.' : 'One completed day is a strong restart.';

  return (
    <View style={{ flex: 1, backgroundColor: '#0A655A', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}>
      <ConfettiCelebration trigger onComplete={() => undefined} />

      <View style={{ position: 'absolute', top: 82, right: -22, width: 152, height: 152, borderRadius: 76, backgroundColor: 'rgba(255,255,255,0.07)' }} />
      <View style={{ position: 'absolute', bottom: 74, left: -26, width: 188, height: 188, borderRadius: 94, borderWidth: 24, borderColor: 'rgba(228,221,203,0.12)' }} />

      <View style={{ alignItems: 'center' }}>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <Sparkles size={14} color="#E4DDCB" />
          <Text style={{ color: '#E4DDCB', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
            Daily routine complete
          </Text>
        </View>

        <View style={{ width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
          <View style={{ width: 108, height: 108, borderRadius: 54, backgroundColor: '#E7F5ED', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={56} color="#0A655A" strokeWidth={3.5} />
          </View>
        </View>

        <Text style={{ color: '#FFF', fontSize: 34, fontWeight: '700', textAlign: 'center', marginBottom: 10 }}>
          All doses checked off.
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.82)', fontSize: 17, lineHeight: 25, textAlign: 'center', marginBottom: 16 }}>
          That kind of follow-through makes tomorrow easier before it even begins.
        </Text>

        <View style={{ backgroundColor: 'rgba(231,245,237,0.16)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginBottom: 24 }}>
          <Text style={{ color: '#E4DDCB', fontSize: 13, fontWeight: '700' }}>{highlightText}</Text>
        </View>

        <View style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 30, padding: 22, marginBottom: 28 }}>
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <Text style={{ color: '#FFF', fontSize: 52, fontWeight: '700' }}>{summary.streak}</Text>
            <Text style={{ color: '#E4DDCB', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.9 }}>
              Day streak
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 16 }}>
              <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 4 }}>{summary.completedDoses}/{summary.totalDoses}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.68)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.7 }}>Doses taken</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 16 }}>
              <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700', marginBottom: 4 }}>{summary.progressPercentage}%</Text>
              <Text style={{ color: 'rgba(255,255,255,0.68)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.7 }}>Daily progress</Text>
            </View>
          </View>

          <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)', paddingTop: 16 }}>
            <Text style={{ color: '#E4DDCB', fontSize: 13, marginBottom: 8 }}>Today’s completion</Text>
            <View style={{ height: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(summary.progressPercentage, 100)}%`, height: '100%', borderRadius: 999, backgroundColor: '#E4DDCB' }} />
            </View>
          </View>
        </View>

        <Pressable
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
          style={{ backgroundColor: '#E4DDCB', borderRadius: 999, paddingVertical: 18, paddingHorizontal: 36 }}
        >
          <Text style={{ color: '#0A655A', fontWeight: '700', fontSize: 16 }}>Back to home</Text>
        </Pressable>
      </View>
    </View>
  );
};
