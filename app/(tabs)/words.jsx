import { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
  Modal, Pressable, Animated, Dimensions,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { fetchWordDefinition } from '../../src/services/dictionaryService';

const { width, height } = Dimensions.get('window');

const NAVY       = '#091057';
const TEAL       = '#2D9596';
const BLUE       = '#1053A9';
const PALE_BLUE  = '#CDEDFF';
const ICE        = '#ECF6FF';
const ORANGE     = '#EC8305';
const PEACH      = '#FFE2AD';
const WHITE      = '#FFFFFF';
const MUTED      = '#5B7A9D';
const BORDER     = '#CDEDFF';
const GOLD       = '#F59E0B';
const PARCHMENT  = '#FEF3C7';
const DARK_WOOD  = '#1A0A00';
const WOOD       = '#3D1F00';
const LIGHT_WOOD = '#7C4A1E';

// ── Part of speech badge ──────────────────────────────────
function POSBadge({ pos }) {
  const colors = {
    noun:        { bg: '#E0F0FF', text: '#1053A9' },
    verb:        { bg: '#E0F8F7', text: '#2D9596' },
    adjective:   { bg: '#FFF3E0', text: '#EC8305' },
    adverb:      { bg: '#F3E8FF', text: '#7C3AED' },
    preposition: { bg: '#FEF3C7', text: '#92400E' },
  };
  const c = colors[pos] || { bg: PALE_BLUE, text: BLUE };
  return (
    <View style={[styles.posBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.posText, { color: c.text }]}>{pos}</Text>
    </View>
  );
}

// ── Word Definition Modal (scroll-themed) ─────────────────
function WordModal({ word, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data,    setData]    = useState(null);
  const [error,   setError]   = useState('');
  const unrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!word) return;
    setData(null);
    setError('');
    loadDefinition();
    Animated.spring(unrollAnim, {
      toValue: 1, friction: 6, tension: 40, useNativeDriver: true,
    }).start();
  }, [word]);

  async function loadDefinition() {
    setLoading(true);
    const result = await fetchWordDefinition(word);
    if (result.success) setData(result);
    else setError('Definition not found for this word.');
    setLoading(false);
  }

  const scaleY = unrollAnim.interpolate({
    inputRange: [0, 1], outputRange: [0.3, 1],
  });

  return (
    <Modal visible={!!word} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Animated.View style={[styles.modalCard, { transform: [{ scaleY }] }]}>

          {/* Scroll top roll */}
          <View style={styles.modalRollTop}>
            <Text style={styles.modalRollText}>📜 Ancient Scroll</Text>
          </View>

          {loading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={GOLD} />
              <Text style={styles.modalLoadingText}>Unrolling the scroll...</Text>
            </View>
          ) : error ? (
            <View style={styles.modalError}>
              <Text style={styles.errorEmoji}>📖</Text>
              <Text style={styles.errorTitle}>Not Found</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Close Scroll</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

              {/* Word header */}
              <View style={styles.wordHeader}>
                <Text style={styles.modalScrollEmoji}>✨</Text>
                <View style={styles.wordHeaderText}>
                  <Text style={styles.wordTitle}>{data.word.toUpperCase()}</Text>
                  {data.phonetic ? (
                    <Text style={styles.phonetic}>{data.phonetic}</Text>
                  ) : null}
                </View>
                <View style={styles.wordBadge}>
                  <Text style={styles.wordBadgeText}>⚔️ Mastered</Text>
                </View>
              </View>

              {/* Definitions */}
              {data.definitions.map((def, i) => (
                <View key={i} style={styles.defCard}>
                  <POSBadge pos={def.partOfSpeech} />
                  <Text style={styles.defText}>{def.definition}</Text>
                  {def.example ? (
                    <View style={styles.exampleWrap}>
                      <Text style={styles.exampleLabel}>⚔️ IN BATTLE</Text>
                      <Text style={styles.exampleText}>"{def.example}"</Text>
                    </View>
                  ) : null}
                  {def.synonyms.length > 0 ? (
                    <View style={styles.synonymsWrap}>
                      <Text style={styles.synonymsLabel}>🗡️ ALLIED WORDS</Text>
                      <View style={styles.synonymsList}>
                        {def.synonyms.map((syn, j) => (
                          <View key={j} style={styles.synChip}>
                            <Text style={styles.synText}>{syn}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ) : null}
                </View>
              ))}

              {data.origin ? (
                <View style={styles.originCard}>
                  <Text style={styles.originLabel}>🏯 ANCIENT ORIGIN</Text>
                  <Text style={styles.originText}>{data.origin}</Text>
                </View>
              ) : null}

              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>📜 Roll up the Scroll</Text>
              </TouchableOpacity>
              <View style={{ height: 20 }} />
            </ScrollView>
          )}

          {/* Scroll bottom roll */}
          <View style={styles.modalRollBottom} />
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// ── Word Scroll Card ──────────────────────────────────────
function WordScrollCard({ word, index, onPress }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1, duration: 350, delay: index * 50, useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1, friction: 5, tension: 40, delay: index * 50, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Give each word a consistent "rank" based on index
  const ranks = ['⚔️', '🗡️', '🏹', '🛡️', '✨', '📜', '🔮', '⚡'];
  const rank   = ranks[index % ranks.length];

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={styles.wordScrollCard}
        onPress={() => onPress(word)}
        activeOpacity={0.75}
      >
        {/* Roll top */}
        <View style={styles.cardRoll} />

        <View style={styles.cardBody}>
          <Text style={styles.cardRank}>{rank}</Text>
          <View style={styles.cardTextWrap}>
            <Text style={styles.cardWord}>{word}</Text>
            <View style={styles.masteredPill}>
              <Text style={styles.masteredText}>Mastered</Text>
            </View>
          </View>
          <View style={styles.cardXP}>
            <Text style={styles.cardXPText}>+20</Text>
            <Text style={styles.cardXPLabel}>XP</Text>
          </View>
        </View>

        {/* Roll bottom */}
        <View style={styles.cardRoll} />
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────
export default function WordsScreen() {
  const { userData }   = useAuth();
  const [search,       setSearch]       = useState('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [filter,       setFilter]       = useState('all');

  const wordsLearned = userData?.wordsLearned || [];

  const filtered = wordsLearned.filter(w =>
    w && w.trim() !== '' &&
    w.toLowerCase().includes(search.toLowerCase())
  );

  const totalXP    = wordsLearned.length * 20;
  const rank       = wordsLearned.length >= 50 ? 'Grand Master'
                   : wordsLearned.length >= 20 ? 'Scholar'
                   : wordsLearned.length >= 10 ? 'Apprentice'
                   : wordsLearned.length >= 5  ? 'Initiate'
                   : 'Novice';

  const rankEmoji  = wordsLearned.length >= 50 ? '👑'
                   : wordsLearned.length >= 20 ? '🏆'
                   : wordsLearned.length >= 10 ? '⚔️'
                   : wordsLearned.length >= 5  ? '📜'
                   : '🌱';

  return (
    <View style={styles.container}>

      {/* ── HEADER ─────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>🏯 Scroll Archive</Text>
            <Text style={styles.headerSub}>
              {wordsLearned.length} scrolls mastered
            </Text>
          </View>
          <View style={styles.rankBadge}>
            <Text style={styles.rankEmoji}>{rankEmoji}</Text>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={styles.stripStat}>
            <Text style={styles.stripNum}>{wordsLearned.length}</Text>
            <Text style={styles.stripLabel}>Scrolls</Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.stripStat}>
            <Text style={[styles.stripNum, { color: GOLD }]}>{totalXP}</Text>
            <Text style={styles.stripLabel}>XP Earned</Text>
          </View>
          <View style={styles.stripDivider} />
          <View style={styles.stripStat}>
            <Text style={[styles.stripNum, { color: '#C4902A' }]}>{filtered.length}</Text>
            <Text style={styles.stripLabel}>Showing</Text>
          </View>
        </View>
      </View>

      {/* ── SEARCH ─────────────────────────── */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search the archive..."
          placeholderTextColor={LIGHT_WOOD}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── CONTENT ────────────────────────── */}
      {wordsLearned.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🏯</Text>
          <Text style={styles.emptyTitle}>The Archive Awaits</Text>
          <Text style={styles.emptyText}>
            Win battles to add scrolls to your archive.{'\n'}
            Each word you master becomes part of your legend.
          </Text>
          <View style={styles.emptyHint}>
            <Text style={styles.emptyHintText}>⚔️ Start a battle to begin</Text>
          </View>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Instruction banner */}
          <View style={styles.bannerCard}>
            <Text style={styles.bannerEmoji}>📜</Text>
            <View>
              <Text style={styles.bannerTitle}>Your Mastered Scrolls</Text>
              <Text style={styles.bannerSub}>Tap any scroll to reveal its ancient knowledge</Text>
            </View>
          </View>

          {/* Words list */}
          <View style={styles.wordsGrid}>
            {filtered.length === 0 ? (
              <View style={styles.noResultsWrap}>
                <Text style={styles.noResultsEmoji}>🔍</Text>
                <Text style={styles.noResults}>No scrolls match "{search}"</Text>
              </View>
            ) : (
              filtered.map((word, i) => (
                <WordScrollCard
                  key={i}
                  word={word}
                  index={i}
                  onPress={setSelectedWord}
                />
              ))
            )}
          </View>

          {/* Footer achievement */}
          {wordsLearned.length >= 5 && (
            <View style={styles.achieveCard}>
              <Text style={styles.achieveEmoji}>{rankEmoji}</Text>
              <View>
                <Text style={styles.achieveTitle}>{rank} Rank Achieved</Text>
                <Text style={styles.achieveSub}>
                  {wordsLearned.length >= 50
                    ? 'You have mastered the ultimate vocabulary!'
                    : `${50 - wordsLearned.length} more scrolls to reach Grand Master`}
                </Text>
              </View>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ── WORD MODAL ─────────────────────── */}
      <WordModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5EDD8' },

  // Header
  header: {
    backgroundColor:   DARK_WOOD,
    paddingTop:        52,
    paddingBottom:     16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
    marginBottom:   12,
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: GOLD },
  headerSub:   { fontSize: 12, color: '#C4902A', marginTop: 3 },
  rankBadge: {
    backgroundColor: WOOD,
    borderRadius:    12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     GOLD,
  },
  rankEmoji: { fontSize: 20 },
  rankText:  { fontSize: 10, fontWeight: '800', color: GOLD, marginTop: 2 },

  // Stats strip
  statsStrip: {
    flexDirection:   'row',
    backgroundColor: WOOD,
    borderRadius:    12,
    padding:         12,
    justifyContent:  'space-around',
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     LIGHT_WOOD,
  },
  stripStat:    { alignItems: 'center', gap: 2 },
  stripNum:     { fontSize: 20, fontWeight: '900', color: WHITE },
  stripLabel:   { fontSize: 9,  fontWeight: '600', color: '#C4902A' },
  stripDivider: { width: 1, height: 32, backgroundColor: LIGHT_WOOD },

  // Search
  searchWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: PARCHMENT,
    borderBottomWidth: 2,
    borderBottomColor: '#D4A853',
    paddingHorizontal: 14,
    paddingVertical:   10,
    gap: 8,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: {
    flex:      1,
    fontSize:  14,
    color:     DARK_WOOD,
    fontWeight:'600',
  },
  searchClear: { fontSize: 16, color: LIGHT_WOOD, fontWeight: '700' },

  scroll:        { flex: 1 },
  scrollContent: { padding: 14 },

  // Banner
  bannerCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#FFFDE7',
    borderRadius:    12,
    padding:         14,
    marginBottom:    14,
    borderWidth:     1,
    borderColor:     '#D4A853',
    gap:             12,
  },
  bannerEmoji: { fontSize: 32 },
  bannerTitle: { fontSize: 13, fontWeight: '800', color: DARK_WOOD },
  bannerSub:   { fontSize: 11, color: LIGHT_WOOD, marginTop: 2 },

  // Word scroll card
  wordsGrid: { gap: 10 },
  wordScrollCard: {
    backgroundColor: PARCHMENT,
    borderRadius:    8,
    borderWidth:     1.5,
    borderColor:     '#D4A853',
    overflow:        'hidden',
  },
  cardRoll: {
    height:          10,
    backgroundColor: '#C4902A',
  },
  cardBody: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical:  10,
    paddingHorizontal:12,
    gap:             12,
  },
  cardRank:     { fontSize: 24 },
  cardTextWrap: { flex: 1, gap: 4 },
  cardWord: {
    fontSize:   16,
    fontWeight: '800',
    color:      DARK_WOOD,
  },
  masteredPill: {
    alignSelf:       'flex-start',
    backgroundColor: GOLD,
    borderRadius:    20,
    paddingHorizontal:8,
    paddingVertical:  2,
  },
  masteredText: { fontSize: 9, fontWeight: '700', color: WHITE },
  cardXP: {
    alignItems:      'center',
    backgroundColor: '#FEF9E7',
    borderRadius:    8,
    paddingHorizontal:8,
    paddingVertical:  6,
    borderWidth:     1,
    borderColor:     GOLD,
  },
  cardXPText:  { fontSize: 14, fontWeight: '900', color: ORANGE },
  cardXPLabel: { fontSize: 8,  fontWeight: '700', color: LIGHT_WOOD },

  // Empty state
  empty: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        40,
    gap:            16,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: DARK_WOOD },
  emptyText:  { fontSize: 13, color: LIGHT_WOOD, textAlign: 'center', lineHeight: 22 },
  emptyHint: {
    backgroundColor: PARCHMENT,
    borderRadius:    12,
    paddingHorizontal:16,
    paddingVertical:  10,
    borderWidth:     1,
    borderColor:     '#D4A853',
    marginTop:       8,
  },
  emptyHintText: { fontSize: 13, fontWeight: '700', color: DARK_WOOD },

  // No results
  noResultsWrap: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  noResultsEmoji:{ fontSize: 36 },
  noResults:     { fontSize: 14, color: LIGHT_WOOD, fontWeight: '600' },

  // Achievement card
  achieveCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#FFFDE7',
    borderRadius:    14,
    padding:         16,
    marginTop:       16,
    borderWidth:     2,
    borderColor:     GOLD,
    gap:             14,
  },
  achieveEmoji: { fontSize: 36 },
  achieveTitle: { fontSize: 14, fontWeight: '800', color: DARK_WOOD },
  achieveSub:   { fontSize: 11, color: LIGHT_WOOD, marginTop: 3 },

  // Modal
  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(9,16,87,0.85)',
    justifyContent:  'center',
    alignItems:      'center',
    padding:         20,
  },
  modalCard: {
    backgroundColor: PARCHMENT,
    borderRadius:    12,
    width:           '100%',
    maxHeight:       height * 0.85,
    borderWidth:     2,
    borderColor:     '#C4902A',
    overflow:        'hidden',
  },
  modalRollTop: {
    height:          36,
    backgroundColor: '#C4902A',
    alignItems:      'center',
    justifyContent:  'center',
  },
  modalRollText:   { fontSize: 12, fontWeight: '700', color: PARCHMENT },
  modalRollBottom: { height: 16, backgroundColor: '#C4902A' },
  modalLoading: {
    alignItems:     'center',
    paddingVertical: 48,
    gap:            16,
  },
  modalLoadingText: { fontSize: 14, color: LIGHT_WOOD, fontStyle: 'italic' },
  modalError: {
    alignItems:     'center',
    paddingVertical: 40,
    padding:        20,
    gap:            12,
  },
  errorEmoji: { fontSize: 40 },
  errorTitle: { fontSize: 18, fontWeight: '800', color: DARK_WOOD },
  errorText:  { fontSize: 13, color: LIGHT_WOOD, textAlign: 'center' },

  // Word header in modal
  wordHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            12,
    marginBottom:   16,
  },
  modalScrollEmoji: { fontSize: 40 },
  wordHeaderText:   { flex: 1 },
  wordTitle: {
    fontSize:   22,
    fontWeight: '900',
    color:      DARK_WOOD,
  },
  phonetic: { fontSize: 14, color: LIGHT_WOOD, fontStyle: 'italic', marginTop: 3 },
  wordBadge: {
    backgroundColor: '#E0F8F7',
    borderRadius:    10,
    paddingHorizontal:10,
    paddingVertical:  5,
    borderWidth:     1,
    borderColor:     TEAL,
  },
  wordBadgeText: { fontSize: 11, fontWeight: '700', color: TEAL },

  // Definition card
  defCard: {
    backgroundColor: WHITE,
    borderRadius:    12,
    padding:         14,
    marginBottom:    10,
    borderWidth:     1,
    borderColor:     '#E8D5A3',
    gap:             8,
  },
  posBadge: {
    alignSelf:       'flex-start',
    borderRadius:     8,
    paddingHorizontal:10,
    paddingVertical:   4,
  },
  posText:   { fontSize: 12, fontWeight: '700' },
  defText:   { fontSize: 14, color: NAVY, lineHeight: 22 },

  exampleWrap: {
    backgroundColor: '#FEF9E7',
    borderRadius:    8,
    padding:         10,
    borderLeftWidth:  3,
    borderLeftColor:  GOLD,
  },
  exampleLabel: {
    fontSize:     9,
    fontWeight:   '800',
    color:        GOLD,
    marginBottom:  4,
    letterSpacing: 0.8,
  },
  exampleText: {
    fontSize:  13,
    color:     LIGHT_WOOD,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  synonymsWrap: { gap: 6 },
  synonymsLabel: {
    fontSize:     9,
    fontWeight:   '800',
    color:        MUTED,
    letterSpacing: 0.8,
  },
  synonymsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  synChip: {
    backgroundColor:  PALE_BLUE,
    borderRadius:     20,
    paddingHorizontal: 10,
    paddingVertical:   4,
  },
  synText: { fontSize: 12, fontWeight: '600', color: BLUE },

  // Origin
  originCard: {
    backgroundColor: PEACH,
    borderRadius:    12,
    padding:         14,
    marginBottom:    16,
    gap:             6,
    borderWidth:     1,
    borderColor:     '#D4A853',
  },
  originLabel: {
    fontSize:     9,
    fontWeight:   '800',
    color:        ORANGE,
    letterSpacing: 0.8,
  },
  originText: { fontSize: 13, color: NAVY, lineHeight: 20 },

  // Close
  closeBtn: {
    backgroundColor: DARK_WOOD,
    borderRadius:    14,
    paddingVertical: 14,
    alignItems:      'center',
    marginTop:       8,
    borderWidth:     1,
    borderColor:     GOLD,
  },
  closeBtnText: { color: GOLD, fontSize: 14, fontWeight: '800' },
});