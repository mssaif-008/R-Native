import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    TextInput,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import * as DocumentPicker from 'expo-document-picker';
import { getStorageItemAsync, setStorageItemAsync } from '../../utils/storage';
import { useAuth } from '../../ctx/auth';


const CLOUDINARY_CLOUD_NAME = 'dweisyego';
const CLOUDINARY_UPLOAD_PRESET = 'the-upload-preset';



const KEY_PHOTO = 'user_profile_photo_url';
const KEY_NAME = 'user_profile_name';
const KEY_EXPERIENCE = 'user_profile_experience';
const KEY_EMAIL = 'user_email';
const KEY_RESUME = 'user_resume_url';

export default function Profile() {
    const router = useRouter();
    const { signOut } = useAuth();


    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);


    const [name, setName] = useState('Your Name');
    const [experience, setExperience] = useState('Add your experience...');
    const [email, setEmail] = useState('');


    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [resumeUploading, setResumeUploading] = useState(false);

    const [resumeName, setResumeName] = useState<string | null>(null);


    const [isEditing, setIsEditing] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempExperience, setTempExperience] = useState('');



    useEffect(() => {
        const load = async () => {
            try {
                const [savedPhoto, savedName, savedExp, savedEmail, savedResume, savedResumeName] =
                    await Promise.all([
                        getStorageItemAsync(KEY_PHOTO),
                        getStorageItemAsync(KEY_NAME),
                        getStorageItemAsync(KEY_EXPERIENCE),
                        getStorageItemAsync(KEY_EMAIL),
                        getStorageItemAsync(KEY_RESUME),
                        getStorageItemAsync('user_resume_name'),
                    ]);
                if (savedPhoto) setPhotoUrl(savedPhoto);
                if (savedName) setName(savedName);
                if (savedExp) setExperience(savedExp);
                if (savedEmail) setEmail(savedEmail);
                if (savedResume) setResumeUrl(savedResume);
                if (savedResumeName) setResumeName(savedResumeName);
            } catch (e) {
                console.error('Failed to load profile data:', e);
            }
        };
        load();
    }, []);


    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please allow access to your photo library.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });
        if (!result.canceled && result.assets.length > 0) {
            await uploadImageToCloudinary(result.assets[0].uri);
        }
    };

    const uploadImageToCloudinary = async (localUri: string) => {
        setUploading(true);
        try {
            const formData = new FormData();

            formData.append('file', { uri: localUri, type: 'image/jpeg', name: 'profile.jpg' } as any);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const response = await fetch(

                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } },
            );
            const data = await response.json();
            if (data.secure_url) {
                await setStorageItemAsync(KEY_PHOTO, data.secure_url);
                setPhotoUrl(data.secure_url);
                Alert.alert('✅ Success', 'Profile photo updated!');
            } else {
                throw new Error(data.error?.message || 'Image upload failed');
            }
        } catch (e: any) {
            Alert.alert('Photo Upload Failed', e.message);
        } finally {
            setUploading(false);
        }
    };


    const pickResume = async () => {
        try {

            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const file = result.assets[0];

            await uploadResumeToCloudinary(file.uri, file.name ?? 'resume.pdf');

        } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not open document picker');
        }
    };

    const uploadResumeToCloudinary = async (localUri: string, fileName: string) => {
        setResumeUploading(true);
        try {

            const formData = new FormData();

            formData.append('file', {
                uri: localUri,
                type: 'application/pdf',
                name: fileName,
            } as any);

            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);


            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
                {
                    method: 'POST',
                    body: formData,
                    headers: { 'Content-Type': 'multipart/form-data' },
                },
            );

            const data = await response.json();

            if (data.secure_url) {

                const cloudUrl: string = data.secure_url;


                await setStorageItemAsync(KEY_RESUME, cloudUrl);
                await setStorageItemAsync('user_resume_name', fileName);


                setResumeUrl(cloudUrl);
                setResumeName(fileName);

                Alert.alert('✅ Resume Uploaded', `"${fileName}" uploaded successfully!`);
            } else {
                throw new Error(data.error?.message || 'Resume upload failed');
            }
        } catch (e: any) {
            Alert.alert('Resume Upload Failed', e.message || 'Something went wrong');
        } finally {
            setResumeUploading(false);
        }
    };

    const openResume = async () => {
        if (!resumeUrl) return;
        await WebBrowser.openBrowserAsync(resumeUrl);
    };


    const handleEditProfile = () => {
        setTempName(name);
        setTempExperience(experience);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSaveProfile = async () => {
        const trimmedName = tempName.trim();
        const trimmedExp = tempExperience.trim();
        if (!trimmedName) { Alert.alert('Name cannot be empty'); return; }
        if (!trimmedExp) { Alert.alert('Experience cannot be empty'); return; }

        await setStorageItemAsync(KEY_NAME, trimmedName);
        await setStorageItemAsync(KEY_EXPERIENCE, trimmedExp);

        setName(trimmedName);
        setExperience(trimmedExp);
        setIsEditing(false);
    };


    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backBtn}>BACK</Text>
                </TouchableOpacity>
                {!isEditing ? (
                    <TouchableOpacity onPress={handleEditProfile}>
                        <Text style={styles.headerEditBtn}>EDIT PROFILE</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{ flexDirection: 'row', gap: 15 }}>
                        <TouchableOpacity onPress={handleCancelEdit}>
                            <Text style={[styles.headerEditBtn, { color: '#888' }]}>CANCEL</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSaveProfile}>
                            <Text style={[styles.headerEditBtn, { color: '#CFFF04' }]}>SAVE</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* ── Typographic Profile Header ── */}
            <View style={styles.profileSection}>
                <Text style={styles.massiveName}>{isEditing ? tempName || 'Your Name' : name}</Text>
                <Text style={styles.accentTitle}>{isEditing ? tempExperience || 'Title' : experience || 'No title set'}</Text>

                <View style={styles.photoContainer}>
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={styles.sharpImage} />
                    ) : (
                        <View style={[styles.sharpImage, { backgroundColor: '#222' }]} />
                    )}
                    {isEditing && (
                        <TouchableOpacity onPress={pickImage} disabled={uploading} style={styles.photoActionBtn}>
                            <Text style={styles.photoActionText}>
                                {uploading ? 'UPLOADING...' : (photoUrl ? 'REPLACE PROFILE' : 'UPLOAD PROFILE')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ── Fields ── */}
            <View style={styles.fieldsSection}>

                {/* NAME */}
                <View style={styles.fieldWrapper}>
                    <Text style={styles.fieldLabel}>Name</Text>
                    {isEditing ? (
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.textInput}
                                value={tempName}
                                onChangeText={setTempName}
                                placeholder="Enter your name"
                                placeholderTextColor="#555"
                                selectionColor="#CFFF04"
                            />
                        </View>
                    ) : (
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldValue}>{name}</Text>
                        </View>
                    )}
                </View>

                {/* EXPERIENCE */}
                <View style={styles.fieldWrapper}>
                    <Text style={styles.fieldLabel}>Title / Experience</Text>
                    {isEditing ? (
                        <View style={[styles.inputContainer, styles.textAreaContainer]}>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={tempExperience}
                                onChangeText={setTempExperience}
                                multiline
                                numberOfLines={4}
                                placeholder="Describe your title or experience..."
                                placeholderTextColor="#555"
                                selectionColor="#CFFF04"
                            />
                        </View>
                    ) : (
                        <View style={styles.fieldRow}>
                            <Text style={[styles.fieldValue, { flex: 1 }]}>{experience}</Text>
                        </View>
                    )}
                </View>

                {/* EMAIL — read only */}
                <View style={styles.fieldWrapper}>
                    <Text style={styles.fieldLabel}>Secondary (Email)</Text>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldValue}>{email || 'Not available'}</Text>
                        <Text style={styles.lockedText}>{isEditing ? 'UNMODIFIABLE' : 'LOCKED'}</Text>
                    </View>
                </View>

                {/* ─────────────────────────────────────────
                    RESUME SECTION
                    ───────────────────────────────────────── */}
                <View style={styles.fieldWrapper}>
                    <Text style={styles.fieldLabel}>Resume</Text>

                    {resumeUrl ? (
                        <>
                            <View style={styles.resumeFileRow}>
                                <Text style={styles.resumeFileName} numberOfLines={1}>
                                    {resumeName ?? 'Resume.pdf'}
                                </Text>
                            </View>

                            <View style={styles.editActions}>
                                <TouchableOpacity style={styles.viewDocBtn} onPress={openResume}>
                                    <Text style={styles.viewDocBtnText}>VIEW RESUME</Text>
                                </TouchableOpacity>

                                {isEditing && (
                                    <TouchableOpacity
                                        style={styles.replaceBtn}
                                        onPress={pickResume}
                                        disabled={resumeUploading}
                                    >
                                        {resumeUploading
                                            ? <ActivityIndicator color="#888" size="small" />
                                            : <Text style={styles.replaceBtnText}>REPLACE</Text>}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    ) : (
                        isEditing ? (
                            <TouchableOpacity
                                style={styles.uploadResumeBtn}
                                onPress={pickResume}
                                disabled={resumeUploading}
                            >
                                {resumeUploading ? (
                                    <ActivityIndicator color="#CFFF04" size="small" />
                                ) : (
                                    <Text style={styles.uploadResumeText}>ATTACH RESUME</Text>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.fieldRow}>
                                <Text style={styles.fieldValue}>No document attached</Text>
                            </View>
                        )
                    )}
                </View>

            </View>

            {/* ── Logout ── */}
            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Text style={styles.logoutText}>LOGOUT</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0D0D' },
    content: { paddingBottom: 100 },

    header: {
        paddingTop: 80, paddingBottom: 20, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    backBtn: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff', letterSpacing: 2 },
    headerEditBtn: { fontFamily: 'Inter_700Bold', fontSize: 12, color: '#fff', letterSpacing: 2 },

    // Typographic Profile
    profileSection: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
    massiveName: {
        fontFamily: 'DMSerifDisplay_400Regular',
        fontSize: 48,
        lineHeight: 52,
        color: '#fff',
        marginBottom: 8,
    },
    accentTitle: {
        fontFamily: 'Inter_600SemiBold',
        fontSize: 16,
        color: '#CFFF04',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 20,
    },
    photoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    sharpImage: {
        width: 48,
        height: 48,
        marginRight: 12,
    },
    photoActionBtn: {
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    photoActionText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 12,
        color: '#555',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },

    // Field Layout
    fieldsSection: { paddingHorizontal: 20, gap: 30 },
    fieldWrapper: { width: '100%' },
    fieldLabel: {
        fontFamily: 'Inter_700Bold',
        fontSize: 11,
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 8,
    },
    fieldRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        borderBottomWidth: 2, borderBottomColor: '#333', paddingVertical: 10,
    },
    fieldValue: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#bbb' },
    lockedText: { fontFamily: 'Inter_700Bold', fontSize: 11, color: '#555', letterSpacing: 1 },

    // Inline editor
    inputContainer: {
        borderBottomWidth: 2, borderBottomColor: '#CFFF04',
        paddingVertical: 5,
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 10,
    },
    textAreaContainer: {
        height: 90,
    },
    textInput: {
        fontFamily: 'Inter_400Regular',
        width: '100%',
        color: '#fff', fontSize: 16,
        paddingVertical: 5,
    },
    textArea: { height: 80, textAlignVertical: 'top' },

    // Doc Actions
    editActions: { flexDirection: 'row', gap: 10, marginTop: 10 },
    viewDocBtn: {
        flex: 1, backgroundColor: '#CFFF04', borderRadius: 0,
        paddingVertical: 14, alignItems: 'center',
    },
    viewDocBtnText: { fontFamily: 'Inter_700Bold', color: '#0D0D0D', fontSize: 12, letterSpacing: 1.5 },
    replaceBtn: {
        flex: 1, backgroundColor: '#1E1E1E', borderRadius: 0,
        paddingVertical: 14, alignItems: 'center',
    },
    replaceBtnText: { fontFamily: 'Inter_700Bold', color: '#888', fontSize: 12, letterSpacing: 1.5 },

    // Resume specific
    uploadResumeBtn: {
        width: '100%',
        backgroundColor: '#1E1E1E',
        alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18,
        marginTop: 5,
    },
    uploadResumeText: { fontFamily: 'Inter_700Bold', color: '#fff', fontSize: 12, letterSpacing: 2 },
    resumeFileRow: {
        borderBottomWidth: 2, borderBottomColor: '#333',
        paddingVertical: 10,
    },
    resumeFileName: { fontFamily: 'Inter_400Regular', color: '#bbb', fontSize: 16 },

    // Logout
    logoutButton: {
        margin: 20, marginTop: 50,
        backgroundColor: 'transparent',
        borderWidth: 2, borderColor: '#333',
        paddingVertical: 16,
        alignItems: 'center', justifyContent: 'center',
    },
    logoutText: { fontFamily: 'Inter_700Bold', color: '#555', fontSize: 12, letterSpacing: 2 },
});
