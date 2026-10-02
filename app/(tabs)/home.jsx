import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Dimensions,
  Modal, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { logoutUser } from '../../src/services/authService';

const { width } = Dimensions.get('window');

const TEAL       = '#2D9596';
const TEAL_DARK  = '#1E7A6D';
const TEAL_LIGHT = '#E0F5F3';
const NAVY       = '#091057';
const BLUE       = '#1053A9';
const PALE_BLUE  = '#CDEDFF';
const ICE        = '#ECF6FF';
const ORANGE     = '#EC8305';
const PEACH      = '#FFE2AD';
const DANGER     = '#DF4547';
const WHITE      = '#FFFFFF';
const MUTED      = '#5B7A9D';
const BORDER     = '#CDEDFF';

const PATH_NODES = [
  { id: 1, label: 'Basics 1',     sublabel: 'Completed', state: 'done'    },
  { id: 2, label: 'Basics 2',     sublabel: 'Completed', state: 'done'    },
  { id: 3, label: 'Vocabulary 1', sublabel: 'Current',   state: 'current' },
  { id: 4, label: 'Vocabulary 2', sublabel: 'Locked',    state: 'locked'  },
];

// ── Info Modal ────────────────────────────────────────────
function InfoModal({ visible, title, content, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalContent}>{content}</Text>
          <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
            <Text style={styles.modalBtnText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

// ── XP Bar ────────────────────────────────────────────────
function XPBar({ value, max, color = TEAL, height = 10 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={[styles.xpTrack, { height }]}>
      <View style={[styles.xpFill, { width: `${pct}%`, backgroundColor: color, height }]} />
    </View>
  );
}

// ── Path Node ─────────────────────────────────────────────
function PathNode({ node, isLast, onPress }) {
  const isDone    = node.state === 'done';
  const isCurrent = node.state === 'current';
  const isLocked  = node.state === 'locked';

  return (
    <View style={styles.nodeWrap}>
      <View style={styles.nodeRow}>
        <View style={[
          styles.nodeConnector,
          { backgroundColor: isDone || isCurrent ? TEAL : BORDER }
        ]} />
        <TouchableOpacity
          onPress={() => !isLocked && onPress(node)}
          disabled={isLocked}
          activeOpacity={isLocked ? 1 : 0.7}
          style={[
            styles.nodeCircle,
            isDone    && { backgroundColor: TEAL,     borderColor: TEAL     },
            isCurrent && { backgroundColor: BLUE,     borderColor: BLUE,
              shadowColor: BLUE, shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
            isLocked  && { backgroundColor: PALE_BLUE, borderColor: BORDER  },
          ]}
        >
          <Text style={styles.nodeIcon}>
            {isDone ? '✓' : isCurrent ? '★' : '🔒'}
          </Text>
        </TouchableOpacity>
        {!isLast && (
          <View style={[
            styles.nodeConnector,
            { backgroundColor: isDone ? TEAL : BORDER }
          ]} />
        )}
      </View>
      <Text style={[
        styles.nodeLabel,
        isCurrent && { color: BLUE, fontWeight: '800' },
        isLocked  && { color: MUTED },
      ]}>
        {node.label}
      </Text>
      <Text style={[
        styles.nodeSublabel,
        isCurrent && { color: BLUE },
      ]}>
        {node.sublabel}
      </Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────
export default function HomeScreen() {
  const { userData } = useAuth();
  const router       = useRouter();

  const [loggingOut, setLoggingOut] = useState(false);
  const [modal,      setModal]      = useState({ visible: false, title: '', content: '' });

  const username = userData?.username        || 'Student';
  const level    = userData?.level           || 1;
  const xp       = userData?.xp              || 0;
  const xpNext   = userData?.xpToNextLevel   || 100;
  const words    = userData?.wordsLearned?.length || 0;

  function showModal(title, content) {
    setModal({ visible: true, title, content });
  }

  function closeModal() {
    setModal({ visible: false, title: '', content: '' });
  }

  async function handleLogout() {
    setLoggingOut(true);
    await logoutUser();
    router.replace('/(auth)/login');
  }

  function handleNodePress(node) {
    if (node.state === 'current' || node.state === 'done') {
      router.push('/(tabs)/battle');
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── INFO MODAL ──────────────────────────── */}
      <InfoModal
        visible={modal.visible}
        title={modal.title}
        content={modal.content}
        onClose={closeModal}
      />

      {/* ── HEADER ─────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>

          {/* Streak */}
          <TouchableOpacity
            style={styles.pill}
            onPress={() => showModal(
              '🔥 Daily Streak',
              'You have practiced for 30 days in a row! Keep going — practice every day to maintain your streak and earn bonus rewards.'
            )}
          >
            <Text style={styles.pillIcon}>🔥</Text>
            <Text style={[styles.pillText, { color: ORANGE }]}>30</Text>
          </TouchableOpacity>

          {/* XP */}
          <TouchableOpacity
            style={styles.pill}
            onPress={() => router.push('/(tabs)/progress')}
          >
            <Text style={styles.pillIcon}>⚡</Text>
            <Text style={[styles.pillText, { color: ORANGE }]}>{xp} XP</Text>
          </TouchableOpacity>

          {/* League */}
          <TouchableOpacity
            style={styles.pill}
            onPress={() => showModal(
              '🏆 Diamond League',
              'You are in the Diamond League — the highest rank. Keep earning XP to stay at the top and avoid dropping to the Gold League.'
            )}
          >
            <Text style={styles.pillIcon}>🏆</Text>
            <Text style={[styles.pillText, { color: BLUE }]}>Diamond</Text>
          </TouchableOpacity>

          {/* Gems */}
          <TouchableOpacity
            style={styles.pill}
            onPress={() => showModal(
              '💎 Gems',
              'You have 340 gems. Gems are earned by completing daily quests and winning battles. Use them to unlock power-ups and rewards.'
            )}
          >
            <Text style={styles.pillIcon}>💎</Text>
            <Text style={[styles.pillText, { color: BLUE }]}>340</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* ── SENSEI CARD ────────────────────────── */}
      <View style={styles.card}>
        <View style={styles.senseiWrap}>
          <View style={styles.senseiCircle}>
            <Text style={styles.senseiEmoji}>🧙</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv {level}</Text>
          </View>
        </View>

        <View style={styles.bubble}>
          <View style={styles.bubbleTip} />
          <Text style={styles.bubbleText}>
            Ready for today's battle, {username}?
          </Text>
        </View>

        <Text style={styles.username}>{username}</Text>

        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>IELTS</Text>
          </View>
          <Text style={styles.levelLabel}>Level {level}</Text>
        </View>

        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>EXPERIENCE</Text>
          <Text style={styles.xpValue}>{xp} / {xpNext} XP</Text>
        </View>
        <XPBar value={xp} max={xpNext} />

        {/* Words learned — tappable */}
        <TouchableOpacity
          style={styles.chip}
          onPress={() => router.push('/(tabs)/progress')}
        >
          <Text style={styles.chipText}>📚 {words} words learned</Text>
        </TouchableOpacity>
      </View>

      {/* ── DAILY QUEST ────────────────────────── */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push('/(tabs)/progress')}
        activeOpacity={0.8}
      >
        <View style={styles.questHeader}>
          <Text style={styles.sectionLabel}>DAILY QUEST</Text>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>+10 💎</Text>
          </View>
        </View>
        <View style={styles.questRow}>
          <Text style={styles.questIcon}>⚡</Text>
          <Text style={styles.questText}>Earn 20 XP today</Text>
          <Text style={styles.questArrow}>›</Text>
        </View>
        <XPBar value={xp >= 20 ? 20 : xp} max={20} color={ORANGE} height={8} />
        <Text style={styles.questCount}>{xp >= 20 ? 20 : xp} / 20</Text>
      </TouchableOpacity>

      {/* ── START BATTLE ───────────────────────── */}
      <TouchableOpacity
        style={styles.battleBtn}
        onPress={() => router.push('/(tabs)/battle')}
        activeOpacity={0.85}
      >
        <Text style={styles.battleIcon}>⚔️</Text>
        <Text style={styles.battleText}>Start Battle</Text>
      </TouchableOpacity>

      {/* ── DOJO LIBRARY ───────────────────────── */}
      <TouchableOpacity
        style={styles.dojoBtn}
        onPress={() => router.push('/(tabs)/words')}
        activeOpacity={0.85}
      >
        <Text style={styles.battleIcon}>🏯</Text>
        <Text style={styles.dojoBtnText}>Dojo Library</Text>
        <Text style={styles.dojoSub}>Learn new words</Text>
      </TouchableOpacity>

      {/* ── LEARNING PATH ──────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>LEARNING PATH</Text>
        <Text style={styles.pathHint}>
          Tap a node to start that lesson
        </Text>
        <View style={styles.pathRow}>
          {PATH_NODES.map((node, i) => (
            <PathNode
              key={node.id}
              node={node}
              isLast={i === PATH_NODES.length - 1}
              onPress={handleNodePress}
            />
          ))}
        </View>
      </View>

      {/* ── QUICK STATS ────────────────────────── */}
      <TouchableOpacity
        style={styles.statsCard}
        onPress={() => router.push('/(tabs)/progress')}
        activeOpacity={0.8}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{words}</Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
        </View>
        <Text style={styles.statsLink}>View full progress →</Text>
      </TouchableOpacity>

      {/* ── LOGOUT ─────────────────────────────── */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut
          ? <ActivityIndicator color={MUTED} />
          : <Text style={styles.logoutText}>Logout</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE },
  content:   { paddingBottom: 32 },

  // Header
  header: {
    backgroundColor: NAVY,
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 3,
    flex: 1,
    justifyContent: 'center',
  },
  pillIcon: { fontSize: 13 },
  pillText: { fontSize: 11, fontWeight: '700' },

  // Card
  card: {
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },

  // Sensei
  senseiWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  senseiCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: PALE_BLUE,
    borderWidth: 3,
    borderColor: TEAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  senseiEmoji: { fontSize: 44 },
  levelBadge: {
    marginTop: -14,
    backgroundColor: BLUE,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  levelBadgeText: { color: WHITE, fontSize: 11, fontWeight: '700' },

  // Bubble
  bubble: {
    backgroundColor: PALE_BLUE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    position: 'relative',
  },
  bubbleTip: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: PALE_BLUE,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '600',
    color: NAVY,
    textAlign: 'center',
  },

  // User info
  username: {
    fontSize: 20,
    fontWeight: '800',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  categoryBadge: {
    backgroundColor: PALE_BLUE,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: BORDER,
  },
  categoryText: { fontSize: 11, fontWeight: '700', color: BLUE },
  levelLabel:   { fontSize: 12, color: MUTED, fontWeight: '600' },

  // XP
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 0.8,
  },
  xpValue: { fontSize: 11, fontWeight: '700', color: TEAL },
  xpTrack: {
    backgroundColor: PALE_BLUE,
    borderRadius: 999,
    overflow: 'hidden',
    width: '100%',
  },
  xpFill: { borderRadius: 999 },

  // Chip
  chip: {
    alignSelf: 'center',
    backgroundColor: PALE_BLUE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 10,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: TEAL },

  // Quest
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rewardBadge: {
    backgroundColor: PEACH,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  rewardText: { fontSize: 12, fontWeight: '700', color: ORANGE },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  questIcon:  { fontSize: 18 },
  questText:  { fontSize: 13, fontWeight: '700', color: NAVY, flex: 1 },
  questArrow: { fontSize: 18, color: MUTED },
  questCount: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    textAlign: 'right',
    marginTop: 6,
  },

  // Battle button
  battleBtn: {
    backgroundColor: TEAL,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  battleIcon: { fontSize: 20 },
  battleText: { color: WHITE, fontSize: 16, fontWeight: '800' },

  // Dojo Library button
  dojoBtn: {
    backgroundColor: NAVY,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: TEAL,
  },
  dojoBtnText: { color: WHITE, fontSize: 16, fontWeight: '800' },
  dojoSub:     { color: TEAL_LIGHT, fontSize: 12, fontWeight: '600' },

  // Path
  pathHint: {
    fontSize: 11,
    color: MUTED,
    marginBottom: 12,
    fontWeight: '500',
  },
  pathRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  nodeWrap:      { alignItems: 'center', flex: 1 },
  nodeRow:       { flexDirection: 'row', alignItems: 'center', width: '100%' },
  nodeConnector: { flex: 1, height: 2 },
  nodeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeIcon:      { fontSize: 16, color: WHITE },
  nodeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: NAVY,
    marginTop: 6,
    textAlign: 'center',
  },
  nodeSublabel: {
    fontSize: 9,
    color: MUTED,
    marginTop: 2,
    textAlign: 'center',
  },

  // Quick stats card
  statsCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  statItem:    { alignItems: 'center', gap: 3 },
  statNum:     { fontSize: 24, fontWeight: '900', color: NAVY },
  statLabel:   { fontSize: 10, color: MUTED, fontWeight: '600' },
  statDivider: { width: 1, height: 36, backgroundColor: BORDER },
  statsLink: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: TEAL,
  },
  // Logout
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  logoutText: { fontSize: 13, fontWeight: '600', color: MUTED },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9,16,87,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle:   { fontSize: 18, fontWeight: '800', color: NAVY, textAlign: 'center' },
  modalContent: { fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 20 },
  modalBtn: {
    backgroundColor: TEAL,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginTop: 4,
  },
  modalBtnText: { color: WHITE, fontWeight: '700', fontSize: 14 },
});