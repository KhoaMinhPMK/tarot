import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { COLORS, FONTS } from '../../styles/globalStyles';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import SocialButton from '../../components/common/SocialButton';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Layout from '../../components/common/Layout';
import { useAuth } from '../../context/AuthContext';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signInWithGoogle } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{phoneNumber?: string; password?: string}>({});

  const validateForm = () => {
    let isValid = true;
    const newErrors: {phoneNumber?: string; password?: string} = {};
    
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!/^[0-9]{10}$/.test(phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
      isValid = false;
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = () => {
    if (validateForm()) {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('Home', {
          user: {
            displayName: 'User via Phone',
            email: `${phoneNumber}@example.com`,
            photoURL: null,
            uid: 'phone-auth-uid',
            phoneNumber: phoneNumber
          }
        });
      }, 1500);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      const response = await signInWithGoogle();
      console.log("Google login successful:", response?.user?.displayName);
      navigation.navigate('Home', {
        // Pass undefined as user to use AuthContext's user state instead
        user: undefined 
      });
    } catch (error) {
      console.log("Google login error:", error);
      // Thông báo lỗi đã được xử lý trong AuthContext
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Layout
      showHeader={false}
      scrollable={true}
    >
      <View style={styles.header}>
        <Icon name="auto-awesome" size={40} color={COLORS.primary} />
        <Text style={styles.title}>Welcome to Tarot</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>

      <View style={styles.form}>
        <CustomInput
          label="Phone Number"
          placeholder="Enter your phone number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          error={errors.phoneNumber}
          leftIcon="phone"
          maxLength={10}
        />
        
        <CustomInput
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          isPassword
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          leftIcon="lock"
        />
        
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <CustomButton
          title="Login"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginButton}
        />
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtons}>
        <SocialButton
          title="Continue with Google"
          iconName="google"
          iconColor="#DB4437"
          onPress={handleGoogleLogin}
          type="google"
          style={styles.socialButton}
          loading={googleLoading}
        />
        
        <SocialButton
          title="Continue with Facebook"
          iconName="facebook"
          onPress={() => {}}
          type="facebook"
          style={styles.socialButton}
        />
        
        <SocialButton
          title="Continue with Apple"
          iconName="apple"
          onPress={() => {}}
          type="apple"
          style={styles.socialButton}
        />
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.black,
    marginTop: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginTop: 10,
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    ...FONTS.body4,
  },
  loginButton: {
    marginTop: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGray,
  },
  dividerText: {
    paddingHorizontal: 15,
    color: COLORS.gray,
    ...FONTS.body4,
  },
  socialButtons: {
    width: '100%',
    marginBottom: 20,
  },
  socialButton: {
    marginVertical: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  footerText: {
    color: COLORS.darkGray,
    ...FONTS.body4,
  },
  signupText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 5,
    ...FONTS.body4,
  },
});

export default LoginScreen;