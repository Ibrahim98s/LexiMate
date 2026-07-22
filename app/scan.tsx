import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguageStore } from '../store/languageStore';
import { uploadDocument } from '../services/documentService';
import { useAuthStore } from '../store/authStore';

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();
    const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);
    const checkAuth = useAuthStore((state) => state.checkAuth);

    const isQuotaError = uploadError?.includes('free scans this month') ?? false;

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <LinearGradient colors={['#0A1628', '#0F1F3A']} style={styles.container}>
                <SafeAreaView style={styles.permissionContainer}>
                    <View style={styles.permissionIconCircle}>
                        <Ionicons name="camera-outline" size={32} color="#2DD4BF" />
                    </View>
                    <Text style={styles.permissionTitle}>Camera Access Needed</Text>
                    <Text style={styles.permissionText}>
                        LexiMate needs camera access to scan and analyze your legal documents.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Ionicons name="camera" size={18} color="#F0F4FF" />
                        <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    async function handleCapture() {
        if (!cameraRef.current || isUploading) return;
        setIsUploading(true);
        setUploadError(null);

        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.4 });
            if (!photo?.uri) throw new Error('No photo captured');

            const result = await uploadDocument(photo.uri, selectedLanguage);
            checkAuth(); // refresh scansUsed so home reflects the latest count
            router.push({ pathname: '/results', params: { documentId: String(result.id) } });
        } catch (error: any) {
            console.log('Upload failed:', error);

            const message =
                error?.code === 'ECONNABORTED'
                    ? "This is taking longer than expected. Check your connection and try again."
                    : error?.response?.data?.error || "Couldn't analyze this document. Try again.";

            setUploadError(message);
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} ref={cameraRef} facing="back">

                <SafeAreaView style={styles.topBar} edges={['top']}>
                    <TouchableOpacity
                        style={styles.topButton}
                        onPress={() => router.replace('/(tabs)')}
                    >
                        <Ionicons name="close" size={22} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={styles.topCenter}>
                        <Text style={styles.topTitle}>Scan Document</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.languageButton}
                        onPress={() => router.push('/language-select')}
                    >
                        <Ionicons name="language" size={16} color="#FFFFFF" />
                        <Text style={styles.languageButtonText}>{selectedLanguage.toUpperCase()}</Text>
                    </TouchableOpacity>
                </SafeAreaView>

                {!isUploading && !uploadError && (
                    <View style={styles.frameGuide}>
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />
                    </View>
                )}

                {isUploading && (
                    <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="large" color="#2DD4BF" />
                        <Text style={styles.uploadingTitle}>Analyzing document...</Text>
                        <Text style={styles.uploadingSubtitle}>This may take a few seconds</Text>
                    </View>
                )}

                {!isUploading && uploadError && (
                    <View style={styles.uploadingOverlay}>
                        <View style={styles.errorIconCircle}>
                            <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
                        </View>
                        <Text style={styles.uploadingTitle}>
                            {isQuotaError ? "Out of Free Scans" : "Upload Failed"}
                        </Text>
                        <Text style={styles.uploadingSubtitle}>{uploadError}</Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => {
                                if (isQuotaError) {
                                    router.push('/profile');
                                } else {
                                    setUploadError(null);
                                }
                            }}
                        >
                            <Ionicons
                                name={isQuotaError ? 'star-outline' : 'camera-outline'}
                                size={16}
                                color="#F0F4FF"
                            />
                            <Text style={styles.retryButtonText}>
                                {isQuotaError ? 'Upgrade to Premium' : 'Try Again'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!uploadError && (
                    <View style={styles.bottomBar}>
                        <Text style={styles.hintText}>
                            Position document within the frame
                        </Text>
                        <TouchableOpacity
                            style={[styles.captureButton, isUploading && styles.captureButtonDisabled]}
                            onPress={handleCapture}
                            disabled={isUploading}
                            activeOpacity={0.8}
                        >
                            <View style={styles.captureRing}>
                                <View style={styles.captureInner} />
                            </View>
                        </TouchableOpacity>
                        <View style={{ height: 24 }} />
                    </View>
                )}

            </CameraView>
        </View>
    );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1628',
    },
    camera: {
        flex: 1,
    },
    permissionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 12,
    },
    permissionIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#132240',
        borderColor: '#2DD4BF',
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    permissionTitle: {
        color: '#F0F4FF',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    permissionText: {
        color: '#8A9BBF',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 260,
    },
    permissionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 28,
        marginTop: 8,
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    topButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(0,0,0,0.45)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    topCenter: {
        flex: 1,
        alignItems: 'center',
    },
    topTitle: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.45)',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    languageButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '700',
    },
    frameGuide: {
        position: 'absolute',
        top: '25%',
        left: '8%',
        right: '8%',
        bottom: '25%',
    },
    corner: {
        position: 'absolute',
        width: CORNER_SIZE,
        height: CORNER_SIZE,
        borderColor: '#2DD4BF',
    },
    cornerTL: {
        top: 0,
        left: 0,
        borderTopWidth: CORNER_THICKNESS,
        borderLeftWidth: CORNER_THICKNESS,
        borderTopLeftRadius: 4,
    },
    cornerTR: {
        top: 0,
        right: 0,
        borderTopWidth: CORNER_THICKNESS,
        borderRightWidth: CORNER_THICKNESS,
        borderTopRightRadius: 4,
    },
    cornerBL: {
        bottom: 0,
        left: 0,
        borderBottomWidth: CORNER_THICKNESS,
        borderLeftWidth: CORNER_THICKNESS,
        borderBottomLeftRadius: 4,
    },
    cornerBR: {
        bottom: 0,
        right: 0,
        borderBottomWidth: CORNER_THICKNESS,
        borderRightWidth: CORNER_THICKNESS,
        borderBottomRightRadius: 4,
    },
    uploadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(10,22,40,0.92)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 32,
    },
    uploadingTitle: {
        color: '#F0F4FF',
        fontSize: 17,
        fontWeight: '700',
        marginTop: 8,
        textAlign: 'center',
    },
    uploadingSubtitle: {
        color: '#8A9BBF',
        fontSize: 13,
        textAlign: 'center',
    },
    errorIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(239,68,68,0.12)',
        borderColor: '#EF4444',
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 28,
        marginTop: 12,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        alignItems: 'center',
        paddingBottom: 48,
        gap: 16,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingTop: 20,
    },
    hintText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 13,
    },
    captureButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButtonDisabled: {
        opacity: 0.4,
    },
    captureRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureInner: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: '#FFFFFF',
    },
});