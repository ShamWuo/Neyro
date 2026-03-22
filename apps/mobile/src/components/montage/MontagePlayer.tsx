import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Text,
    Dimensions,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES } from '../../constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface MontageClip {
    id: string;
    uri: string;
    date: string; // ISO string
}

interface MontagePlayerProps {
    visible: boolean;
    clips: MontageClip[];
    onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export function MontagePlayer({ visible, clips, onClose }: MontagePlayerProps) {
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef<Video>(null);

    // Sort clips by date (oldest to newest for progress)
    const sortedClips = [...clips].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const currentClip = sortedClips[currentIndex];

    useEffect(() => {
        if (visible) {
            setCurrentIndex(0);
            setIsPlaying(true);
        }
    }, [visible]);

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) return;

        // Transition logic: When video finishes, jump to next immediately
        if (status.didJustFinish) {
            if (currentIndex < sortedClips.length - 1) {
                // Go to next clip
                setCurrentIndex(prev => prev + 1);
            } else {
                // Montage finished
                setIsPlaying(false);
                // Optional: Loop or close? Let's just stop at the end.
            }
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
            <View style={styles.container}>
                {currentClip ? (
                    <Video
                        ref={videoRef}
                        style={styles.video}
                        source={{ uri: currentClip.uri }}
                        useNativeControls={false}
                        resizeMode={ResizeMode.COVER}
                        isLooping={false}
                        shouldPlay={isPlaying}
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                    />
                ) : (
                    <View style={styles.center}>
                        <Text style={{ color: 'white' }}>No clips available</Text>
                    </View>
                )}

                {/* Overlay UI */}
                <View style={[styles.overlay, { paddingTop: insets.top, paddingBottom: insets.bottom + SPACING.lg }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={28} color="white" />
                        </TouchableOpacity>
                        <View style={styles.progressContainer}>
                            <Text style={styles.progressText}>{currentIndex + 1} / {sortedClips.length}</Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        {currentClip && (
                            <View style={styles.dateBadge}>
                                <Ionicons name="calendar-outline" size={16} color="white" />
                                <Text style={styles.dateText}>{formatDate(currentClip.date)}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    video: {
        width: width,
        height: height,
        position: 'absolute',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    progressContainer: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    progressText: {
        color: 'white',
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
    },
    footer: {
        padding: SPACING.lg,
        alignItems: 'center',
    },
    dateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
    },
    dateText: {
        color: 'white',
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
    },
});
