import React, { createContext, useState, useContext, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Alert } from 'react-native';

// Define interface for Google Sign-In Response
interface GoogleSignInResponse {
  type?: string;
  data?: {
    idToken?: string;
    serverAuthCode?: string;
    scopes?: string[];
    user?: {
      id: string;
      name: string | null;
      email: string;
      photo: string | null;
      familyName: string | null;
      givenName: string | null;
    };
  };
  idToken?: string; // Fallback for older versions
}

// Định nghĩa kiểu dữ liệu cho AuthContext
interface AuthContextData {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<FirebaseAuthTypes.UserCredential | undefined>;
  signOut: () => Promise<void>;
}

// Khởi tạo context với giá trị mặc định
const AuthContext = createContext<AuthContextData>({
  user: null,
  loading: true,
  signInWithGoogle: async () => undefined,
  signOut: async () => {},
});

// Custom hook để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component bao bọc ứng dụng và cung cấp AuthContext
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo Google Sign-In
  useEffect(() => {
    // Lấy webClientId từ file google-services.json (client_type: 3)
    GoogleSignin.configure({
      webClientId: '38649926622-sg13uvcvl3hkubn2m1f9k3jl3mn3dvlh.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  // Lắng nghe trạng thái xác thực
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup function khi component unmount
    return unsubscribe;
  }, []);

  // Đăng nhập với Google
  const signInWithGoogle = async (): Promise<FirebaseAuthTypes.UserCredential | undefined> => {
    try {
      // Kiểm tra Play Services có sẵn
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Bắt đầu quá trình đăng nhập
      const signInResult = await GoogleSignin.signIn() as GoogleSignInResponse;
      
      console.log('Google Sign-In Result:', JSON.stringify(signInResult));
      
      // Lấy idToken từ kết quả đăng nhập theo cấu trúc mới
      let idToken: string | undefined;
      
      if (signInResult?.data?.idToken) {
        // Cấu trúc mới: { type: "success", data: { idToken: "..." } }
        idToken = signInResult.data.idToken;
      } else if (signInResult?.idToken) {
        // Cấu trúc cũ (fallback): { idToken: "..." }
        idToken = signInResult.idToken;
      }
      
      if (!idToken) {
        console.error('Failed to get idToken from Google Sign-In result:', signInResult);
        throw new Error('Không thể lấy ID token từ Google');
      }
      
      console.log('Successfully got idToken:', idToken.substring(0, 10) + '...');
      
      // Tạo credential Google với token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      // Đăng nhập người dùng với credential
      return await auth().signInWithCredential(googleCredential);
    } catch (error: any) {
      console.log('Detailed Google Sign-In Error:', JSON.stringify(error));
      
      // Xử lý lỗi một cách an toàn
      let errorMessage = 'Đã xảy ra lỗi khi đăng nhập với Google';
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Đăng nhập bị hủy';
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Đang trong quá trình đăng nhập';
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Google Play Services không khả dụng';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Lỗi đăng nhập Google', errorMessage);
      return undefined;
    }
  };

  // Đăng xuất
  const signOut = async () => {
    try {
      // Thử đăng xuất khỏi Google
      try {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      } catch (error) {
        console.log('Google sign-out error (can be ignored):', error);
      }
      
      // Đăng xuất khỏi Firebase
      await auth().signOut();
    } catch (error: any) {
      console.error("Sign-out Error:", error);
      Alert.alert('Lỗi đăng xuất', 'Không thể đăng xuất. Vui lòng thử lại.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};