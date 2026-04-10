import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Profile() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backBtn}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 40 }} /> 
            </View>

            <View style={styles.profileSection}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>JD</Text>
                </View>
                <Text style={styles.userName}>Saif</Text>
                <Text style={styles.userEmail}>saif@gmail.com</Text>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.infoTitle}>Experience</Text>
                <Text style={styles.infoText}>Experience at React Native</Text>
            </View>

            <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => router.replace('/LoginPage')}
            >
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    backBtn: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    profileSection: {
        alignItems: 'center',
        padding: 30,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    avatarText: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    userEmail: {
        fontSize: 16,
        color: '#888',
        marginTop: 5,
    },
    infoSection: {
        padding: 20,
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#ccc',
    },
    logoutButton: {
        margin: 20,
        height: 50,
        backgroundColor: '#ff3b30',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
        marginBottom: 40,
    },
    logoutText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});
