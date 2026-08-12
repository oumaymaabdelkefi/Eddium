import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
  Modal, Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { logoutUser } from '../../src/services/authService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebase';

// ── Exact Eddium Brand Colors from Figma ──────────────────
const NAVY       = '#091057';   // Main dark
const TEAL       = '#2D9596';   // Main teal
const BLUE       = '#1053A9';   // Main blue
const TEAL_LIGHT = '#AAC3E3';   // Secondary teal light
const DANGER     = '#DF4547';   // Secondary red
const ICE        = '#ECF6FF';   // Secondary ice blue (background)
const TEAL_MID   = '#5DD1D1';   // Secondary teal mid
const ROYAL_BLUE = '#B5C5F6';   // Secondary royal blue
const PALE_BLUE  = '#CDEDFF';   // Secondary pale blue
const PEACH      = '#FFE2AD';   // Secondary peach
const ORANGE     = '#EC8305';   // Secondary orange
const WHITE      = '#FFFFFF';
const MUTED      = '#5B7A9D';

function getLevelTitle(level) {
  if (level >= 10) return 'Dojo Master';
  if (level >= 7)  return 'Senior Warrior';
  if (level >= 5)  return 'IELTS Scholar';
  if (level >= 3)  return 'Apprentice';
  if (level >= 2)  return 'Novice';
  return 'Beginner';
}

function XPBar({ value, max }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={styles.xpTrack}>
      <View style={[styles.xpFill, { width: `${pct}%` }]} />
    </View>
  );
}

