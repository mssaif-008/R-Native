import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useNavigation } from 'expo-router'; import { useState } from 'react';
import { DrawerActions } from '@react-navigation/native'; // 2. Added this import
import { Ionicons } from '@expo/vector-icons';

const data: Job[] = [{ id: 100, title: "Software Engineer", company: "Hexaware", location: "Chennai", salary: "5 LPA" }, { id: 101, title: "System Engineer", company: "TCS", location: "Bangalore", salary: "6 LPA" }, { id: 102, title: "Software Engineer", company: "Hexaware", location: "Chennai", salary: "5 LPA" }];
type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  salary: string;
}

export default function HomePage() {
  // Inside your HomePage component:
  const navigation = useNavigation();
  const openDrawer = () => navigation.dispatch(DrawerActions.openDrawer());
  const [applyStatus, setApplyStatus] = useState<Record<number, string>>({});
  const router = useRouter();

  const handleApply = (item: Job) => {
    setApplyStatus((prev) => ({
      ...prev,
      [item.id]: "Applied",

    }));
    Alert.alert("Application Successful", `You have applied for the ${item.title} position at ${item.company}.`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={openDrawer}>
        <Ionicons name="menu" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Available Openings</Text>
      <TouchableOpacity onPress={() => router.push('/Profile')}>
        <Text style={styles.profileBtn}>Profile</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: Job }) => (

    <View style={styles.card}>
      <Text style={styles.jobTitle}>{item.title}</Text>
      <Text style={styles.companyText}>{item.company}</Text>
      <View style={styles.jobDetails}>
        <Text style={styles.detailText}>{item.location}</Text>
        <Text style={styles.detailText}>•</Text>
        <Text style={styles.salaryText}>{item.salary}</Text>
        <TouchableOpacity
          style={[styles.applyBtn, applyStatus[item.id] === "Applied" && styles.applyBtnDisabled]}
          onPress={() => handleApply(item)}
          disabled={applyStatus[item.id] === "Applied"}
        >
          <Text style={styles.applyBtnText}>
            {applyStatus[item.id] ?? "Apply"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>

  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileBtn: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 15,
  },
  applyBtn: {
    marginLeft: 'auto',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  applyBtnDisabled: {
    backgroundColor: '#444',
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: '600',
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
  },
  detailText: {
    fontSize: 14,
    color: '#888',
    marginRight: 5,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
    marginLeft: 5,
  },
});
