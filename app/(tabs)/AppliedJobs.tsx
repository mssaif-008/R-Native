import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import { getStorageItemAsync } from '../../utils/storage';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
};

export default function AppliedJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchApplied = async () => {
        try {
          const stored = await getStorageItemAsync('appliedJobs');
          if (stored) {
            setJobs(JSON.parse(stored));
          }
        } catch (e) {
          console.error("Failed to fetch applied jobs from storage", e);
        }
      };
      fetchApplied();
    }, [])
  );

  const renderItem = ({ item }: { item: Job }) => (
    <View style={styles.jobStrip}>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.companyText}>{item.company}</Text>
      <View style={styles.jobDetailsRow}>
        <Text style={styles.detailText}>{item.location}</Text>
        <Text style={styles.separatorText}>•</Text>
        <Text style={styles.salaryText}>{item.salary}</Text>
      </View>
      <View style={styles.appliedTag}>
        <Text style={styles.appliedTagText}>APPLIED</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Applied Jobs</Text>
      </View>
      {jobs.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No applications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#0D0D0D',
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    color: '#555',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 100,
  },
  jobStrip: {
    backgroundColor: '#111',
    padding: 20,
    paddingLeft: 20,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#CFFF04',
  },
  jobTitle: {
    fontFamily: 'Inter_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 14,
    color: '#fff',
    marginBottom: 4,
  },
  companyText: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
    color: '#fff',
    marginBottom: 12,
  },
  jobDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#888',
  },
  separatorText: {
    fontSize: 14,
    color: '#333',
    marginHorizontal: 8,
  },
  salaryText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#888',
  },
  appliedTag: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appliedTagText: {
    fontFamily: 'Inter_700Bold',
    color: '#555',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 2,
  },
});
