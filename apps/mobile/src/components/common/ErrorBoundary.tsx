import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // TODO: Send to error tracking service (e.g., Sentry)
        // Sentry.captureException(error, { extra: errorInfo });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Text style={styles.title}>Oops! Something went wrong</Text>
                        <Text style={styles.message}>
                            We encountered an unexpected error. Please try again.
                        </Text>
                        {__DEV__ && this.state.error && (
                            <View style={styles.errorDetails}>
                                <Text style={styles.errorText}>
                                    {this.state.error.toString()}
                                </Text>
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={this.handleReset}
                        >
                            <Text style={styles.buttonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        maxWidth: 400,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#a0a0a0',
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 24,
    },
    errorDetails: {
        backgroundColor: '#2a2a3e',
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
        width: '100%',
    },
    errorText: {
        fontSize: 12,
        color: '#ff6b6b',
        fontFamily: 'monospace',
    },
    button: {
        backgroundColor: '#00d9ff',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: '#1a1a2e',
        fontSize: 16,
        fontWeight: '600',
    },
});
