import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { fetchBattleHistory } from '../../src/services/authService';

const { width } = Dimensions.get('window');

const NAVY       = '#091057';
const TEAL       = '#2D9596';
const BLUE       = '#1053A9';
const TEAL_LIGHT = '#AAC3E3';
const ICE        = '#ECF6FF';
const PALE_BLUE  = '#CDEDFF';
const ORANGE     = '#EC8305';
const PEACH      = '#FFE2AD';
const DANGER     = '#DF4547';
const WHITE      = '#FFFFFF';
const MUTED      = '#5B7A9D';
const BORDER     = '#CDEDFF';

function getLevelTitle(level) {
  if (level >= 10) return 'Dojo Master';
  if (level >= 7)  return 'Senior Warrior';
  if (level >= 5)  return 'IELTS Scholar';
  if (level >= 3)  return 'Apprentice';
  if (level >= 2)  return 'Novice';
  return 'Beginner';
}

function XPBar({ value, max, color = TEAL, height = 10 }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <View style={[styles.xpTrack, { height }]}>
      <View style={[styles.xpFill, { width: `${pct}%`, backgroundColor: color, height }]} />
    </View>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function WordChip({ word }) {
  return (
    <View style={styles.wordChip}>
      <Text style={styles.wordText}>{word}</Text>
    </View>
  );
}

function BattleRow({ battle, index }) {
  const total  = battle.total || 5;
  const thresh = Math.ceil(total / 2);
  const isWin  = (battle.score || 0) >= thresh;
  const dateStr = battle.date?.seconds
    ? new Date(battle.date.seconds * 1000).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      })
    : 'Recent';

  return (
    <View style={[
      styles.battleRow,
      { backgroundColor: index % 2 === 0 ? WHITE : ICE }
    ]}>
      <View style={[
        styles.resultBadge,
        { backgroundColor: isWin ? TEAL : DANGER }
      ]}>
        <Text style={styles.resultText}>{isWin ? 'WIN' : 'LOSS'}</Text>
      </View>
      <View style={styles.battleMid}>
        <Text style={styles.battleScore}>
          {battle.score || 0} / {battle.total || 5} correct
        </Text>
        <Text style={styles.battleDate}>{dateStr}</Text>
        {battle.wordsLearned?.length > 0 && (
          <Text style={styles.battleWords}>
            +{battle.wordsLearned.length} words learned
          </Text>
        )}
      </View>
      <View style={styles.battleRight}>
        <Text style={styles.battleXP}>+{battle.xpEarned || 0}</Text>
        <Text style={styles.battleXPLabel}>XP</Text>
      </View>
    </View>
  );
}

const MILESTONES = [
  { level: 1,  label: 'Beginner',       xpRequired: 0   },
  { level: 2,  label: 'Novice',         xpRequired: 100 },
  { level: 3,  label: 'Apprentice',     xpRequired: 200 },
  { level: 5,  label: 'IELTS Scholar',  xpRequired: 400 },
  { level: 7,  label: 'Senior Warrior', xpRequired: 700 },
  { level: 10, label: 'Dojo Master',    xpRequired: 900 },
];

