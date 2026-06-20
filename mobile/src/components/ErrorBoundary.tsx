import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { brandColors, spacing } from '../design/tokens';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <Pressable style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: '#F7F7FC',
  },
  title: {
    fontFamily: 'PlusJakartaSans-700Bold',
    fontSize: 20,
    color: '#1C1C2E',
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: 'PlusJakartaSans-400Regular',
    fontSize: 14,
    color: '#8B8FA8',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  button: {
    backgroundColor: brandColors.brandNavy,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
