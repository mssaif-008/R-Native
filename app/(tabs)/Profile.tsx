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
import * as SecureStore from 'expo-secure-store';

// ─────────────────────────────────────────────
// 🔧 CLOUDINARY CONFIG
// ─────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = 'dweisyego';
const CLOUDINARY_UPLOAD_PRESET = 'the-upload-preset';
// ─────────────────────────────────────────────

// SecureStore keys — one key per piece of data
const KEY_PHOTO = 'user_profile_photo_url';
const KEY_NAME = 'user_profile_name';
const KEY_EXPERIENCE = 'user_profile_experience';
const KEY_EMAIL = 'user_email';        // saved by LoginPage
const KEY_RESUME = 'user_resume_url';   // ← new: Cloudinary URL of resume PDF

export default function Profile() {
    const router = useRouter();

    // ── Photo ────────────────────────────────
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // ── Profile fields ───────────────────────
    const [name, setName] = useState('Your Name');
    const [experience, setExperience] = useState('Add your experience...');
    const [email, setEmail] = useState('');

    // ── Resume ───────────────────────────────
    const [resumeUrl, setResumeUrl] = useState<string | null>(null);
    const [resumeUploading, setResumeUploading] = useState(false);
    // We store just the filename to show in UI (e.g. "Resume.pdf")
    const [resumeName, setResumeName] = useState<string | null>(null);

    // ── Edit mode ────────────────────────────
    const [editingName, setEditingName] = useState(false);
    const [editingExperience, setEditingExperience] = useState(false);
    const [tempName, setTempName] = useState('');
    const [tempExperience, setTempExperience] = useState('');

    // ──────────────────────────────────────────
    // Load all saved data on mount
    // ──────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const [savedPhoto, savedName, savedExp, savedEmail, savedResume, savedResumeName] =
                    await Promise.all([
                        SecureStore.getItemAsync(KEY_PHOTO),
                        SecureStore.getItemAsync(KEY_NAME),
                        SecureStore.getItemAsync(KEY_EXPERIENCE),
                        SecureStore.getItemAsync(KEY_EMAIL),
                        SecureStore.getItemAsync(KEY_RESUME),
                        SecureStore.getItemAsync('user_resume_name'),
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

    // ──────────────────────────────────────────
    // PROFILE PHOTO — pick → upload → save
    // ──────────────────────────────────────────
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
            // Attach the image file — { uri, type, name } is the React Native way
            formData.append('file', { uri: localUri, type: 'image/jpeg', name: 'profile.jpg' } as any);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            const response = await fetch(
                // /image/upload → Cloudinary processes it as an image
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData, headers: { 'Content-Type': 'multipart/form-data' } },
            );
            const data = await response.json();
            if (data.secure_url) {
                await SecureStore.setItemAsync(KEY_PHOTO, data.secure_url);
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

    // ──────────────────────────────────────────
    // RESUME — pick PDF → upload → save URL
    //
    // STEP-BY-STEP EXPLANATION:
    //
    // 1. expo-document-picker opens native file browser
    //    → user chooses a PDF (or Word doc, etc.)
    //    → we get back: { uri, name, mimeType, size }
    //
    // 2. We build a FormData with the file attached
    //    → For PDFs we pass { uri, type: 'application/pdf', name }
    //
    // 3. We POST to Cloudinary's /raw/upload endpoint
    //    → /image/upload  → for images (jpg, png)
    //    → /raw/upload    → for all other files (PDF, DOCX, etc.)
    //    → /auto/upload   → auto-detect (also works)
    //
    // 4. Cloudinary returns { secure_url } — a permanent HTTPS link
    //
    // 5. We save that URL to SecureStore under KEY_RESUME
    //
    // 6. React state updates → UI shows "View Resume" button
    // ──────────────────────────────────────────
    const pickResume = async () => {
        try {
            // 1️⃣ Open document picker — filter to PDFs only
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',   // only PDFs allowed
                copyToCacheDirectory: true, // copies file to app cache so we can read it
            });

            // If user cancelled, result.canceled === true
            if (result.canceled || !result.assets || result.assets.length === 0) {
                return; // user pressed Cancel — do nothing
            }

            const file = result.assets[0];
            // file.uri    → local path like file:///data/.../cache/Resume.pdf
            // file.name   → 'Resume.pdf'
            // file.mimeType → 'application/pdf'

            await uploadResumeToCloudinary(file.uri, file.name ?? 'resume.pdf');

        } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not open document picker');
        }
    };

    const uploadResumeToCloudinary = async (localUri: string, fileName: string) => {
        setResumeUploading(true);
        try {
            // 2️⃣ Build FormData — same idea as photo upload
            const formData = new FormData();

            formData.append('file', {
                uri: localUri,
                type: 'application/pdf',  // MIME type for PDF
                name: fileName,           // Original file name
            } as any);

            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            // 3️⃣ POST to /raw/upload — NOT /image/upload!
            //    Raw = any non-image file (PDF, DOCX, XLSX, etc.)
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
                // 4️⃣ Cloudinary returns a direct link to the PDF
                const cloudUrl: string = data.secure_url;

                // 5️⃣ Save URL + filename to SecureStore
                await SecureStore.setItemAsync(KEY_RESUME, cloudUrl);
                await SecureStore.setItemAsync('user_resume_name', fileName);

                // 6️⃣ Update state → UI re-renders with "View Resume" button
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

    // Open the Cloudinary URL in the in-app browser.
    // expo-web-browser uses Chrome Custom Tabs (Android) /
    // SFSafariViewController (iOS) — these handle Cloudinary
    // PDF URLs correctly unlike the system browser.
    const openResume = async () => {
        if (!resumeUrl) return;
        await WebBrowser.openBrowserAsync(resumeUrl);
    };


    const saveName = async () => {
        const trimmed = tempName.trim();
        if (!trimmed) { Alert.alert('Name cannot be empty'); return; }
        await SecureStore.setItemAsync(KEY_NAME, trimmed);
        setName(trimmed);
        setEditingName(false);
    };

    const saveExperience = async () => {
        const trimmed = tempExperience.trim();
        if (!trimmed) { Alert.alert('Experience cannot be empty'); return; }
        await SecureStore.setItemAsync(KEY_EXPERIENCE, trimmed);
        setExperience(trimmed);
        setEditingExperience(false);
    };

    // ──────────────────────────────────────────
    // RENDER
    // ──────────────────────────────────────────
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backBtn}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* ── Photo ── */}
            <View style={styles.profileSection}>
                <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} disabled={uploading} activeOpacity={0.8}>
                    {photoUrl ? (
                        <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
                        </View>
                    )}
                    <View style={styles.uploadOverlay}>
                        {uploading
                            ? <ActivityIndicator color="#fff" size="small" />
                            : <Text style={styles.cameraIcon}>📷</Text>}
                    </View>
                </TouchableOpacity>
                <Text style={styles.uploadHint}>{uploading ? 'Uploading photo...' : 'Tap to change photo'}</Text>
            </View>

            {/* ── Fields ── */}
            <View style={styles.fieldsSection}>

                {/* NAME */}
                <View style={styles.fieldCard}>
                    <Text style={styles.fieldLabel}>Name</Text>
                    {editingName ? (
                        <>
                            <TextInput
                                style={styles.textInput}
                                value={tempName}
                                onChangeText={setTempName}
                                autoFocus
                                placeholder="Enter your name"
                                placeholderTextColor="#555"
                            />
                            <View style={styles.editActions}>
                                <TouchableOpacity style={styles.saveBtn} onPress={saveName}>
                                    <Text style={styles.saveBtnText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingName(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={styles.fieldRow}>
                            <Text style={styles.fieldValue}>{name}</Text>
                            <TouchableOpacity onPress={() => { setTempName(name); setEditingName(true); }} style={styles.editIconBtn}>
                                <Text style={styles.editIcon}>✏️</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* EMAIL — read only */}
                <View style={styles.fieldCard}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <View style={styles.fieldRow}>
                        <Text style={styles.fieldValue}>{email || 'Not available'}</Text>
                        <Text style={styles.lockedText}>🔒</Text>
                    </View>
                    <Text style={styles.fieldHint}>Email cannot be changed</Text>
                </View>

                {/* EXPERIENCE */}
                <View style={styles.fieldCard}>
                    <Text style={styles.fieldLabel}>Experience</Text>
                    {editingExperience ? (
                        <>
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={tempExperience}
                                onChangeText={setTempExperience}
                                autoFocus
                                multiline
                                numberOfLines={4}
                                placeholder="Describe your experience..."
                                placeholderTextColor="#555"
                            />
                            <View style={styles.editActions}>
                                <TouchableOpacity style={styles.saveBtn} onPress={saveExperience}>
                                    <Text style={styles.saveBtnText}>Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingExperience(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={styles.fieldRow}>
                            <Text style={[styles.fieldValue, { flex: 1 }]}>{experience}</Text>
                            <TouchableOpacity onPress={() => { setTempExperience(experience); setEditingExperience(true); }} style={styles.editIconBtn}>
                                <Text style={styles.editIcon}>✏️</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* ─────────────────────────────────────────
                    RESUME SECTION
                    ───────────────────────────────────────── */}
                <View style={styles.fieldCard}>
                    <Text style={styles.fieldLabel}>Resume / CV</Text>

                    {resumeUrl ? (
                        /* Resume is uploaded — show filename + action buttons */
                        <>
                            {/* Filename row */}
                            <View style={styles.resumeFileRow}>
                                <Text style={styles.pdfIcon}>📄</Text>
                                <Text style={styles.resumeFileName} numberOfLines={1}>
                                    {resumeName ?? 'Resume.pdf'}
                                </Text>
                            </View>

                            {/* Action buttons */}
                            <View style={styles.editActions}>
                                {/* Open in browser / PDF viewer */}
                                <TouchableOpacity style={styles.saveBtn} onPress={openResume}>
                                    <Text style={styles.saveBtnText}>View Resume</Text>
                                </TouchableOpacity>

                                {/* Re-upload (replace) */}
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={pickResume}
                                    disabled={resumeUploading}
                                >
                                    {resumeUploading
                                        ? <ActivityIndicator color="#888" size="small" />
                                        : <Text style={styles.cancelBtnText}>Replace</Text>}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        /* No resume yet — show upload button */
                        <TouchableOpacity
                            style={styles.uploadResumeBtn}
                            onPress={pickResume}
                            disabled={resumeUploading}
                        >
                            {resumeUploading ? (
                                <ActivityIndicator color="#007AFF" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.uploadResumeIcon}>📎</Text>
                                    <Text style={styles.uploadResumeText}>Upload Resume (PDF)</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}

                    {resumeUploading && (
                        <Text style={styles.fieldHint}>Uploading to cloud, please wait...</Text>
                    )}
                </View>

            </View>

            {/* ── Logout ── */}
            <TouchableOpacity style={styles.logoutButton} onPress={() => router.replace('/LoginPage')}>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    content: { paddingBottom: 50 },

    header: {
        paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backBtn: { fontSize: 16, color: '#007AFF', fontWeight: '600' },

    // Photo
    profileSection: { alignItems: 'center', paddingVertical: 30 },
    avatarWrapper: { width: 110, height: 110, borderRadius: 55, marginBottom: 8 },
    avatarImage: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: '#007AFF' },
    avatarPlaceholder: {
        width: 110, height: 110, borderRadius: 55, backgroundColor: '#007AFF',
        alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#0055CC',
    },
    avatarText: { fontSize: 44, color: '#fff', fontWeight: 'bold' },
    uploadOverlay: {
        position: 'absolute', bottom: 0, right: 0,
        width: 34, height: 34, borderRadius: 17,
        backgroundColor: 'rgba(0,0,0,0.65)',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 2, borderColor: '#fff',
    },
    cameraIcon: { fontSize: 16 },
    uploadHint: { fontSize: 12, color: '#555' },

    // Field cards
    fieldsSection: { paddingHorizontal: 16, gap: 12 },
    fieldCard: {
        backgroundColor: '#1e1e1e', borderRadius: 14, padding: 16,
        borderWidth: 1, borderColor: '#2a2a2a',
    },
    fieldLabel: {
        fontSize: 12, fontWeight: '600', color: '#007AFF',
        textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
    },
    fieldRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    fieldValue: { fontSize: 16, color: '#fff', lineHeight: 22 },
    fieldHint: { fontSize: 11, color: '#444', marginTop: 6 },
    editIconBtn: { paddingLeft: 10, paddingVertical: 2 },
    editIcon: { fontSize: 16 },
    lockedText: { fontSize: 16, paddingLeft: 10 },

    // Inline editor
    textInput: {
        backgroundColor: '#2a2a2a', borderRadius: 8,
        paddingHorizontal: 12, paddingVertical: 10,
        color: '#fff', fontSize: 16,
        borderWidth: 1, borderColor: '#007AFF', marginBottom: 10,
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    editActions: { flexDirection: 'row', gap: 10 },
    saveBtn: {
        flex: 1, backgroundColor: '#007AFF', borderRadius: 8,
        paddingVertical: 10, alignItems: 'center',
    },
    saveBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
    cancelBtn: {
        flex: 1, backgroundColor: '#2a2a2a', borderRadius: 8,
        paddingVertical: 10, alignItems: 'center',
        borderWidth: 1, borderColor: '#333',
    },
    cancelBtnText: { color: '#888', fontWeight: '600', fontSize: 15 },

    // Resume specific
    uploadResumeBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderWidth: 1.5, borderColor: '#007AFF', borderRadius: 10,
        borderStyle: 'dashed', paddingVertical: 16, gap: 8,
    },
    uploadResumeIcon: { fontSize: 22 },
    uploadResumeText: { color: '#007AFF', fontSize: 15, fontWeight: '600' },
    resumeFileRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        marginBottom: 12,
    },
    pdfIcon: { fontSize: 26 },
    resumeFileName: { color: '#fff', fontSize: 15, flex: 1 },

    // Logout
    logoutButton: {
        margin: 20, marginTop: 28, height: 50,
        backgroundColor: '#ff3b30', borderRadius: 12,
        alignItems: 'center', justifyContent: 'center',
    },
    logoutText: { color: '#fff', fontSize: 18, fontWeight: '600' },
});
