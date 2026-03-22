import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RecorderProps {
    visible: boolean;
    mode: 'video' | 'audio';
    onClose: () => void;
    onRecordingComplete: (uri: string, duration: number) => void;
}

export function Recorder({ visible, mode, onClose, onRecordingComplete }: RecorderProps) {
    const insets = useSafeAreaInsets();
    const [permission, requestPermission] = useCameraPermissions();
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const cameraRef = useRef<CameraView>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        let interval: any;
        if (isRecording) {
            interval = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    useEffect(() => {
        if (visible && mode === 'audio') {
            Audio.requestPermissionsAsync();
        }
    }, [visible, mode]);

    const startRecording = async () => {
        try {
            if (mode === 'video') {
                if (!cameraRef.current) return;
                setIsRecording(true);
                const video = await cameraRef.current.recordAsync();
                // recordAsync returns when stopRecording is called
                setIsRecording(false);
                if (video?.uri) {
                    onRecordingComplete(video.uri, duration); // duration is approximate
                }
            } else {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                recordingRef.current = recording;
                setIsRecording(true);
            }
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording');
            setIsRecording(false);
        }
    };

    const stopRecording = async () => {
        if (mode === 'video') {
            cameraRef.current?.stopRecording();
            // State update happens in startRecording await
        } else {
            setIsRecording(false);
            try {
                await recordingRef.current?.stopAndUnloadAsync();
                const uri = recordingRef.current?.getURI();
                if (uri) {
                    onRecordingComplete(uri, duration);
                }
            } catch (error) {
                console.error('Failed to stop recording', error);
            }
        }
    };

    if (mode === 'video' && !permission) {
        // Camera permissions are still loading.
        return <View />;
    }

    if (mode === 'video' && !permission?.granted) {
        requestPermission();
        // return (
        //   <View style={styles.centered}>
        //     <Text style={{color: 'white'}}>We need your permission to show the camera</Text>
        //     <Button onPress={requestPermission} title="grant permission" />
        //   </View>
        // );
    }

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={[styles.container, { backgroundColor: '#000000' }]}>
                {mode === 'video' ? (
                    <CameraView
                        style={styles.camera}
                        facing="front"
                        ref={cameraRef}
                        mode="video"
                    >
                        <View style={styles.overlay}>
                            <TouchableOpacity style={[styles.closeButton, { top: insets.top + SPACING.md }]} onPress={onClose}>
                                <Ionicons name="close" size={30} color="white" />
                            </TouchableOpacity>

                            <View style={styles.controls}>
                                <Text style={styles.timer}>{formatDuration(duration)}</Text>
                                <TouchableOpacity
                                    style={[styles.recordButton, isRecording && styles.recordingActive]}
                                    onPress={isRecording ? stopRecording : startRecording}
                                >
                                    <View style={styles.tInnerButton} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </CameraView>
                ) : (
                    <View style={[styles.audioContainer, { paddingTop: insets.top }]}>
                        <TouchableOpacity style={styles.closeAudioButton} onPress={onClose}>
                            <Ionicons name="close" size={30} color="white" />
                        </TouchableOpacity>

                        <View style={styles.audioVisualizer}>
                            <Ionicons name="mic-circle" size={120} color={isRecording ? COLORS.error : COLORS.primary} />
                            <Text style={styles.timer}>{formatDuration(duration)}</Text>
                            <Text style={styles.statusText}>{isRecording ? "Recording..." : "Ready"}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.recordButton, isRecording && styles.recordingActive]}
                            onPress={isRecording ? stopRecording : startRecording}
                        >
                            <View style={[styles.tInnerButton, isRecording && { backgroundColor: COLORS.error }]} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'space-between',
        paddingBottom: 60,
    },
    closeButton: {
        position: 'absolute',
        left: SPACING.md,
        zIndex: 10,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    controls: {
        alignItems: 'center',
        gap: 20,
    },
    timer: {
        color: 'white',
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    recordButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 6,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    recordingActive: {
        borderColor: COLORS.error,
    },
    tInnerButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.error,
    },
    audioContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 60,
    },
    closeAudioButton: {
        alignSelf: 'flex-start',
        marginLeft: SPACING.md,
        marginTop: SPACING.md,
        padding: 8,
    },
    audioVisualizer: {
        alignItems: 'center',
        gap: SPACING.md,
    },
    statusText: {
        color: COLORS.textSecondary,
        fontSize: FONT_SIZES.lg,
    },
});
