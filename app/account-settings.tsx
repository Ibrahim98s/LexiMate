import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenBackground from '../components/ScreenBackground';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuthStore } from '../store/authStore';

export default function AccountSettingsScreen() {
    const router = useRouter();
    const userName = useAuthStore((state) => state.userName);
    const userEmail = useAuthStore((state) => state.userEmail);
    const updateProfile = useAuthStore((state) => state.updateProfile);
    const changePassword = useAuthStore((state) => state.changePassword);
    const deleteAccount = useAuthStore((state) => state.deleteAccount);

    const [fullName, setFullName] = useState(userName || '');
    const [email, setEmail] = useState(userEmail || '');
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleSaveProfile() {
        setProfileError('');
        setProfileSuccess('');

        if (!fullName.trim() || !email.trim()) {
            setProfileError('Name and email are required.');
            return;
        }

        setIsSavingProfile(true);
        try {
            await updateProfile(fullName.trim(), email.trim());
            setProfileSuccess('Profile updated successfully.');
        } catch (error: any) {
            const message = error?.response?.data?.error || 'Could not update profile. Please try again.';
            setProfileError(message);
        } finally {
            setIsSavingProfile(false);
        }
    }

    async function handleChangePassword() {
        setPasswordError('');
        setPasswordSuccess('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError('All password fields are required.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match.');
            return;
        }

        setIsSavingPassword(true);
        try {
            await changePassword(currentPassword, newPassword);
            setPasswordSuccess('Password changed successfully.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const message = error?.response?.data?.error || 'Could not change password. Please try again.';
            setPasswordError(message);
        } finally {
            setIsSavingPassword(false);
        }
    }

    async function handleDeleteAccount() {
        setDeleteError('');

        if (!deletePassword) {
            setDeleteError('Enter your password to confirm.');
            return;
        }

        setIsDeleting(true);
        try {
            await deleteAccount(deletePassword);
            router.replace('/(auth)/login');
        } catch (error: any) {
            const message = error?.response?.data?.error || 'Could not delete account. Please try again.';
            setDeleteError(message);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <ScreenBackground
            orbs={[
                { color: '#EF4444', size: 200, opacity: 0.06, bottom: -60, right: -60 },
                { color: '#2DD4BF', size: 200, opacity: 0.08, top: -60, left: -60 },
            ]}
        >
            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={20} color="#F0F4FF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Account Settings</Text>
                    <View style={{ width: 36 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <Text style={styles.sectionTitle}>Profile Info</Text>
                    <View style={styles.card}>
                        <Input
                            label="Full Name"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                        <Input
                            label="Email Address"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />
                        {profileError ? (
                            <View style={styles.messageRow}>
                                <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
                                <Text style={styles.errorText}>{profileError}</Text>
                            </View>
                        ) : null}
                        {profileSuccess ? (
                            <View style={styles.messageRow}>
                                <Ionicons name="checkmark-circle-outline" size={15} color="#22C55E" />
                                <Text style={styles.successText}>{profileSuccess}</Text>
                            </View>
                        ) : null}
                        <Button label="Save Changes" onPress={handleSaveProfile} loading={isSavingProfile} />
                    </View>

                    <Text style={styles.sectionTitle}>Change Password</Text>
                    <View style={styles.card}>
                        <Input
                            label="Current Password"
                            isPassword
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        <Input
                            label="New Password"
                            isPassword
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <Input
                            label="Confirm New Password"
                            isPassword
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        {passwordError ? (
                            <View style={styles.messageRow}>
                                <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
                                <Text style={styles.errorText}>{passwordError}</Text>
                            </View>
                        ) : null}
                        {passwordSuccess ? (
                            <View style={styles.messageRow}>
                                <Ionicons name="checkmark-circle-outline" size={15} color="#22C55E" />
                                <Text style={styles.successText}>{passwordSuccess}</Text>
                            </View>
                        ) : null}
                        <Button label="Update Password" onPress={handleChangePassword} loading={isSavingPassword} />
                    </View>

                    <Text style={[styles.sectionTitle, { color: '#EF4444' }]}>Danger Zone</Text>
                    <View style={styles.dangerCard}>
                        <Text style={styles.dangerTitle}>Delete Account</Text>
                        <Text style={styles.dangerText}>
                            This permanently deletes your account and all scanned documents. This cannot be undone.
                        </Text>

                        {!showDeleteConfirm ? (
                            <TouchableOpacity
                                style={styles.dangerButton}
                                onPress={() => setShowDeleteConfirm(true)}
                            >
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                <Text style={styles.dangerButtonText}>Delete My Account</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={{ marginTop: 8 }}>
                                <Input
                                    label="Enter your password to confirm"
                                    isPassword
                                    value={deletePassword}
                                    onChangeText={setDeletePassword}
                                />
                                {deleteError ? (
                                    <View style={styles.messageRow}>
                                        <Ionicons name="alert-circle-outline" size={15} color="#EF4444" />
                                        <Text style={styles.errorText}>{deleteError}</Text>
                                    </View>
                                ) : null}
                                <TouchableOpacity
                                    style={styles.dangerConfirmButton}
                                    onPress={handleDeleteAccount}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? (
                                        <ActivityIndicator color="#F0F4FF" />
                                    ) : (
                                        <>
                                            <Ionicons name="warning-outline" size={16} color="#F0F4FF" />
                                            <Text style={styles.dangerConfirmButtonText}>
                                                Yes, Permanently Delete My Account
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => {
                                        setShowDeleteConfirm(false);
                                        setDeletePassword('');
                                        setDeleteError('');
                                    }}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                </ScrollView>
            </SafeAreaView>
        </ScreenBackground>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomColor: '#2A4470',
        borderBottomWidth: 1,
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#132240',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        color: '#F0F4FF',
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
        marginHorizontal: 8,
    },
    content: {
        padding: 20,
        paddingBottom: 48,
    },
    sectionTitle: {
        color: '#8A9BBF',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 8,
        marginLeft: 2,
        marginTop: 8,
    },
    card: {
        backgroundColor: '#132240',
        borderColor: '#2A4470',
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
    },
    messageRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
        marginTop: -4,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        flex: 1,
    },
    successText: {
        color: '#22C55E',
        fontSize: 13,
        flex: 1,
    },
    dangerCard: {
        backgroundColor: '#132240',
        borderColor: 'rgba(239,68,68,0.35)',
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 16,
        marginBottom: 20,
    },
    dangerTitle: {
        color: '#F0F4FF',
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 6,
    },
    dangerText: {
        color: '#8A9BBF',
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 14,
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(239,68,68,0.4)',
        backgroundColor: 'rgba(239,68,68,0.06)',
        paddingVertical: 12,
    },
    dangerButtonText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
    },
    dangerConfirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        paddingVertical: 14,
        marginTop: 4,
    },
    dangerConfirmButtonText: {
        color: '#F0F4FF',
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 4,
    },
    cancelButtonText: {
        color: '#8A9BBF',
        fontSize: 13,
    },
});