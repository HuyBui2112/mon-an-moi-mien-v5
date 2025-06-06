import React from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Input, Button, Typography } from '../../../components/shared';
import { useTheme } from '../../../theme/ThemeContext';
import { Logo } from './Logo';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  isRegistering: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  errors: any;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onConfirmPasswordChange: (text: string) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
  onToggleAuthMode: () => void;
  isLoading?: boolean;
  displayName: string;
  onDisplayNameChange: (text: string) => void;
  isSubmitting?: boolean;
}

export const AuthForm = ({
  isRegistering,
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  errors,
  fadeAnim,
  slideAnim,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onSubmit,
  onForgotPassword,
  onToggleAuthMode,
  isLoading,
  displayName,
  onDisplayNameChange,
  isSubmitting,
}: Props) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoContainer,
          {
            backgroundColor: theme.colors.background.default,
            paddingBottom: 0,
            paddingTop: 0,
          },
        ]}
      >
        <Logo />
      </View>

      <View
        style={[
          styles.formWrapper,
          {
            backgroundColor: theme.colors.background.paper,
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            paddingTop: theme.spacing.sm,
            paddingHorizontal: theme.spacing.lg,
            flex: 1,
            ...theme.shadows.lg,
            minHeight: '100%',
            paddingBottom: theme.spacing.xl * 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -30],
                  }),
                },
              ],
            },
          ]}
        >
          <Typography
            variant="h2"
            style={[
              styles.title,
              {
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.sm,
                marginTop: theme.spacing.md,
              },
            ]}
          >
            {isRegistering ? 'Tạo tài khoản mới' : 'Chào mừng trở lại!'}
          </Typography>

          {isRegistering && (
            <Input
              label="Tên hiển thị"
              value={displayName}
              onChangeText={onDisplayNameChange}
              leftIcon="person-outline"
              error={errors.displayName}
              placeholder="Nhập tên hiển thị của bạn"
              containerStyle={styles.input}
            />
          )}

          <Input
            label="Email"
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email}
            placeholder="Nhập email của bạn"
            containerStyle={styles.input}
          />

          <Input
            label="Mật khẩu"
            value={password}
            onChangeText={onPasswordChange}
            secureTextEntry={!showPassword}
            leftIcon="lock-closed-outline"
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={onTogglePassword}
            error={errors.password}
            placeholder="Nhập mật khẩu"
            containerStyle={styles.input}
          />

          {isRegistering && (
            <Input
              label="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={onConfirmPasswordChange}
              secureTextEntry={!showConfirmPassword}
              leftIcon="lock-closed-outline"
              rightIcon={
                showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
              }
              onRightIconPress={onToggleConfirmPassword}
              error={errors.confirmPassword}
              placeholder="Nhập lại mật khẩu"
              containerStyle={styles.input}
            />
          )}

          <Button
            variant="primary"
            onPress={onSubmit}
            disabled={isSubmitting}
            style={[
              styles.submitButton,
              {
                backgroundColor: theme.colors.primary.main,
                width: '80%',
                alignSelf: 'center',
              },
            ]}
            icon={isRegistering ? 'person-add-outline' : 'log-in-outline'}
          >
            {isSubmitting ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary.contrast}
              />
            ) : isRegistering ? (
              'Đăng ký'
            ) : (
              'Đăng nhập'
            )}
          </Button>

          {!isRegistering && (
            <Button
              variant="text"
              onPress={onForgotPassword}
              style={styles.forgotPassword}
              icon="key-outline"
            >
              Quên mật khẩu?
            </Button>
          )}

          <View style={styles.divider}>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.divider },
              ]}
            />
            <Typography
              variant="caption"
              style={[
                styles.dividerText,
                { color: theme.colors.text.secondary },
              ]}
            >
              HOẶC
            </Typography>
            <View
              style={[
                styles.dividerLine,
                { backgroundColor: theme.colors.divider },
              ]}
            />
          </View>

          <Button
            variant="text"
            onPress={onToggleAuthMode}
            style={[
              styles.switchButton,
              {
                marginTop: theme.spacing.sm,
                backgroundColor: 'transparent',
              },
            ]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            textStyle={{
              color: theme.colors.primary.main,
              fontSize: 14,
              textDecorationLine: 'underline',
            }}
            icon={isRegistering ? 'log-in-outline' : 'person-add-outline'}
          >
            {isRegistering
              ? 'Đã có tài khoản? Đăng nhập ngay'
              : 'Chưa có tài khoản? Đăng ký ngay'}
          </Button>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 0,
  },
  formWrapper: {
    width: '100%',
    position: 'relative',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  submitButton: {
    height: 44,
    borderRadius: 22,
    marginTop: 16,
  },
  submitButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  submitButtonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  forgotPassword: {
    marginTop: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
  },
  switchButton: {
    marginTop: 8,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
