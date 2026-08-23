import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
  Modal, Pressable,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { fetchWordDefinition } from '../../src/services/dictionaryService';

const NAVY      = '#091057';
const TEAL      = '#2D9596';
const BLUE      = '#1053A9';
const PALE_BLUE = '#CDEDFF';
const ICE       = '#ECF6FF';
const ORANGE    = '#EC8305';
const PEACH     = '#FFE2AD';
const WHITE     = '#FFFFFF';
const MUTED     = '#5B7A9D';
const BORDER    = '#CDEDFF';

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

// ── Word Definition Modal ─────────────────────────────────
function WordModal({ word, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data,    setData]    = useState(null);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!word) return;
    loadDefinition();
  }, [word]);

  async function loadDefinition() {
    setLoading(true);
    setError('');
    const result = await fetchWordDefinition(word);
    if (result.success) {
      setData(result);
    } else {
      setError('Definition not found for this word.');
    }
    setLoading(false);
  }

  return (
    <Modal
      visible={!!word}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard}>

          {/* Handle bar */}
          <View style={styles.handleBar} />

          {loading ? (
            <View style={styles.modalLoading}>
              <ActivityIndicator size="large" color={TEAL} />
              <Text style={styles.modalLoadingText}>
                Looking up "{word}"...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.modalError}>
              <Text style={styles.errorEmoji}>📖</Text>
              <Text style={styles.errorTitle}>Not Found</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>

              {/* Word header */}
              <View style={styles.wordHeader}>
                <View style={styles.wordHeaderLeft}>
                  <Text style={styles.wordTitle}>{data.word}</Text>
                  {data.phonetic ? (
                    <Text style={styles.phonetic}>{data.phonetic}</Text>
                  ) : null}
                </View>
                <View style={styles.wordBadge}>
                  <Text style={styles.wordBadgeText}>✓ Learned</Text>
                </View>
              </View>

              {/* Definitions */}
              {data.definitions.map((def, i) => (
                <View key={i} style={styles.defCard}>
                  <POSBadge pos={def.partOfSpeech} />

                  <Text style={styles.defText}>
                    {def.definition}
                  </Text>

                  {def.example ? (
                    <View style={styles.exampleWrap}>
                      <Text style={styles.exampleLabel}>Example</Text>
                      <Text style={styles.exampleText}>
                        "{def.example}"
                      </Text>
                    </View>
                  ) : null}

                  {def.synonyms.length > 0 ? (
                    <View style={styles.synonymsWrap}>
                      <Text style={styles.synonymsLabel}>Synonyms</Text>
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

              {/* Origin */}
              {data.origin ? (
                <View style={styles.originCard}>
                  <Text style={styles.originLabel}>ORIGIN</Text>
                  <Text style={styles.originText}>{data.origin}</Text>
                </View>
              ) : null}

              {/* Close button */}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main Screen ───────────────────────────────────────────
export default function WordsScreen() {
  const { userData }    = useAuth();
  const [search,        setSearch]        = useState('');
  const [selectedWord,  setSelectedWord]  = useState(null);

  const wordsLearned = userData?.wordsLearned || [];

  const filtered = wordsLearned.filter(w =>
    w && w.trim() !== '' &&
    w.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>

      {/* ── HEADER ─────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Word Library</Text>
          <Text style={styles.headerSub}>
            {wordsLearned.length} words mastered
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>📚</Text>
        </View>
      </View>

      {/* ── SEARCH ─────────────────────────── */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your words..."
          placeholderTextColor={MUTED}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* ── WORDS GRID ─────────────────────── */}
      {wordsLearned.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>No words yet</Text>
          <Text style={styles.emptyText}>
            Complete battles to build your word library
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: TEAL }]}>
                {wordsLearned.length}
              </Text>
              <Text style={styles.statLabel}>Total words</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: ORANGE }]}>
                {Math.round(wordsLearned.length * 20)}
              </Text>
              <Text style={styles.statLabel}>XP from words</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: BLUE }]}>
                {filtered.length}
              </Text>
              <Text style={styles.statLabel}>Showing</Text>
            </View>
          </View>

          <Text style={styles.tapHint}>
            Tap any word to see its definition
          </Text>

          {/* Words grid */}
          <View style={styles.wordsGrid}>
            {filtered.length === 0 ? (
              <Text style={styles.noResults}>
                No words match "{search}"
              </Text>
            ) : (
              filtered.map((word, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.wordCard}
                  onPress={() => setSelectedWord(word)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.wordCardNum}>{i + 1}</Text>
                  <Text style={styles.wordCardText}>{word}</Text>
                  <Text style={styles.wordCardArrow}>›</Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* ── WORD DEFINITION MODAL ──────────── */}
      <WordModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ICE },

  // Header
  header: {
    backgroundColor:  NAVY,
    paddingTop:       52,
    paddingBottom:    20,
    paddingHorizontal:20,
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
  },
  headerTitle:     { fontSize: 26, fontWeight: '900', color: WHITE },
  headerSub:       { fontSize: 13, color: '#AAC3E3', marginTop: 4 },
  headerBadge: {
    width:           48,
    height:          48,
    borderRadius:    24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerBadgeText: { fontSize: 24 },

  // Search
  searchWrap: {
    padding:          16,
    paddingBottom:     8,
    backgroundColor:  WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  searchInput: {
    backgroundColor: ICE,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     BORDER,
    padding:         12,
    fontSize:        14,
    color:           NAVY,
  },

  scroll:        { flex: 1 },
  scrollContent: { padding: 16 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap:           8,
    marginBottom:  12,
  },
  statBox: {
    flex:            1,
    backgroundColor: WHITE,
    borderRadius:    12,
    padding:         12,
    alignItems:      'center',
    borderWidth:     1,
    borderColor:     BORDER,
    gap:             3,
  },
  statNum:   { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: MUTED, fontWeight: '600' },

  tapHint: {
    fontSize:     12,
    color:        MUTED,
    textAlign:    'center',
    marginBottom: 12,
    fontWeight:   '500',
  },

  // Words grid
  wordsGrid: { gap: 8 },
  wordCard: {
    backgroundColor: WHITE,
    borderRadius:    12,
    borderWidth:     1,
    borderColor:     BORDER,
    paddingVertical:  12,
    paddingHorizontal:14,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             12,
  },
  wordCardNum: {
    fontSize:        12,
    fontWeight:      '700',
    color:           MUTED,
    width:           24,
    textAlign:       'center',
  },
  wordCardText: {
    flex:       1,
    fontSize:   15,
    fontWeight: '700',
    color:      NAVY,
  },
  wordCardArrow: { fontSize: 20, color: TEAL },

  noResults: {
    textAlign: 'center',
    color:     MUTED,
    fontSize:  14,
    marginTop: 20,
  },

  // Empty
  empty: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            12,
    padding:        40,
  },
  emptyIcon:  { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: NAVY },
  emptyText:  { fontSize: 13, color: MUTED, textAlign: 'center' },

  // Modal
  modalOverlay: {
    flex:            1,
    backgroundColor: 'rgba(9,16,87,0.6)',
    justifyContent:  'flex-end',
  },
  modalCard: {
    backgroundColor: WHITE,
    borderTopLeftRadius:  24,
    borderTopRightRadius: 24,
    padding:         24,
    maxHeight:       '85%',
  },
  handleBar: {
    width:           40,
    height:           4,
    backgroundColor: BORDER,
    borderRadius:    999,
    alignSelf:       'center',
    marginBottom:    20,
  },
  modalLoading: {
    alignItems:     'center',
    paddingVertical: 40,
    gap:            12,
  },
  modalLoadingText: { fontSize: 14, color: MUTED },

  modalError: {
    alignItems:     'center',
    paddingVertical: 40,
    gap:            12,
  },
  errorEmoji: { fontSize: 40 },
  errorTitle: { fontSize: 18, fontWeight: '800', color: NAVY },
  errorText:  { fontSize: 13, color: MUTED, textAlign: 'center' },

  // Word header
  wordHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   20,
  },
  wordHeaderLeft: { flex: 1 },
  wordTitle: {
    fontSize:   28,
    fontWeight: '900',
    color:      NAVY,
    marginBottom: 4,
  },
  phonetic:     { fontSize: 16, color: MUTED, fontStyle: 'italic' },
  wordBadge: {
    backgroundColor: '#E0F8F7',
    borderRadius:    10,
    paddingHorizontal: 10,
    paddingVertical:  5,
    borderWidth:     1,
    borderColor:     TEAL,
  },
  wordBadgeText: { fontSize: 12, fontWeight: '700', color: TEAL },

  // Definition card
  defCard: {
    backgroundColor: ICE,
    borderRadius:    14,
    padding:         14,
    marginBottom:    10,
    borderWidth:     1,
    borderColor:     BORDER,
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
    backgroundColor: WHITE,
    borderRadius:    10,
    padding:         10,
    borderLeftWidth:  3,
    borderLeftColor:  TEAL,
  },
  exampleLabel: {
    fontSize:     10,
    fontWeight:   '700',
    color:        TEAL,
    marginBottom:  4,
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize:  13,
    color:     MUTED,
    fontStyle: 'italic',
    lineHeight: 20,
  },

  synonymsWrap: { gap: 6 },
  synonymsLabel: {
    fontSize:     10,
    fontWeight:   '700',
    color:        MUTED,
    letterSpacing: 0.5,
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
  },
  originLabel: {
    fontSize:     10,
    fontWeight:   '800',
    color:        ORANGE,
    letterSpacing: 0.8,
  },
  originText: { fontSize: 13, color: NAVY, lineHeight: 20 },

  // Close button
  closeBtn: {
    backgroundColor: TEAL,
    borderRadius:    14,
    paddingVertical: 14,
    alignItems:      'center',
    marginTop:        8,
  },
  closeBtnText: { color: WHITE, fontSize: 15, fontWeight: '800' },
});