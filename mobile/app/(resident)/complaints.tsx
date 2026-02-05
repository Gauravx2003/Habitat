import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

// Dummy Data
const DUMMY_COMPLAINTS = [
  { id: '1', title: 'Fan not working', category: 'Electrical', date: 'Feb 4, 2026', status: 'PENDING' },
  { id: '2', title: 'Leaking tap', category: 'Plumbing', date: 'Feb 1, 2026', status: 'RESOLVED' },
];

export default function ComplaintsScreen() {
  const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');
  const [category, setCategory] = useState('Electrical');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');

  // 1. Render History List
  const renderHistory = () => (
    <FlatList
      data={DUMMY_COMPLAINTS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 20 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{item.category}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === 'RESOLVED' ? styles.bgGreen : styles.bgRed]}>
              <Text style={[styles.statusText, item.status === 'RESOLVED' ? styles.textGreen : styles.textRed]}>
                {item.status}
              </Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
      )}
    />
  );

  // 2. Render New Complaint Form
  const renderForm = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.formContainer}>
          
          <Text style={styles.label}>Issue Category</Text>
          <View style={styles.chipContainer}>
            {['Electrical', 'Plumbing', 'Furniture', 'Internet'].map((cat) => (
              <TouchableOpacity 
                key={cat}
                onPress={() => setCategory(cat)}
                style={[styles.chip, category === cat ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={category === cat ? styles.chipTextActive : styles.chipTextInactive}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Subject</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Fan not working"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Describe details..."
            multiline
            value={desc}
            onChangeText={setDesc}
          />

          <TouchableOpacity style={styles.submitBtn}>
            <Text style={styles.submitBtnText}>Submit Complaint</Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Complaints</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={activeTab === 'history' ? styles.tabTextActive : styles.tabTextInactive}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'new' && styles.tabActive]}
          onPress={() => setActiveTab('new')}
        >
          <Text style={activeTab === 'new' ? styles.tabTextActive : styles.tabTextInactive}>Raise New</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Render */}
      {activeTab === 'history' ? renderHistory() : renderForm()}
    </SafeAreaView>
  );
}

// Standard Styles (Safe & Reliable)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', paddingHorizontal: 20, paddingTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  
  // Tabs
  tabContainer: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  tabTextActive: { fontWeight: '600', color: '#111827' },
  tabTextInactive: { fontWeight: '600', color: '#6B7280' },

  // Card
  card: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  catText: { color: '#2563EB', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  bgGreen: { backgroundColor: '#DCFCE7' },
  bgRed: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 10, fontWeight: '700' },
  textGreen: { color: '#15803D' },
  textRed: { color: '#B91C1C' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  cardDate: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },

  // Form
  formContainer: { backgroundColor: 'white', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 40 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginBottom: 16, fontSize: 16 },
  submitBtn: { backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Chips
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipInactive: { backgroundColor: 'white', borderColor: '#E5E7EB' },
  chipTextActive: { color: 'white', fontWeight: '500' },
  chipTextInactive: { color: '#4B5563', fontWeight: '500' },
});