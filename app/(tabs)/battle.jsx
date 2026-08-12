import { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { fetchQuestions } from '../../src/services/questionService';
import { updateUserProgress } from '../../src/services/authService';
import LevelUpModal from '../../src/components/LevelUpModal';

// ── Eddium Brand Colors ───────────────────────────────────
const NAVY      = '#091057';
const TEAL      = '#2D9596';
const BLUE      = '#1053A9';
const PALE_BLUE = '#CDEDFF';
const ICE       = '#ECF6FF';
const ORANGE    = '#EC8305';
const DANGER    = '#DF4547';
const WHITE     = '#FFFFFF';
const MUTED     = '#5B7A9D';
const BORDER    = '#CDEDFF';
const ARENA_BG  = '#091057';

const TOTAL_QUESTIONS = 5;

// ── Inline Player Animation ───────────────────────────────
function PlayerCharacter({ state = 'idle', size = 90 }) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const loopRef    = useRef(null);

  function startBounce() {
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 900, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue:  0, duration: 900, useNativeDriver: true }),
      ])
    );
    loopRef.current.start();
  }

  // Mount — start idle
  useEffect(() => {
    startBounce();
    return () => loopRef.current?.stop();
  }, []);

  // State changes
  useEffect(() => {
    if (state === 'idle') {
      scaleAnim.setValue(1);
      rotateAnim.setValue(0);
      startBounce();
      return;
    }
    loopRef.current?.stop();
    bounceAnim.setValue(0);

    if (state === 'attack') {
      Animated.sequence([
        Animated.timing(scaleAnim,  { toValue: 1.5, duration: 120, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 1,   duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim,  { toValue: 1.0, duration: 200, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0,   duration: 150, useNativeDriver: true }),
      ]).start();
    }

    if (state === 'hurt') {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.7, duration: 80,  useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [state]);

  const rotate = rotateAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0deg', '25deg'],
  });

  const emoji =
    state === 'attack' ? '🗡️' :
    state === 'hurt'   ? '😵' : '🧙‍♀️';

  return (
    <Animated.View style={{
      width: size, height: size,
      alignItems: 'center', justifyContent: 'center',
      transform: [
        { translateY: bounceAnim },
        { scale:      scaleAnim  },
        { rotate:     rotate     },
      ],
    }}>
      <Text style={{ fontSize: size * 0.72 }}>{emoji}</Text>
    </Animated.View>
  );
}

// ── Inline Monster Animation ──────────────────────────────
function MonsterCharacter({ state = 'idle', size = 90 }) {
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const opacAnim   = useRef(new Animated.Value(1)).current;
  const loopRef    = useRef(null);

  function startBounce() {
    loopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -5, duration: 700, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue:  0, duration: 700, useNativeDriver: true }),
      ])
    );
    loopRef.current.start();
  }

  useEffect(() => {
    startBounce();
    return () => loopRef.current?.stop();
  }, []);

  useEffect(() => {
    if (state === 'idle') {
      scaleAnim.setValue(1);
      opacAnim.setValue(1);
      shakeAnim.setValue(0);
      startBounce();
      return;
    }
    loopRef.current?.stop();
    bounceAnim.setValue(0);

    if (state === 'hurt') {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue:  16, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -16, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  10, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:   0, duration: 55, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 0.75, duration: 80,  useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0,  duration: 150, useNativeDriver: true }),
      ]).start();
    }

    if (state === 'attack') {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.4, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 200, useNativeDriver: true }),
      ]).start();
    }

    if (state === 'death') {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        Animated.timing(opacAnim,  { toValue: 0, duration: 700, useNativeDriver: true }),
      ]).start();
    }
  }, [state]);

  const emoji =
    state === 'attack' ? '👿' :
    state === 'hurt'   ? '🤕' :
    state === 'death'  ? '💀' : '👹';

  return (
    <Animated.View style={{
      width: size, height: size,
      alignItems: 'center', justifyContent: 'center',
      opacity: opacAnim,
      transform: [
        { translateY: bounceAnim },
        { translateX: shakeAnim  },
        { scale:      scaleAnim  },
      ],
    }}>
      <Text style={{ fontSize: size * 0.72 }}>{emoji}</Text>
    </Animated.View>
  );
}

