import { useEffect, useRef } from 'react';
import {
  View, Text, Modal, TouchableOpacity,
  StyleSheet, Animated, Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const NAVY      = '#091057';
const TEAL      = '#2D9596';
const BLUE      = '#1053A9';
const PALE_BLUE = '#CDEDFF';
const ORANGE    = '#EC8305';
const PEACH     = '#FFE2AD';
const TEAL_MID  = '#5DD1D1';
const WHITE     = '#FFFFFF';
const MUTED     = '#5B7A9D';

function getLevelTitle(level) {
  if (level >= 10) return 'Dojo Master';
  if (level >= 7)  return 'Senior Warrior';
  if (level >= 5)  return 'IELTS Scholar';
  if (level >= 3)  return 'Apprentice';
  if (level >= 2)  return 'Novice';
  return 'Beginner';
}

// ── Particle ──────────────────────────────────────────────
function Particle({ delay, color, startX, duration }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue:         1,
          duration:        duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue:         0,
          duration:        0,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, -height * 0.6],
  });
  const opacity = anim.interpolate({
    inputRange:  [0, 0.7, 1],
    outputRange: [1, 0.8, 0],
  });
  const scale = anim.interpolate({
    inputRange:  [0, 0.5, 1],
    outputRange: [0.5, 1.2, 0.8],
  });

  return (
    <Animated.View style={[
      styles.particle,
      {
        backgroundColor: color,
        left:            startX,
        transform:       [{ translateY }, { scale }],
        opacity,
      }
    ]} />
  );
}

const PARTICLES = [
  { color: TEAL,     startX: 40,  delay: 0,    duration: 2000 },
  { color: ORANGE,   startX: 80,  delay: 200,  duration: 1800 },
  { color: TEAL_MID, startX: 140, delay: 100,  duration: 2200 },
  { color: PEACH,    startX: 200, delay: 300,  duration: 1900 },
  { color: BLUE,     startX: 260, delay: 150,  duration: 2100 },
  { color: TEAL,     startX: 300, delay: 400,  duration: 1700 },
  { color: ORANGE,   startX: 50,  delay: 500,  duration: 2300 },
  { color: TEAL_MID, startX: 330, delay: 250,  duration: 2000 },
  { color: PEACH,    startX: 170, delay: 350,  duration: 1800 },
  { color: BLUE,     startX: 110, delay: 450,  duration: 2100 },
];

