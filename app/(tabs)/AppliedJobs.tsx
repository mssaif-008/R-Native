import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          const stored = await AsyncStorage.getItem('appliedJobs');
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
    <View style={styles.card}>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.companyText}>{item.company}</Text>
      <View style={styles.jobDetails}>
        <Text style={styles.detailText}>{item.location}</Text>
        <Text style={styles.detailText}>•</Text>
        <Text style={styles.salaryText}>{item.salary}</Text>
        <View style={styles.appliedStatus}>
          <Text style={styles.appliedText}>Applied</Text>
        </View>
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
    backgroundColor: '#121212',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  emptyText: {
    color: '#bbb',
    fontSize: 16,
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  companyText: {
    fontSize: 16,
    color: '#bbb',
    marginBottom: 10,
  },
  jobDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 14,
    color: '#888',
    marginRight: 5,
    marginBottom: 5,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 5,
    marginBottom: 5,
  },
  appliedStatus: {
    marginLeft: 'auto',
    backgroundColor: '#333',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  appliedText: {
    color: '#4ADE80',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