function InfoRow({ icon, label, value, last = false }) {
  return (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, userData } = useAuth();
  const router = useRouter();

  const [loggingOut,  setLoggingOut]  = useState(false);
  const [editModal,   setEditModal]   = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savingName,  setSavingName]  = useState(false);
  const [nameError,   setNameError]   = useState('');

  const username   = userData?.username              || 'Student';
  const email      = userData?.email                 || user?.email || '';
  const level      = userData?.level                 || 1;
  const xp         = userData?.xp                    || 0;
  const xpNext     = userData?.xpToNextLevel         || 100;
  const words      = userData?.wordsLearned?.length  || 0;
  const role       = userData?.role                  || 'player';
  const levelTitle = getLevelTitle(level);

  async function handleLogout() {
    setLoggingOut(true);
    await logoutUser();
    router.replace('/(auth)/login');
  }

  function openEditModal() {
    setNewUsername(username);
    setNameError('');
    setEditModal(true);
  }

  async function handleSaveUsername() {
    if (!newUsername.trim()) {
      setNameError('Username cannot be empty');
      return;
    }
    if (newUsername.trim().length < 2) {
      setNameError('Must be at least 2 characters');
      return;
    }
    setSavingName(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        username: newUsername.trim(),
      });
      setEditModal(false);
    } catch (e) {
      setNameError('Failed to update. Try again.');
    }
    setSavingName(false);
  }

  const achievements = [
    {
      icon:  '⚔️',
      label: 'First Battle',
      desc:  'Complete your first battle',
      done:  true,
    },
    {
      icon:  '📚',
      label: 'Word Collector',
      desc:  'Learn 10 vocabulary words',
      done:  words >= 10,
    },
    {
      icon:  '⚡',
      label: 'XP Hunter',
      desc:  'Earn 100 XP total',
      done:  xp >= 100,
    },
    {
      icon:  '🏅',
      label: 'Level Up',
      desc:  'Reach Level 2',
      done:  level >= 2,
    },
    {
      icon:  '🔥',
      label: 'Scholar',
      desc:  'Learn 50 vocabulary words',
      done:  words >= 50,
    },
    {
      icon:  '👑',
      label: 'Dojo Master',
      desc:  'Reach Level 10',
      done:  level >= 10,
    },
  ];

  const achieved = achievements.filter(a => a.done).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* ── EDIT USERNAME MODAL ──────────────── */}
      <Modal
        visible={editModal}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModal(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setEditModal(false)}>
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Username</Text>
            <TextInput
              style={[
                styles.modalInput,
                nameError && { borderColor: DANGER }
              ]}
              value={newUsername}
              onChangeText={v => { setNewUsername(v); setNameError(''); }}
              placeholder="Enter new username"
              placeholderTextColor={MUTED}
              autoFocus
              autoCapitalize="none"
            />
            {nameError ? (
              <Text style={styles.nameError}>{nameError}</Text>
            ) : null}
            <TouchableOpacity
              style={[styles.modalSaveBtn, savingName && { opacity: 0.6 }]}
              onPress={handleSaveUsername}
              disabled={savingName}
            >
              {savingName
                ? <ActivityIndicator color={WHITE} />
                : <Text style={styles.modalSaveBtnText}>Save</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setEditModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── HEADER ──────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSub}>Your account details</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>
            {role === 'admin' ? '⚙️ Admin' : '🎓 Student'}
          </Text>
        </View>
      </View>

      {/* ── AVATAR CARD ─────────────────────── */}
      <View style={styles.avatarCard}>

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>🧙</Text>
          </View>
          <View style={styles.levelPill}>
            <Text style={styles.levelPillText}>Lv {level}</Text>
          </View>
        </View>

        <Text style={styles.profileName}>{username}</Text>
        <Text style={styles.profileTitle}>{levelTitle}</Text>

        {/* Category badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: PALE_BLUE }]}>
            <Text style={[styles.badgeText, { color: BLUE }]}>IELTS</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#E0F8F7' }]}>
            <Text style={[styles.badgeText, { color: TEAL }]}>
              {levelTitle}
            </Text>
          </View>
        </View>

        {/* XP section */}
        <View style={styles.xpWrap}>
          <View style={styles.xpLabelRow}>
            <Text style={styles.xpLabel}>EXPERIENCE POINTS</Text>
            <Text style={styles.xpValue}>{xp} / {xpNext} XP</Text>
          </View>
          <XPBar value={xp} max={xpNext} />
          <Text style={styles.xpHint}>
            {xpNext - xp > 0
              ? `${xpNext - xp} XP needed to reach Level ${level + 1}`
              : '🎉 Ready to level up!'
            }
          </Text>
        </View>

        {/* Edit button */}
        <TouchableOpacity style={styles.editBtn} onPress={openEditModal}>
          <Text style={styles.editBtnText}>✏️  Edit Username</Text>
        </TouchableOpacity>
      </View>

      {/* ── STATS CARD ──────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: TEAL }]}>{level}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: ORANGE }]}>{xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: BLUE }]}>{words}</Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: TEAL_MID }]}>{achieved}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
      </View>

      {/* ── ACCOUNT INFO ────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account Information</Text>
        <InfoRow icon="👤" label="Username"  value={username}   />
        <InfoRow icon="📧" label="Email"     value={email}      />
        <InfoRow icon="🎯" label="Category"  value="IELTS"      />
        <InfoRow icon="🏆" label="Rank"      value={levelTitle} />
        <InfoRow
          icon="⚙️"
          label="Role"
          value={role === 'admin' ? 'Administrator' : 'Student'}
          last
        />
      </View>

      {/* ── ACHIEVEMENTS ────────────────────── */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Achievements</Text>
          <View style={styles.achieveCount}>
            <Text style={styles.achieveCountText}>
              {achieved} / {achievements.length}
            </Text>
          </View>
        </View>

        {achievements.map((a, i) => (
          <View
            key={i}
            style={[
              styles.achieveRow,
              !a.done && { opacity: 0.35 },
              i === achievements.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={[
              styles.achieveIconWrap,
              { backgroundColor: a.done ? '#E0F8F7' : PALE_BLUE }
            ]}>
              <Text style={styles.achieveEmoji}>{a.icon}</Text>
            </View>
            <View style={styles.achieveInfo}>
              <Text style={styles.achieveLabel}>{a.label}</Text>
              <Text style={styles.achieveDesc}>{a.desc}</Text>
            </View>
            {a.done && (
              <View style={styles.achieveTick}>
                <Text style={styles.achieveTickText}>✓</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      {/* ── ABOUT ───────────────────────────── */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About Eddium</Text>
        <InfoRow icon="📱" label="Application" value="Eddium"                  />
        <InfoRow icon="🎮" label="Version"     value="1.0.0 MVP"               />
        <InfoRow icon="🌍" label="Platform"    value="IELTS & TOEFL"           />
        <InfoRow
          icon="👩‍💻"
          label="Developer"
          value="Oumayma Abdelkefi"
          last
        />
      </View>

      {/* ── LOGOUT ──────────────────────────── */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        disabled={loggingOut}
        activeOpacity={0.8}
      >
        {loggingOut
          ? <ActivityIndicator color={DANGER} />
          : <>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </>
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
    paddingTop:       52,
    paddingBottom:    20,
    paddingHorizontal:20,
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: WHITE },
  headerSub:   { fontSize: 13, color: TEAL_LIGHT, marginTop: 4 },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius:    12,
    paddingHorizontal:12,
    paddingVertical:  6,
    borderWidth:      1,
    borderColor:     'rgba(255,255,255,0.2)',
  },
  headerBadgeText: { color: WHITE, fontSize: 12, fontWeight: '700' },

  // Avatar card
  avatarCard: {
    backgroundColor: WHITE,
    borderRadius:    20,
    borderWidth:      1,
    borderColor:     PALE_BLUE,
    margin:          16,
    padding:         20,
    alignItems:      'center',
  },
  avatarWrap: { alignItems: 'center', marginBottom: 6 },
  avatarCircle: {
    width:           96,
    height:          96,
    borderRadius:    48,
    backgroundColor: PALE_BLUE,
    borderWidth:      3,
    borderColor:     TEAL,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarEmoji: { fontSize: 48 },
  levelPill: {
    backgroundColor:  BLUE,
    borderRadius:     12,
    paddingHorizontal:12,
    paddingVertical:   3,
    marginTop:        -10,
    marginBottom:      10,
  },
  levelPillText:  { color: WHITE, fontSize: 12, fontWeight: '700' },
  profileName:    { fontSize: 22, fontWeight: '900', color: NAVY, marginBottom: 4 },
  profileTitle:   { fontSize: 13, color: MUTED, fontWeight: '600', marginBottom: 12 },

  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  badge: {
    borderRadius:     8,
    paddingHorizontal:12,
    paddingVertical:   4,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },

  // XP
  xpWrap:     { width: '100%', marginBottom: 14 },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel:    { fontSize: 10, fontWeight: '700', color: MUTED, letterSpacing: 0.8 },
  xpValue:    { fontSize: 11, fontWeight: '700', color: TEAL },
  xpTrack: {
    backgroundColor: PALE_BLUE,
    borderRadius:    999,
    overflow:        'hidden',
    height:          10,
    width:           '100%',
  },
  xpFill: {
    height:          '100%',
    backgroundColor: TEAL,
    borderRadius:    999,
  },
  xpHint: {
    fontSize:   11,
    color:      MUTED,
    marginTop:   4,
    textAlign:  'right',
  },

  // Edit button
  editBtn: {
    borderWidth:      1,
    borderColor:      PALE_BLUE,
    borderRadius:     10,
    paddingHorizontal:20,
    paddingVertical:   8,
    backgroundColor:  ICE,
  },
  editBtnText: { fontSize: 13, fontWeight: '600', color: MUTED },

  // Card
  card: {
    backgroundColor: WHITE,
    borderRadius:    16,
    borderWidth:      1,
    borderColor:     PALE_BLUE,
    marginHorizontal:16,
    marginTop:       12,
    padding:         16,
  },
  cardTitle: {
    fontSize:     15,
    fontWeight:   '800',
    color:        NAVY,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   14,
  },
  achieveCount: {
    backgroundColor:  PALE_BLUE,
    borderRadius:     12,
    paddingHorizontal:10,
    paddingVertical:   3,
  },
  achieveCountText: { fontSize: 12, fontWeight: '800', color: BLUE },

  // Stats
  statsRow: {
    flexDirection:  'row',
    justifyContent: 'space-around',
    alignItems:     'center',
  },
  statItem:  { alignItems: 'center', gap: 4, flex: 1 },
  statNum:   { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 10, color: MUTED, fontWeight: '600' },
  statDiv:   { width: 1, height: 40, backgroundColor: PALE_BLUE },

  // Info rows
  infoRow: {
    flexDirection:   'row',
    alignItems:      'center',
    paddingVertical:  12,
    borderBottomWidth: 0.5,
    borderBottomColor: PALE_BLUE,
    gap:              12,
  },
  infoIcon:    { fontSize: 18, width: 28 },
  infoContent: { flex: 1 },
  infoLabel:   { fontSize: 10, fontWeight: '700', color: MUTED, letterSpacing: 0.5 },
  infoValue:   { fontSize: 14, fontWeight: '600', color: NAVY, marginTop: 2 },

  // Achievements
  achieveRow: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:    12,
    borderBottomWidth:  0.5,
    borderBottomColor:  PALE_BLUE,
    gap:               12,
  },
  achieveIconWrap: {
    width:          42,
    height:         42,
    borderRadius:   21,
    alignItems:     'center',
    justifyContent: 'center',
  },
  achieveEmoji:    { fontSize: 20 },
  achieveInfo:     { flex: 1 },
  achieveLabel:    { fontSize: 13, fontWeight: '700', color: NAVY },
  achieveDesc:     { fontSize: 11, color: MUTED, marginTop: 2 },
  achieveTick: {
    width:           30,
    height:          30,
    borderRadius:    15,
    backgroundColor: '#E0F8F7',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:      1,
    borderColor:     TEAL,
  },
  achieveTickText: { color: TEAL, fontWeight: '900', fontSize: 14 },

  // Logout
  logoutBtn: {
    marginHorizontal: 16,
    marginTop:        20,
    padding:          16,
    borderRadius:     14,
    borderWidth:       1.5,
    borderColor:      DANGER,
    alignItems:       'center',
    flexDirection:    'row',
    justifyContent:   'center',
    gap:               8,
    backgroundColor:  '#FFF0F0',
  },
  logoutIcon: { fontSize: 18 },
  logoutText: { fontSize: 15, fontWeight: '700', color: DANGER },

  // Modal
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(9,16,87,0.55)',
    alignItems:      'center',
    justifyContent:  'center',
    padding:         24,
  },
  modalCard: {
    backgroundColor: WHITE,
    borderRadius:    20,
    padding:         24,
    width:           '100%',
    gap:             12,
  },
  modalTitle:       { fontSize: 18, fontWeight: '800', color: NAVY },
  modalInput: {
    backgroundColor: ICE,
    borderRadius:    12,
    borderWidth:      1,
    borderColor:     PALE_BLUE,
    padding:         14,
    fontSize:        15,
    color:           NAVY,
  },
  nameError:        { fontSize: 12, color: DANGER, fontWeight: '600' },
  modalSaveBtn: {
    backgroundColor: TEAL,
    borderRadius:    12,
    padding:         14,
    alignItems:      'center',
  },
  modalSaveBtnText: { color: WHITE, fontWeight: '800', fontSize: 15 },
  modalCancelBtn:   { padding: 10, alignItems: 'center' },
  modalCancelText:  { color: MUTED, fontWeight: '600', fontSize: 14 },
});