export default function LevelUpModal({ visible, newLevel, xpEarned, wordsLearned, onContinue }) {
  const scaleAnim   = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      bounceAnim.setValue(0);

      // Entrance animation
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue:         1,
          duration:        300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue:         1,
          friction:        4,
          tension:         40,
          useNativeDriver: true,
        }),
      ]).start();

      // Bounce level number
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue:         1,
            duration:        600,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue:         0,
            duration:        600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible]);

  const levelScale = bounceAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [1, 1.1],
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>

        {/* Particles */}
        <View style={styles.particlesWrap} pointerEvents="none">
          {PARTICLES.map((p, i) => (
            <Particle
              key={i}
              color={p.color}
              startX={p.startX}
              delay={p.delay}
              duration={p.duration}
            />
          ))}
        </View>

        {/* Card */}
        <Animated.View style={[
          styles.card,
          { transform: [{ scale: scaleAnim }] }
        ]}>

          {/* Top glow */}
          <View style={styles.glowTop} />

          {/* Icon */}
          <Text style={styles.crownEmoji}>👑</Text>

          {/* Level up text */}
          <Text style={styles.levelUpText}>LEVEL UP!</Text>
          <Text style={styles.levelUpSub}>
            You have reached a new level
          </Text>

          {/* Level number */}
          <Animated.View style={[
            styles.levelCircle,
            { transform: [{ scale: levelScale }] }
          ]}>
            <Text style={styles.levelNum}>{newLevel}</Text>
            <Text style={styles.levelLabel}>LEVEL</Text>
          </Animated.View>

          {/* New title */}
          <View style={styles.titleBadge}>
            <Text style={styles.titleBadgeText}>
              🏆 {getLevelTitle(newLevel)}
            </Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: ORANGE }]}>
                +{xpEarned}
              </Text>
              <Text style={styles.statLabel}>XP earned</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: TEAL }]}>
                {wordsLearned}
              </Text>
              <Text style={styles.statLabel}>Words learned</Text>
            </View>
            <View style={styles.statDiv} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: BLUE }]}>
                {newLevel}
              </Text>
              <Text style={styles.statLabel}>New level</Text>
            </View>
          </View>

          {/* Sensei message */}
          <View style={styles.senseiMsg}>
            <Text style={styles.senseiEmoji}>🧙</Text>
            <Text style={styles.senseiText}>
              "Excellent work, warrior! Your vocabulary grows stronger!"
            </Text>
          </View>

          {/* Continue button */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={onContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>
              Continue Training ⚔️
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(9,16,87,0.92)',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         24,
  },

  // Particles
  particlesWrap: {
    position:  'absolute',
    bottom:     0,
    left:       0,
    right:      0,
    height:     height,
  },
  particle: {
    position:     'absolute',
    bottom:        0,
    width:         10,
    height:        10,
    borderRadius:  5,
  },

  // Card
  card: {
    backgroundColor: WHITE,
    borderRadius:    24,
    padding:         24,
    width:           '100%',
    alignItems:      'center',
    gap:             12,
    overflow:        'hidden',
  },
  glowTop: {
    position:        'absolute',
    top:              0,
    left:             0,
    right:            0,
    height:           6,
    backgroundColor:  TEAL,
  },

  crownEmoji:    { fontSize: 52, marginTop: 8 },
  levelUpText:   { fontSize: 28, fontWeight: '900', color: NAVY, letterSpacing: 2 },
  levelUpSub:    { fontSize: 13, color: MUTED, fontWeight: '500' },

  // Level circle
  levelCircle: {
    width:           100,
    height:          100,
    borderRadius:     50,
    backgroundColor:  TEAL,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:      4,
    borderColor:      PALE_BLUE,
    marginVertical:   4,
  },
  levelNum:   { fontSize: 42, fontWeight: '900', color: WHITE },
  levelLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },

  // Title badge
  titleBadge: {
    backgroundColor:  PALE_BLUE,
    borderRadius:     20,
    paddingHorizontal:16,
    paddingVertical:   6,
    borderWidth:       1,
    borderColor:       TEAL,
  },
  titleBadgeText: { fontSize: 14, fontWeight: '700', color: BLUE },

  // Stats
  statsRow: {
    flexDirection:   'row',
    justifyContent:  'space-around',
    alignItems:      'center',
    width:           '100%',
    backgroundColor: '#F0F9FF',
    borderRadius:    14,
    paddingVertical:  14,
    paddingHorizontal:8,
    borderWidth:      1,
    borderColor:     PALE_BLUE,
  },
  statItem:  { alignItems: 'center', gap: 3, flex: 1 },
  statNum:   { fontSize: 22, fontWeight: '900' },
  statLabel: { fontSize: 10, color: MUTED, fontWeight: '600' },
  statDiv:   { width: 1, height: 36, backgroundColor: PALE_BLUE },

  // Sensei message
  senseiMsg: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    backgroundColor: '#F0F9FF',
    borderRadius:    12,
    padding:         12,
    gap:             10,
    width:           '100%',
    borderWidth:      1,
    borderColor:     PALE_BLUE,
  },
  senseiEmoji: { fontSize: 24 },
  senseiText: {
    flex:       1,
    fontSize:   12,
    color:      MUTED,
    fontStyle:  'italic',
    lineHeight:  18,
  },

  // Button
  continueBtn: {
    backgroundColor: TEAL,
    borderRadius:    14,
    paddingVertical:  14,
    paddingHorizontal:32,
    width:           '100%',
    alignItems:      'center',
    marginTop:        4,
  },
  continueBtnText: {
    color:      WHITE,
    fontSize:   15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});