import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useState, useEffect } from 'react';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getStorageItemAsync, setStorageItemAsync } from '../../utils/storage';

// 1. Updated Job type: the API uses string for '_id' instead of number for 'id'.
type Job = {
  id: string; // Changed to string
  title: string;
  company: string;
  location: string;
  salary: string;
}

export default function HomePage() {
  const navigation = useNavigation();
  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());

  // 2. Updated State: applyStatus keys are now strings (the job id) and we added states for jobs and loading
  const [applyStatus, setApplyStatus] = useState<Record<string, string>>({});
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 3. The useEffect Hook: This runs when the component mounts. It is where we trigger our network request.
  useEffect(() => {
    // We define an async function inside useEffect because the effect callback itself cannot be async.
    const fetchJobs = async () => {
      try {
        // Fetch raw data from the API endpoint
        const response = await fetch('https://api.joinrise.io/api/v1/jobs/public?page=1&limit=20&sort=asc&sortedBy=createdAt&includeDescription=true&isTrending=true');
        const json = await response.json();

        // Ensure the API call was successful
        if (json.success && json.result && json.result.jobs) {
          // 4. Data Mapping: The API data has a different shape than our Job type.
          // We map over the array to transform it into the shape our UI expects.
          const formattedJobs: Job[] = json.result.jobs.map((job: any) => ({
            id: job._id,
            title: job.title,
            company: job.owner?.companyName || "Unknown Company",
            location: job.locationAddress || "Remote",
            // Format salaries nicely, e.g., $42k - $60k/yr
            salary: job.descriptionBreakdown?.salaryRangeMinYearly
              ? `$${Math.round(job.descriptionBreakdown.salaryRangeMinYearly / 1000)}k - $${Math.round(job.descriptionBreakdown.salaryRangeMaxYearly / 1000)}k/yr`
              : "Salary not specified",
          }));

          setJobs(formattedJobs); // Update our jobs state with the newly formatted data
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        Alert.alert("Error", "Could not fetch jobs from the server.");
      } finally {
        setLoading(false); // Stop loading regardless of success or failure
      }
    };

    const hydrateApplyStatus = async () => {
      try {
        const stored = await getStorageItemAsync('appliedJobs');
        if (stored) {
          const appliedJobs: Job[] = JSON.parse(stored);
          const statusMap: Record<string, string> = {};
          appliedJobs.forEach(job => {
            statusMap[job.id] = "Applied";
          });
          setApplyStatus(statusMap);
        }
      } catch (error) {
        console.error("Failed to load applied status:", error);
      }
    };

    fetchJobs(); // Trigger the function
    hydrateApplyStatus(); // Load applied status
  }, []); // Empty dependency array means this only runs once when the screen loads

  const handleApply = async (item: Job) => {
    setApplyStatus((prev) => ({
      ...prev,
      [item.id]: "Applied",
    }));

    try {
      const stored = await getStorageItemAsync('appliedJobs');
      const appliedJobs = stored ? JSON.parse(stored) : [];
      if (!appliedJobs.find((j: Job) => j.id === item.id)) {
        appliedJobs.push(item);
        await setStorageItemAsync('appliedJobs', JSON.stringify(appliedJobs));
      }
    } catch (error) {
      console.error("Failed to save applied job:", error);
    }

    Alert.alert("Application Successful", `You have applied for the ${item.title} position at ${item.company}.`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={openDrawer}>
        <Ionicons name="menu" size={28} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Available Openings</Text>
      <View style={{ width: 28 }} />
    </View>
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
      <TouchableOpacity
        style={[styles.applyBtn, applyStatus[item.id] === "Applied" && styles.applyBtnDisabled]}
        onPress={() => handleApply(item)}
        disabled={applyStatus[item.id] === "Applied"}
      >
        <Text style={[styles.applyBtnText, applyStatus[item.id] === "Applied" && styles.applyBtnTextDisabled]}>
          {applyStatus[item.id] ?? "Apply"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 5. Loading State: Conditionally render a spinner while the data is fetching */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#CFFF04" />
          <Text style={styles.loadingText}>Fetching jobs...</Text>
        </View>
      ) : (
        <FlatList
          data={jobs} // Pass our dynamic state here instead of the hardcoded data
          keyExtractor={(item) => item.id} // item.id is now a string
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D0D',
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    color: '#bbb',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#0D0D0D',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 32,
    color: '#fff',
  },
  listContent: {
    paddingBottom: 100, // accommodate floating pill
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
  applyBtn: {
    backgroundColor: '#CFFF04',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: '#1E1E1E',
  },
  applyBtnText: {
    fontFamily: 'Inter_700Bold',
    color: '#0D0D0D',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 2,
  },
  applyBtnTextDisabled: {
    color: '#555',
  },
});
