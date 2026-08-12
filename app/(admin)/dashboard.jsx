import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, ActivityIndicator,
} from 'react-native';
import {
  collection, addDoc, getDocs,
  deleteDoc, doc, updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../src/config/firebase';
import { useAuth } from '../../src/context/AuthContext';
import { logoutUser } from '../../src/services/authService';
import { useRouter } from 'expo-router';

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
const PEACH     = '#FFE2AD';

const EMPTY_FORM = {
  word:         '',
  question:     '',
  option0:      '',
  option1:      '',
  option2:      '',
  option3:      '',
  correctIndex: '0',
  difficulty:   'intermediate',
  category:     'IELTS',
  level:        '1',
  xpReward:     '20',
};

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const CATEGORIES   = ['IELTS', 'TOEFL', 'both'];
const LEVELS       = ['1', '2', '3', '4', '5'];
const XP_OPTIONS   = ['10', '15', '20', '25', '30'];

function SelectBtn({ options, value, onChange }) {
  return (
    <View style={styles.selectRow}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[styles.selectOpt, value === opt && styles.selectOptActive]}
          onPress={() => onChange(opt)}
        >
          <Text style={[
            styles.selectOptText,
            value === opt && styles.selectOptTextActive
          ]}>
            {opt}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function QuestionCard({ q, onEdit, onDelete }) {
  return (
    <View style={styles.qCard}>
      <View style={styles.qCardTop}>
        <View style={styles.qBadges}>
          <View style={[styles.badge, { backgroundColor: PALE_BLUE }]}>
            <Text style={[styles.badgeText, { color: BLUE }]}>{q.category}</Text>
          </View>
          <View style={[styles.badge, {
            backgroundColor:
              q.difficulty === 'beginner'     ? '#D1FAE5' :
              q.difficulty === 'intermediate' ? '#FEF3C7' : '#FEE2E2'
          }]}>
            <Text style={[styles.badgeText, { color:
              q.difficulty === 'beginner'     ? '#065F46' :
              q.difficulty === 'intermediate' ? '#92400E' : '#991B1B'
            }]}>
              {q.difficulty}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#E0F5F3' }]}>
            <Text style={[styles.badgeText, { color: TEAL }]}>Lv {q.level}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: PEACH }]}>
            <Text style={[styles.badgeText, { color: ORANGE }]}>+{q.xpReward} XP</Text>
          </View>
        </View>
        <View style={styles.qActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: PALE_BLUE }]}
            onPress={() => onEdit(q)}
          >
            <Text style={[styles.actionBtnText, { color: BLUE }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
            onPress={() => onDelete(q)}
          >
            <Text style={[styles.actionBtnText, { color: DANGER }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.qWord}>{q.word}</Text>
      <Text style={styles.qQuestion}>{q.question}</Text>
      <View style={styles.qOptions}>
        {q.options?.map((opt, i) => (
          <View key={i} style={[
            styles.qOption,
            i === q.correctIndex && styles.qOptionCorrect,
          ]}>
            <Text style={[
              styles.qOptionLetter,
              i === q.correctIndex && { backgroundColor: TEAL, color: WHITE }
            ]}>
              {['A','B','C','D'][i]}
            </Text>
            <Text style={[
              styles.qOptionText,
              i === q.correctIndex && { color: TEAL, fontWeight: '700' }
            ]}>
              {opt}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AdminDashboard() {
  const { userData } = useAuth();
  const router       = useRouter();

  const [questions,   setQuestions]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [activeTab,   setActiveTab]   = useState('list');
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [editingId,   setEditingId]   = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadQuestions(); }, []);

  async function loadQuestions() {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'questions'));
      const qs = [];
      snapshot.forEach(d => qs.push({ id: d.id, ...d.data() }));
      setQuestions(qs);
    } catch (e) {
      console.log('Load error:', e.message);
    }
    setLoading(false);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function handleEdit(q) {
    setForm({
      word:         q.word         || '',
      question:     q.question     || '',
      option0:      q.options?.[0] || '',
      option1:      q.options?.[1] || '',
      option2:      q.options?.[2] || '',
      option3:      q.options?.[3] || '',
      correctIndex: String(q.correctIndex ?? '0'),
      difficulty:   q.difficulty   || 'intermediate',
      category:     q.category     || 'IELTS',
      level:        String(q.level ?? '1'),
      xpReward:     String(q.xpReward ?? '20'),
    });
    setEditingId(q.id);
    setActiveTab('add');
  }

  async function handleDelete(q) {
    const ok = window.confirm(`Delete "${q.word}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await deleteDoc(doc(db, 'questions', q.id));
      setQuestions(prev => prev.filter(item => item.id !== q.id));
    } catch (e) {
      alert('Failed to delete.');
    }
  }

  function validate() {
    if (!form.word.trim())     return 'Word is required';
    if (!form.question.trim()) return 'Question is required';
    if (!form.option0.trim())  return 'Option A is required';
    if (!form.option1.trim())  return 'Option B is required';
    if (!form.option2.trim())  return 'Option C is required';
    if (!form.option3.trim())  return 'Option D is required';
    return null;
  }

  async function handleSave() {
    const err = validate();
    if (err) { alert(err); return; }
    setSaving(true);

    const data = {
      word:         form.word.trim().toLowerCase(),
      question:     form.question.trim(),
      options:      [form.option0.trim(), form.option1.trim(), form.option2.trim(), form.option3.trim()],
      correctIndex: parseInt(form.correctIndex),
      difficulty:   form.difficulty,
      category:     form.category,
      level:        parseInt(form.level),
      xpReward:     parseInt(form.xpReward),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'questions', editingId), data);
        setQuestions(prev => prev.map(q => q.id === editingId ? { ...q, ...data } : q));
      } else {
        data.createdAt = serverTimestamp();
        const ref = await addDoc(collection(db, 'questions'), data);
        setQuestions(prev => [...prev, { id: ref.id, ...data }]);
      }
      resetForm();
      setActiveTab('list');
    } catch (e) {
      alert('Failed to save question.');
    }
    setSaving(false);
  }

  async function handleLogout() {
    await logoutUser();
    router.replace('/(auth)/login');
  }

  const filtered = questions.filter(q =>
    q.word?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.question?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>

      {/* ── HEADER ─────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>⚙️ Admin Dashboard</Text>
          <Text style={styles.headerSub}>
            Welcome, {userData?.username || 'Admin'} · {questions.length} questions
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ── STATS ──────────────────────────── */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{questions.length}</Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>
            {questions.filter(q => q.category === 'IELTS').length}
          </Text>
          <Text style={styles.statLabel}>IELTS</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>
            {questions.filter(q => q.category === 'TOEFL').length}
          </Text>
          <Text style={styles.statLabel}>TOEFL</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNum}>
            {questions.filter(q => q.difficulty === 'advanced').length}
          </Text>
          <Text style={styles.statLabel}>Advanced</Text>
        </View>
      </View>

      {/* ── TABS ───────────────────────────── */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.tabActive]}
          onPress={() => { resetForm(); setActiveTab('list'); }}
        >
          <Text style={[styles.tabText, activeTab === 'list' && styles.tabTextActive]}>
            All Questions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'add' && styles.tabActive]}
          onPress={() => { resetForm(); setActiveTab('add'); }}
        >
          <Text style={[styles.tabText, activeTab === 'add' && styles.tabTextActive]}>
            {editingId ? 'Edit Question' : '+ Add Question'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── LIST ───────────────────────────── */}
      {activeTab === 'list' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.searchWrap}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search questions..."
              placeholderTextColor={MUTED}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => { resetForm(); setActiveTab('add'); }}
            >
              <Text style={styles.addBtnText}>+ Add New</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={TEAL} size="large" />
              <Text style={styles.loadingText}>Loading questions...</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No questions found</Text>
              <Text style={styles.emptyText}>
                Add your first question using the + Add Question tab
              </Text>
            </View>
          ) : (
            filtered.map(q => (
              <QuestionCard
                key={q.id}
                q={q}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* ── FORM ───────────────────────────── */}
      {activeTab === 'add' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId ? '✏️ Edit Question' : '➕ Add New Question'}
            </Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>VOCABULARY WORD</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. ambiguous"
                placeholderTextColor={MUTED}
                value={form.word}
                onChangeText={v => setForm(f => ({ ...f, word: v }))}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>QUESTION TEXT</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. What does AMBIGUOUS mean?"
                placeholderTextColor={MUTED}
                value={form.question}
                onChangeText={v => setForm(f => ({ ...f, question: v }))}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>ANSWER OPTIONS</Text>
              {['option0','option1','option2','option3'].map((key, i) => (
                <View key={key} style={styles.optRow}>
                  <View style={[
                    styles.optBadge,
                    String(i) === form.correctIndex && { backgroundColor: TEAL }
                  ]}>
                    <Text style={[
                      styles.optBadgeText,
                      String(i) === form.correctIndex && { color: WHITE }
                    ]}>
                      {['A','B','C','D'][i]}
                    </Text>
                  </View>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder={`Option ${['A','B','C','D'][i]}`}
                    placeholderTextColor={MUTED}
                    value={form[key]}
                    onChangeText={v => setForm(f => ({ ...f, [key]: v }))}
                  />
                </View>
              ))}
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>CORRECT ANSWER</Text>
              <SelectBtn
                options={['0','1','2','3']}
                value={form.correctIndex}
                onChange={v => setForm(f => ({ ...f, correctIndex: v }))}
              />
              <Text style={styles.hint}>
                Correct: Option {['A','B','C','D'][parseInt(form.correctIndex)]}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>DIFFICULTY</Text>
              <SelectBtn
                options={DIFFICULTIES}
                value={form.difficulty}
                onChange={v => setForm(f => ({ ...f, difficulty: v }))}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>CATEGORY</Text>
              <SelectBtn
                options={CATEGORIES}
                value={form.category}
                onChange={v => setForm(f => ({ ...f, category: v }))}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>GAME LEVEL</Text>
              <SelectBtn
                options={LEVELS}
                value={form.level}
                onChange={v => setForm(f => ({ ...f, level: v }))}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>XP REWARD</Text>
              <SelectBtn
                options={XP_OPTIONS}
                value={form.xpReward}
                onChange={v => setForm(f => ({ ...f, xpReward: v }))}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color={WHITE} />
                : <Text style={styles.saveBtnText}>
                    {editingId ? 'Save Changes' : 'Add to Database'}
                  </Text>
              }
            </TouchableOpacity>

            {editingId && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { resetForm(); setActiveTab('list'); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: ICE },
  scroll:      { flex: 1 },
  center:      { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },

  header: {
    backgroundColor: NAVY,
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: WHITE },
  headerSub:   { fontSize: 12, color: '#AAC3E3', marginTop: 3 },
  logoutBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  logoutText: { color: WHITE, fontSize: 13, fontWeight: '600' },

  statsBar: {
    backgroundColor: WHITE,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  statItem:    { alignItems: 'center', gap: 3 },
  statNum:     { fontSize: 20, fontWeight: '900', color: NAVY },
  statLabel:   { fontSize: 10, color: MUTED, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: BORDER },

  tabs: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tab:           { flex: 1, paddingVertical: 13, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive:     { borderBottomColor: TEAL },
  tabText:       { fontSize: 13, fontWeight: '600', color: MUTED },
  tabTextActive: { color: TEAL, fontWeight: '800' },

  searchWrap: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 11,
    fontSize: 13,
    color: NAVY,
  },
  addBtn: {
    backgroundColor: TEAL,
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addBtnText: { color: WHITE, fontWeight: '700', fontSize: 13 },

  qCard: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
  },
  qCardTop:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, gap: 8 },
  qBadges:     { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1 },
  badge:       { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText:   { fontSize: 10, fontWeight: '700' },
  qActions:    { flexDirection: 'row', gap: 6 },
  actionBtn:   { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  actionBtnText: { fontSize: 12, fontWeight: '700' },
  qWord:       { fontSize: 16, fontWeight: '900', color: NAVY, marginBottom: 3 },
  qQuestion:   { fontSize: 12, color: MUTED, marginBottom: 10 },
  qOptions:    { gap: 5 },
  qOption: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 8, borderRadius: 8,
    backgroundColor: ICE, borderWidth: 1, borderColor: BORDER,
  },
  qOptionCorrect:  { backgroundColor: '#E0F5F3', borderColor: TEAL },
  qOptionLetter: {
    width: 22, height: 22, borderRadius: 5,
    backgroundColor: PALE_BLUE,
    textAlign: 'center', lineHeight: 22,
    fontSize: 10, fontWeight: '800', color: BLUE,
  },
  qOptionText: { fontSize: 12, color: NAVY, flex: 1 },

  formCard: {
    backgroundColor: WHITE,
    borderRadius: 16, borderWidth: 1, borderColor: BORDER,
    margin: 16, padding: 16,
  },
  formTitle: { fontSize: 16, fontWeight: '800', color: NAVY, marginBottom: 16 },
  field:     { marginBottom: 16 },
  fieldLabel: {
    fontSize: 10, fontWeight: '800', color: MUTED,
    letterSpacing: 0.8, marginBottom: 8,
  },
  hint:   { fontSize: 11, color: TEAL, fontWeight: '600', marginTop: 5 },
  input: {
    backgroundColor: ICE, borderRadius: 10,
    borderWidth: 1, borderColor: BORDER,
    padding: 12, fontSize: 14, color: NAVY, marginBottom: 8,
  },
  optRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  optBadge: {
    width: 32, height: 44, borderRadius: 8,
    backgroundColor: PALE_BLUE,
    alignItems: 'center', justifyContent: 'center',
  },
  optBadgeText: { fontSize: 13, fontWeight: '800', color: BLUE },

  selectRow:           { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  selectOpt:           { borderRadius: 8, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: ICE },
  selectOptActive:     { backgroundColor: TEAL, borderColor: TEAL },
  selectOptText:       { fontSize: 12, fontWeight: '600', color: MUTED },
  selectOptTextActive: { color: WHITE, fontWeight: '800' },

  saveBtn:      { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText:  { color: WHITE, fontSize: 15, fontWeight: '800' },
  cancelBtn:    { borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: BORDER },
  cancelBtnText:{ color: MUTED, fontSize: 14, fontWeight: '600' },

  emptyIcon:   { fontSize: 40 },
  emptyTitle:  { fontSize: 16, fontWeight: '800', color: NAVY },
  emptyText:   { fontSize: 13, color: MUTED, textAlign: 'center' },
  loadingText: { fontSize: 13, color: MUTED, marginTop: 8 },
});