export default function ProgressScreen() {
  const { user, userData } = useAuth();
  const [battles,         setBattles]         = useState([]);
  const [loadingBattles,  setLoadingBattles]  = useState(true);

  // Fetch battle history from subcollection
  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoadingBattles(true);
      const data = await fetchBattleHistory(user.uid);
      setBattles(data);
      setLoadingBattles(false);
    }
    load();
  }, [user]);

  if (!userData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={TEAL} />
        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    );
  }

  const username     = userData.username      || 'Student';
  const level        = userData.level         || 1;
  const xp           = userData.xp            || 0;
  const xpNext       = userData.xpToNextLevel || 100;
  const wordsLearned = userData.wordsLearned  || [];
  const xpToNext     = xpNext - xp;
  const levelTitle   = getLevelTitle(level);

  const totalBattles = battles.length;
  const wonBattles = battles.filter(b => {
  const total  = b.total || 5;
  const thresh = Math.ceil(total / 2);
  return (b.score || 0) >= thresh;
}).length;
  const winRate      = totalBattles > 0
    ? Math.round((wonBattles / totalBattles) * 100)
    : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ─────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>My Progress</Text>
          <Text style={styles.headerName}>{username}</Text>
        </View>
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarEmoji}>🧙</Text>
        </View>
      </View>

      {/* ── LEVEL HERO ─────────────────────── */}
      <View style={styles.levelHero}>
        <View style={styles.levelCircleWrap}>
          <View style={styles.levelCircleOuter}>
            <View style={styles.levelCircleInner}>
              <Text style={styles.levelNum}>{level}</Text>
              <Text style={styles.levelNumLabel}>LEVEL</Text>
            </View>
          </View>
          <Text style={styles.levelTitle}>{levelTitle}</Text>
        </View>
        <View style={styles.levelRight}>
          <Text style={styles.xpDisplay}>{xp.toLocaleString()} XP</Text>
          <Text style={styles.xpNextLabel}>
            {xpToNext > 0
              ? `${xpToNext} XP to Level ${level + 1}`
              : 'Ready to level up!'}
          </Text>
          <View style={{ marginTop: 10 }}>
            <XPBar
              value={xp % 100}
              max={100}
              color={ORANGE}
              height={10}
            />
          </View>
          <View style={styles.xpMinMax}>
            <Text style={styles.xpMin}>Level {level}</Text>
            <Text style={styles.xpMax}>Level {level + 1}</Text>
          </View>
        </View>
      </View>

      {/* ── STATS ──────────────────────────── */}
      <View style={styles.statsRow}>
        <StatCard icon="📚" value={wordsLearned.length} label="Words"    color={TEAL}   />
        <StatCard icon="⚔️" value={totalBattles}        label="Battles"  color={BLUE}   />
        <StatCard icon="🏆" value={`${winRate}%`}       label="Win Rate" color={ORANGE} />
      </View>

      {/* ── WORDS LEARNED ──────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Words Learned</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{wordsLearned.length}</Text>
          </View>
        </View>
        {wordsLearned.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📖</Text>
            <Text style={styles.emptyTitle}>No words yet</Text>
            <Text style={styles.emptyText}>
              Complete a battle to start learning vocabulary
            </Text>
          </View>
        ) : (
          <View style={styles.wordsGrid}>
            {wordsLearned.map((word, i) => (
              <WordChip key={i} word={word} />
            ))}
          </View>
        )}
      </View>

      {/* ── BATTLE HISTORY ─────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Battle History</Text>
          <View style={[styles.countPill, { backgroundColor: PALE_BLUE }]}>
            <Text style={[styles.countPillText, { color: BLUE }]}>
              {totalBattles}
            </Text>
          </View>
        </View>

        {totalBattles > 0 && (
          <View style={styles.summaryBar}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: TEAL }]}>{wonBattles}</Text>
              <Text style={styles.summaryLabel}>Wins</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: DANGER }]}>
                {totalBattles - wonBattles}
              </Text>
              <Text style={styles.summaryLabel}>Losses</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNum, { color: ORANGE }]}>{winRate}%</Text>
              <Text style={styles.summaryLabel}>Win Rate</Text>
            </View>
          </View>
        )}

        {loadingBattles ? (
          <View style={styles.emptyBox}>
            <ActivityIndicator color={TEAL} />
            <Text style={styles.emptyText}>Loading battles...</Text>
          </View>
        ) : battles.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>⚔️</Text>
            <Text style={styles.emptyTitle}>No battles yet</Text>
            <Text style={styles.emptyText}>
              Go fight the Vocab Goblin on the Battle tab!
            </Text>
          </View>
        ) : (
          battles.slice(0, 5).map((battle, i) => (
  <BattleRow key={battle.id || i} battle={battle} index={i} />
))
        )}
      </View>

      {/* ── MILESTONES ─────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Level Milestones</Text>
        </View>
        {MILESTONES.map((m, i) => {
          const achieved = level >= m.level;
          const current  = level === m.level;
          return (
            <View key={i} style={styles.milestoneRow}>
              <View style={[
                styles.milestoneDot,
                achieved
                  ? { backgroundColor: TEAL }
                  : { backgroundColor: PALE_BLUE, borderWidth: 1, borderColor: BORDER }
              ]}>
                {achieved
                  ? <Text style={styles.milestoneTick}>✓</Text>
                  : <Text style={styles.milestoneLock}>🔒</Text>
                }
              </View>
              <View style={styles.milestoneInfo}>
                <Text style={[
                  styles.milestoneLabel,
                  !achieved && { color: MUTED }
                ]}>
                  Level {m.level} — {m.label}
                </Text>
                <Text style={styles.milestoneXP}>
                  {m.xpRequired} XP required
                </Text>
              </View>
              {achieved && (
                <View style={[
                  styles.achievedBadge,
                  current && { backgroundColor: TEAL }
                ]}>
                  <Text style={[
                    styles.achievedText,
                    current && { color: WHITE }
                  ]}>
                    {current ? 'Current' : 'Done'}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE },
  content:   { paddingBottom: 32 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: ICE, gap: 12 },
  loadingText: { fontSize: 13, color: MUTED, fontWeight: '600' },

  header: {
    backgroundColor: NAVY,
    paddingTop: 52,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting:    { fontSize: 13, color: TEAL_LIGHT, fontWeight: '600', marginBottom: 4 },
  headerName:        { fontSize: 26, fontWeight: '900', color: WHITE },
  headerAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: TEAL,
  },
  headerAvatarEmoji: { fontSize: 28 },

  levelHero: {
    backgroundColor: NAVY,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 20,
    borderWidth: 1, borderColor: 'rgba(45,149,150,0.3)',
  },
  levelCircleWrap:  { alignItems: 'center', gap: 8 },
  levelCircleOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(45,149,150,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: TEAL,
  },
  levelCircleInner: { alignItems: 'center' },
  levelNum:         { fontSize: 32, fontWeight: '900', color: WHITE },
  levelNumLabel:    { fontSize: 9, fontWeight: '700', color: TEAL_LIGHT, letterSpacing: 1 },
  levelTitle:       { fontSize: 12, fontWeight: '700', color: TEAL, textAlign: 'center' },
  levelRight:       { flex: 1 },
  xpDisplay:        { fontSize: 22, fontWeight: '900', color: WHITE, marginBottom: 4 },
  xpNextLabel:      { fontSize: 12, color: TEAL_LIGHT, marginBottom: 8 },
  xpTrack: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999, overflow: 'hidden', width: '100%',
  },
  xpFill:   { borderRadius: 999 },
  xpMinMax: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  xpMin:    { fontSize: 10, color: TEAL_LIGHT },
  xpMax:    { fontSize: 10, color: TEAL_LIGHT },

  statsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 12, gap: 8,
  },
  statCard: {
    flex: 1, backgroundColor: WHITE, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
    padding: 14, alignItems: 'center', gap: 4,
  },
  statIcon:  { fontSize: 22 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 9, color: MUTED, fontWeight: '600', textAlign: 'center' },

  card: {
    backgroundColor: WHITE, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    marginHorizontal: 16, marginTop: 12, overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  cardTitle:    { fontSize: 15, fontWeight: '800', color: NAVY },
  countPill: {
    backgroundColor: TEAL, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 3,
    minWidth: 28, alignItems: 'center',
  },
  countPillText: { fontSize: 12, fontWeight: '800', color: WHITE },

  wordsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16 },
  wordChip: {
    backgroundColor: PALE_BLUE, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: BORDER,
  },
  wordText: { fontSize: 13, fontWeight: '700', color: TEAL },

  emptyBox: {
    alignItems: 'center', paddingVertical: 32,
    paddingHorizontal: 24, gap: 8,
  },
  emptyIcon:  { fontSize: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: NAVY },
  emptyText:  { fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 20 },

  summaryBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 14, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: BORDER,
    backgroundColor: ICE,
  },
  summaryItem:    { alignItems: 'center', gap: 3 },
  summaryNum:     { fontSize: 22, fontWeight: '900' },
  summaryLabel:   { fontSize: 10, color: MUTED, fontWeight: '600' },
  summaryDivider: { width: 1, backgroundColor: BORDER },

  battleRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 0.5,
    borderBottomColor: BORDER, gap: 12,
  },
  resultBadge: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    minWidth: 52, alignItems: 'center',
  },
  resultText:    { color: WHITE, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  battleMid:     { flex: 1, gap: 2 },
  battleScore:   { fontSize: 13, fontWeight: '700', color: NAVY },
  battleDate:    { fontSize: 11, color: MUTED },
  battleWords:   { fontSize: 11, color: TEAL, fontWeight: '600', marginTop: 2 },
  battleRight:   { alignItems: 'center' },
  battleXP:      { fontSize: 15, fontWeight: '900', color: ORANGE },
  battleXPLabel: { fontSize: 9, color: MUTED, fontWeight: '600' },

  milestoneRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, borderBottomWidth: 0.5,
    borderBottomColor: BORDER, gap: 12,
  },
  milestoneDot: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  milestoneTick:  { color: WHITE, fontSize: 16, fontWeight: '700' },
  milestoneLock:  { fontSize: 14 },
  milestoneInfo:  { flex: 1, gap: 2 },
  milestoneLabel: { fontSize: 13, fontWeight: '700', color: NAVY },
  milestoneXP:    { fontSize: 11, color: MUTED },
  achievedBadge: {
    backgroundColor: PALE_BLUE, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: BORDER,
  },
  achievedText: { fontSize: 11, fontWeight: '700', color: TEAL },
});