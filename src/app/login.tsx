import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, NotoKufiArabic } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!usernameOrEmail.trim()) {
      setErrorMessage('برجاء إدخال اسم المستخدم أو البريد الإلكتروني');
      return;
    }
    if (!password) {
      setErrorMessage('برجاء إدخال كلمة المرور');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await login(usernameOrEmail.trim(), password);
    } catch (e: any) {
      console.error('Login error:', e);
      setErrorMessage(e.message || 'فشل تسجيل الدخول. برجاء التحقق من صحة البيانات.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={[styles.logoBadge, { backgroundColor: colors.accent + '15' }]}>
              <Ionicons name="shield-checkmark" size={48} color={colors.accent} />
            </View>
            <Text style={[styles.title, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
              Cyrus CRM
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: NotoKufiArabic.regular }]}>
              قم بتسجيل الدخول لإدارة المكالمات والعملاء والمزامنة
            </Text>
          </View>

          {/* Form Container */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.backgroundElement, borderColor: colors.border },
              scheme === 'dark' && { borderWidth: 1 },
            ]}>
            <Text style={[styles.cardTitle, { color: colors.text, fontFamily: NotoKufiArabic.bold }]}>
              تسجيل الدخول
            </Text>

            {/* Error Banner */}
            {errorMessage ? (
              <View style={[styles.errorBanner, { backgroundColor: colors.danger + '15' }]}>
                <Ionicons name="alert-circle" size={20} color={colors.danger} />
                <Text style={[styles.errorText, { color: colors.danger, fontFamily: NotoKufiArabic.medium }]}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Username/Email Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text, fontFamily: NotoKufiArabic.semiBold }]}>
                اسم المستخدم أو البريد الإلكتروني
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}>
                <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text, fontFamily: NotoKufiArabic.regular }]}
                  placeholder="مثال: email@cyrustecheg.com"
                  placeholderTextColor={colors.textSecondary + '80'}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={usernameOrEmail}
                  onChangeText={setUsernameOrEmail}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text, fontFamily: NotoKufiArabic.semiBold }]}>
                كلمة المرور
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.input, { color: colors.text, fontFamily: NotoKufiArabic.regular }]}
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor={colors.textSecondary + '80'}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: colors.accent },
                loading && { opacity: 0.7 },
              ]}
              onPress={handleLogin}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.buttonText, { fontFamily: NotoKufiArabic.bold }]}>
                  تسجيل الدخول
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'center',
    flexGrow: 1,
    gap: 24,
  },
  brandContainer: {
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    gap: 18,
  },
  cardTitle: {
    fontSize: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
  },
  inputGroup: {
    gap: 6,
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  button: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});