// ── Attack Effect ─────────────────────────────────────────
function AttackEffect({ visible, type = 'correct' }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      opacAnim.setValue(1);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 2, friction: 3, tension: 40, useNativeDriver: true,
        }),
        Animated.timing(opacAnim, {
          toValue: 0, duration: 700, useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={{
      position: 'absolute',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 99,
      opacity:   opacAnim,
      transform: [{ scale: scaleAnim }],
    }}>
      <Text style={{ fontSize: 36 }}>
        {type === 'correct' ? '💥' : '💢'}
      </Text>
    </Animated.View>
  );
}

// ── Main Battle Screen ────────────────────────────────────
export default function BattleScreen() {
  const { user, userData } = useAuth();
  const router = useRouter();

  // Game state
  const [phase,        setPhase]        = useState('loading');
  const [questions,    setQuestions]    = useState([]);
  const [currentQ,     setCurrentQ]     = useState(0);
  const [selected,     setSelected]     = useState(null);
  const [answered,     setAnswered]     = useState(false);
  const [isCorrect,    setIsCorrect]    = useState(null);
  const [playerHP,     setPlayerHP]     = useState(100);
  const [monsterHP,    setMonsterHP]    = useState(100);
  const [xpEarned,     setXpEarned]     = useState(0);
  const [wordsLearned, setWordsLearned] = useState([]);
  const [score,        setScore]        = useState(0);
  const [saving,       setSaving]       = useState(false);

  // Animation state
  const [playerAnim,  setPlayerAnim]  = useState('idle');
  const [monsterAnim, setMonsterAnim] = useState('idle');
  const [showEffect,  setShowEffect]  = useState(false);
  const [effectType,  setEffectType]  = useState('correct');

  // Level up
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel,    setNewLevel]    = useState(1);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { loadQuestions(); }, []);

  async function loadQuestions() {
    setPhase('loading');
    const level = userData?.level || 1;
    const qs    = await fetchQuestions(level, 'IELTS', TOTAL_QUESTIONS);
    if (qs.length === 0) { setPhase('noQuestions'); return; }
    setQuestions(qs);
    setPhase('battle');
  }

  function shakeScreen() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function handleSelect(index) {
    if (answered) return;
    setSelected(index);
  }

  function handleAttack() {
    if (selected === null || answered) return;

    const question = questions[currentQ];
    const correct  = selected === question.correctIndex;
    const earned   = correct ? Number(question.xpReward) || 0 : 0;

    const nextXP      = xpEarned + earned;
    const nextScore   = score + (correct ? 1 : 0);
    const nextWords   = correct ? [...wordsLearned, question.word] : [...wordsLearned];
    const nextPlayerHP= correct ? playerHP : Math.max(0, playerHP - 15);

    setAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      // ── Correct answer animations ──
      setEffectType('correct');
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 700);

      setPlayerAnim('attack');
      setTimeout(() => setPlayerAnim('idle'), 800);

      const damage       = getDamage(question.difficulty);
      const newMonsterHP = Math.max(0, monsterHP - damage);
      setMonsterHP(newMonsterHP);

      setTimeout(() => {
        if (newMonsterHP <= 0) {
          setMonsterAnim('death');
        } else {
          setMonsterAnim('hurt');
          setTimeout(() => setMonsterAnim('idle'), 1000);
        }
      }, 400);

      setXpEarned(prev  => prev + earned);
      setScore(prev     => prev + 1);
      setWordsLearned(prev => [...prev, question.word]);

    } else {
      // ── Wrong answer animations ──
      setEffectType('wrong');
      setShowEffect(true);
      setTimeout(() => setShowEffect(false), 700);

      setMonsterAnim('attack');
      setTimeout(() => setMonsterAnim('idle'), 800);

      setTimeout(() => {
        setPlayerAnim('hurt');
        setTimeout(() => setPlayerAnim('idle'), 800);
      }, 300);

      shakeScreen();
      setPlayerHP(prev => Math.max(0, prev - 15));
    }

    const nextQ     = currentQ + 1;
    const battleEnds =
      nextQ >= questions.length ||
      nextPlayerHP <= 0;

    setTimeout(() => {
      if (battleEnds) {
        endBattle(nextXP, nextWords, nextScore);
      } else {
        setCurrentQ(nextQ);
        setSelected(null);
        setAnswered(false);
        setIsCorrect(null);
        setPlayerAnim('idle');
        setMonsterAnim('idle');
      }
    }, 1500);
  }

  function getDamage(difficulty) {
    switch (difficulty) {
      case 'beginner':     return 15;
      case 'intermediate': return 20;
      case 'advanced':     return 30;
      default:             return 15;
    }
  }

  async function endBattle(
    finalXP    = xpEarned,
    finalWords = wordsLearned,
    finalScore = score
  ) {
    setPhase('summary');
    setSaving(true);

    try {
      const validWords = finalWords.filter(w => w && typeof w === 'string' && w.trim() !== '');

      if (!user?.uid) return;

      const result = await updateUserProgress(
        user.uid,
        finalXP,
        validWords,
        { score: finalScore, total: questions.length }
      );

      if (result?.leveledUp) {
        setNewLevel(result.newLevel);
        setShowLevelUp(true);
      }
    } catch (error) {
      console.error('endBattle ERROR:', error);
    } finally {
      setSaving(false);
    }
  }

  // ── Loading ─────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={TEAL} />
        <Text style={styles.loadingText}>Preparing battle...</Text>
      </View>
    );
  }

  // ── No Questions ─────────────────────────────────────────
  if (phase === 'noQuestions') {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>📭</Text>
        <Text style={styles.noQTitle}>No questions available</Text>
        <Text style={styles.noQSub}>Ask your admin to add questions</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.backBtnText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Summary ──────────────────────────────────────────────
  if (phase === 'summary') {
    const won = monsterHP <= 0 || score === questions.length;
    return (
      <ScrollView contentContainerStyle={styles.summaryContainer}>

        <LevelUpModal
          visible={showLevelUp}
          newLevel={newLevel}
          xpEarned={xpEarned}
          wordsLearned={wordsLearned.filter(w => w && w.trim() !== '').length}
          onContinue={() => {
            setShowLevelUp(false);
            router.replace('/(tabs)/home');
          }}
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryEmoji}>{won ? '🏆' : '💪'}</Text>
          <Text style={styles.summaryTitle}>
            {won ? 'Victory!' : 'Battle Complete!'}
          </Text>
          <Text style={styles.summarySubtitle}>
            {won ? 'You defeated the Vocab Goblin!' : 'Keep training, warrior!'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{score}/{questions.length}</Text>
              <Text style={styles.statLbl}>Correct</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: TEAL }]}>+{xpEarned}</Text>
              <Text style={styles.statLbl}>XP earned</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>
                {wordsLearned.filter(w => w && w.trim() !== '').length}
              </Text>
              <Text style={styles.statLbl}>Words</Text>
            </View>
          </View>

          {wordsLearned.filter(w => w && w.trim() !== '').length > 0 && (
            <View style={styles.wordsWrap}>
              <Text style={styles.wordsTitle}>Words mastered:</Text>
              <View style={styles.wordsList}>
                {wordsLearned
                  .filter(w => w && w.trim() !== '')
                  .map((w, i) => (
                    <View key={i} style={styles.wordChip}>
                      <Text style={styles.wordChipText}>{w}</Text>
                    </View>
                  ))
                }
              </View>
            </View>
          )}

          {saving && (
            <View style={styles.savingRow}>
              <ActivityIndicator size="small" color={TEAL} />
              <Text style={styles.savingText}>Saving progress...</Text>
            </View>
          )}

          {!saving && !showLevelUp && (
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <Text style={styles.continueBtnText}>Continue Training</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  // ── Battle ───────────────────────────────────────────────
  const question = questions[currentQ];

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ translateX: shakeAnim }] }
    ]}>

      {/* ── ARENA ──────────────────────────── */}
      <View style={styles.arena}>

        {/* Player */}
        <View style={styles.fighter}>
          <PlayerCharacter state={playerAnim} size={90} />
          <Text style={styles.fighterName}>
            {userData?.username || 'Student'}
          </Text>
          <View style={styles.hpWrap}>
            <Text style={styles.hpLabel}>HP</Text>
            <View style={styles.hpTrack}>
              <View style={[
                styles.hpFill,
                { width: `${playerHP}%`, backgroundColor: TEAL }
              ]} />
            </View>
          </View>
        </View>

        {/* Center — VS + effect */}
        <View style={styles.vsWrap}>
          <AttackEffect visible={showEffect} type={effectType} />
          <Text style={styles.vsText}>VS</Text>
          <View style={styles.roundBadge}>
            <Text style={styles.roundText}>
              Q {currentQ + 1}/{questions.length}
            </Text>
          </View>
        </View>

        {/* Monster */}
        <View style={styles.fighter}>
          <MonsterCharacter state={monsterAnim} size={90} />
          <Text style={styles.fighterName}>Vocab Goblin</Text>
          <View style={styles.hpWrap}>
            <Text style={styles.hpLabel}>HP</Text>
            <View style={styles.hpTrack}>
              <View style={[
                styles.hpFill,
                { width: `${monsterHP}%`, backgroundColor: DANGER }
              ]} />
            </View>
          </View>
        </View>

      </View>

      {/* ── PROGRESS BAR ───────────────────── */}
      <View style={styles.progressWrap}>
        <Text style={styles.progressLabel}>
          Question {currentQ + 1} of {questions.length}
        </Text>
        <Text style={styles.xpHint}>
          +{question.xpReward} XP on correct
        </Text>
        <View style={styles.progressTrack}>
          <View style={[
            styles.progressFill,
            { width: `${(currentQ / questions.length) * 100}%` }
          ]} />
        </View>
      </View>

      {/* ── QUESTION AREA ──────────────────── */}
      <ScrollView
        style={styles.questionArea}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Question card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionHint}>
            DEFEAT THE GOBLIN — ANSWER CORRECTLY
          </Text>
          <Text style={styles.questionText}>
            What does{' '}
            <Text style={{ color: TEAL }}>
              {question.word.toUpperCase()}
            </Text>
            {' '}mean?
          </Text>
          <Text style={styles.questionSub}>
            Choose the correct definition
          </Text>
        </View>

        {/* Answer options */}
        <View style={styles.optionsWrap}>
          {question.options.map((opt, i) => {
            let optStyle   = styles.option;
            let badgeStyle = styles.optBadge;
            let badgeText  = styles.optBadgeText;

            if (answered) {
              if (i === question.correctIndex) {
                optStyle   = [styles.option, styles.optCorrect];
                badgeStyle = [styles.optBadge, styles.optBadgeCorrect];
              } else if (i === selected && !isCorrect) {
                optStyle   = [styles.option, styles.optWrong];
                badgeStyle = [styles.optBadge, styles.optBadgeWrong];
              }
            } else if (selected === i) {
              optStyle   = [styles.option, styles.optSelected];
              badgeStyle = [styles.optBadge, styles.optBadgeSelected];
              badgeText  = [styles.optBadgeText, { color: WHITE }];
            }

            return (
              <TouchableOpacity
                key={i}
                style={optStyle}
                onPress={() => handleSelect(i)}
                disabled={answered}
                activeOpacity={0.8}
              >
                <View style={badgeStyle}>
                  <Text style={badgeText}>
                    {['A', 'B', 'C', 'D'][i]}
                  </Text>
                </View>
                <Text style={styles.optText}>{opt}</Text>
                {answered && i === question.correctIndex && (
                  <Text style={styles.correctTick}>✓</Text>
                )}
                {answered && i === selected && !isCorrect && (
                  <Text style={styles.wrongX}>✗</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {answered && (
          <View style={[
            styles.feedback,
            isCorrect ? styles.feedbackCorrect : styles.feedbackWrong
          ]}>
            <Text style={[
              styles.feedbackText,
              isCorrect ? { color: TEAL } : { color: DANGER }
            ]}>
              {isCorrect
                ? `✓ Correct! +${question.xpReward} XP earned`
                : `✗ Wrong! Correct: ${question.options[question.correctIndex]}`
              }
            </Text>
          </View>
        )}

        {/* Attack button */}
        <TouchableOpacity
          style={[
            styles.attackBtn,
            (selected === null || answered) && styles.attackBtnDisabled
          ]}
          onPress={handleAttack}
          disabled={selected === null || answered}
          activeOpacity={0.85}
        >
          <Text style={styles.attackIcon}>⚔️</Text>
          <Text style={styles.attackText}>Attack!</Text>
        </TouchableOpacity>

        <Text style={styles.wrongHint}>
          Wrong answer = Goblin attacks you (-15 HP)
        </Text>

      </ScrollView>

      {/* ── LEVEL UP MODAL ─────────────────── */}
      <LevelUpModal
        visible={showLevelUp}
        newLevel={newLevel}
        xpEarned={xpEarned}
        wordsLearned={wordsLearned.filter(w => w && w.trim() !== '').length}
        onContinue={() => {
          setShowLevelUp(false);
          router.replace('/(tabs)/home');
        }}
      />

    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: ICE },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: ICE, padding: 24, gap: 12,
  },
  loadingText: { fontSize: 14, color: MUTED, fontWeight: '600' },
  emoji:       { fontSize: 48 },
  noQTitle:    { fontSize: 18, fontWeight: '800', color: NAVY },
  noQSub:      { fontSize: 13, color: MUTED },
  backBtn: {
    backgroundColor: TEAL, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  backBtnText: { color: WHITE, fontWeight: '700', fontSize: 14 },

  // Arena
  arena: {
    backgroundColor: ARENA_BG,
    padding: 16,
    paddingTop: 52,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 220,
  },
  fighter: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  fighterName: {
    color: WHITE,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  hpWrap:  { width: 90, gap: 3 },
  hpLabel: { color: WHITE, fontSize: 8, fontWeight: '700' },
  hpTrack: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  hpFill:  { height: '100%', borderRadius: 999 },
  vsWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    position: 'relative',
  },
  vsText:    { color: WHITE, fontSize: 16, fontWeight: '900' },
  roundBadge: {
    backgroundColor: 'rgba(236,131,5,0.2)',
    borderWidth: 0.5,
    borderColor: 'rgba(236,131,5,0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roundText: { color: ORANGE, fontSize: 9, fontWeight: '800' },

  // Progress
  progressWrap: {
    backgroundColor: WHITE,
    padding: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: BORDER,
  },
  progressLabel: { fontSize: 11, fontWeight: '700', color: TEAL },
  xpHint:        { fontSize: 10, color: MUTED, textAlign: 'right', marginTop: -16 },
  progressTrack: {
    height: 7,
    backgroundColor: BORDER,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: { height: '100%', backgroundColor: TEAL, borderRadius: 999 },

  // Question
  questionArea: { flex: 1 },
  questionCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: BORDER,
    padding: 16,
    margin: 12,
    marginBottom: 8,
  },
  questionHint: {
    fontSize: 9, fontWeight: '800', color: MUTED,
    textTransform: 'uppercase', letterSpacing: 0.8,
    textAlign: 'center', marginBottom: 10,
  },
  questionText: {
    fontSize: 16, fontWeight: '800', color: NAVY,
    textAlign: 'center', lineHeight: 22, marginBottom: 6,
  },
  questionSub: { fontSize: 11, color: MUTED, textAlign: 'center', fontWeight: '600' },

  // Options
  optionsWrap: { paddingHorizontal: 12, gap: 8 },
  option: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: WHITE, borderRadius: 12,
    borderWidth: 1.5, borderColor: BORDER,
    padding: 12, gap: 10,
  },
  optSelected: { borderColor: TEAL,   backgroundColor: ICE        },
  optCorrect:  { borderColor: TEAL,   backgroundColor: '#E0F8F7'  },
  optWrong:    { borderColor: DANGER, backgroundColor: '#FFF0F0'  },
  optBadge: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: PALE_BLUE,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  optBadgeSelected: { backgroundColor: TEAL   },
  optBadgeCorrect:  { backgroundColor: TEAL   },
  optBadgeWrong:    { backgroundColor: DANGER },
  optBadgeText:     { fontSize: 12, fontWeight: '800', color: BLUE },
  optText:          { fontSize: 13, fontWeight: '600', color: NAVY, flex: 1 },
  correctTick:      { fontSize: 16, color: TEAL,   marginLeft: 'auto' },
  wrongX:           { fontSize: 16, color: DANGER, marginLeft: 'auto' },

  // Feedback
  feedback: { marginHorizontal: 12, marginTop: 8, padding: 12, borderRadius: 10 },
  feedbackCorrect: { backgroundColor: '#E0F8F7' },
  feedbackWrong:   { backgroundColor: '#FFF0F0' },
  feedbackText:    { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  // Attack
  attackBtn: {
    backgroundColor: TEAL,
    borderRadius: 14,
    marginHorizontal: 12,
    marginTop: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  attackBtnDisabled: { backgroundColor: PALE_BLUE },
  attackIcon:        { fontSize: 18 },
  attackText:        { color: WHITE, fontSize: 15, fontWeight: '800' },
  wrongHint: {
    textAlign: 'center', fontSize: 10,
    color: MUTED, marginTop: 8, fontWeight: '600',
  },

  // Summary
  summaryContainer: {
    flexGrow: 1, backgroundColor: ICE,
    padding: 24, alignItems: 'center', justifyContent: 'center',
  },
  summaryCard: {
    backgroundColor: WHITE, borderRadius: 20,
    padding: 24, width: '100%', alignItems: 'center',
    borderWidth: 1, borderColor: BORDER, gap: 12,
  },
  summaryEmoji:    { fontSize: 56 },
  summaryTitle:    { fontSize: 28, fontWeight: '900', color: NAVY },
  summarySubtitle: { fontSize: 13, color: MUTED, textAlign: 'center' },
  statsRow:        { flexDirection: 'row', gap: 12, width: '100%' },
  statBox: {
    flex: 1, backgroundColor: ICE, borderRadius: 12,
    padding: 12, alignItems: 'center',
    borderWidth: 0.5, borderColor: BORDER,
  },
  statNum:       { fontSize: 22, fontWeight: '800', color: NAVY },
  statLbl:       { fontSize: 10, color: MUTED, marginTop: 3, fontWeight: '600' },
  wordsWrap:     { width: '100%' },
  wordsTitle:    { fontSize: 12, fontWeight: '700', color: MUTED, marginBottom: 8 },
  wordsList:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  wordChip: {
    backgroundColor: ICE, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: BORDER,
  },
  wordChipText:    { fontSize: 12, fontWeight: '700', color: TEAL },
  savingRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  savingText:      { fontSize: 13, color: MUTED },
  continueBtn: {
    backgroundColor: TEAL, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32,
    width: '100%', alignItems: 'center',
  },
  continueBtnText: { color: WHITE, fontSize: 15, fontWeight: '800' },
});