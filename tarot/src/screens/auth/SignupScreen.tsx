import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Alert
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

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;

const SignupScreen = () => {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const { signInWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    let isValid = true;
    const newErrors: {
      name?: string;
      phoneNumber?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
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
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = () => {
    if (validateForm()) {
      setLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('Home', {
          user: {
            displayName: name,
            email: `${phoneNumber}@example.com`,
            photoURL: null,
            uid: 'phone-signup-uid',
            phoneNumber: phoneNumber
          }
        });
      }, 1500);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true);
      const response = await signInWithGoogle();
      console.log("Google signup successful:", response?.user?.displayName);
      navigation.navigate('Home', {
        // Pass undefined as user to use AuthContext's user state instead
        user: undefined 
      });
    } catch (error) {
      console.log("Google signup error:", error);
      // Thông báo lỗi đã được xử lý trong AuthContext
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Layout
      title="Create Account"
      showBackButton={true}
      scrollable={true}
    >
      <Text style={styles.subtitle}>Sign up to get started</Text>

      <View style={styles.form}>
        <CustomInput
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          error={errors.name}
          leftIcon="person"
          autoCapitalize="words"
        />
        
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
          placeholder="Create a password"
          secureTextEntry
          isPassword
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          leftIcon="lock"
        />
        
        <CustomInput
          label="Confirm Password"
          placeholder="Confirm your password"
          secureTextEntry
          isPassword
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
          leftIcon="lock"
        />
        
        <CustomButton
          title="Sign Up"
          onPress={handleSignup}
          loading={loading}
          style={styles.signupButton}
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
          onPress={handleGoogleSignup}
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
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
};

// styles remain the same
const styles = StyleSheet.create({
  subtitle: {
    ...FONTS.body3,
    color: COLORS.gray,
    marginTop: 5,
    marginBottom: 20,
  },
  form: {
    width: '100%',
    marginBottom: 20,
  },
  signupButton: {
    marginTop: 20,
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
  loginText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: 5,
    ...FONTS.body4,
  },
});

export default SignupScreen;