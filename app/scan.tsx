import { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguageStore } from '../store/languageStore';
import { uploadDocument } from '../services/documentService';

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [isUploading, setIsUploading] = useState(false);
    const cameraRef = useRef<CameraView>(null);
    const router = useRouter();
    const selectedLanguage = useLanguageStore((state) => state.selectedLanguage);

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={48} color="#8A9BBF" />
                <Text style={styles.permissionText}>
                    We need camera access to scan your documents
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    async function handleCapture() {
        if (!cameraRef.current || isUploading) return;
        setIsUploading(true);

        try {
            const photo = await cameraRef.current.takePictureAsync({ quality: 0.4 });
            if (!photo?.uri) throw new Error('No photo captured');

            const result = await uploadDocument(photo.uri, selectedLanguage);
            router.push({ pathname: '/results', params: { documentId: String(result.id) } });
        } catch (error) {
            console.log('Upload failed:', error);
            router.push('/results');
        } finally {
            setIsUploading(false);
        }
    }

    return (
        <View style={styles.container}>
            <CameraView style={styles.camera} ref={cameraRef} facing="back">
                <TouchableOpacity style={styles.closeButton} onPress={() => router.replace('/(tabs)')}>
                    <Ionicons name="close" size={28} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.languageButton} onPress={() => router.push('/language-select')}>
                    <Ionicons name="language" size={22} color="#FFFFFF" />
                    <Text style={styles.languageButtonText}>{selectedLanguage.toUpperCase()}</Text>
                </TouchableOpacity>

                <View style={styles.controls}>
                    <TouchableOpacity
                        style={[styles.captureButton, isUploading && styles.captureButtonDisabled]}
                        onPress={handleCapture}
                        disabled={isUploading}
                    >
                        <View style={styles.captureInner} />
                    </TouchableOpacity>
                    {isUploading && <Text style={styles.uploadingText}>Analyzing document...</Text>}
                </View>
            </CameraView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0A1628',
    },
    camera: {
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        padding: 8,
    },
    languageButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    languageButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    controls: {
        position: 'absolute',
        bottom: 50,
        width: '100%',
        alignItems: 'center',
        gap: 12,
    },
    captureButton: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    captureButtonDisabled: {
        opacity: 0.5,
    },
    captureInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
    },
    uploadingText: {
        color: '#FFFFFF',
        fontSize: 13,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    permissionContainer: {
        flex: 1,
        backgroundColor: '#0A1628',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 16,
    },
    permissionText: {
        color: '#8A9BBF',
        fontSize: 15,
        textAlign: 'center',
    },
    permissionButton: {
        backgroundColor: '#1B4FD8',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 32,
    },
    permissionButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});