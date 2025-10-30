import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Auth0 from 'react-native-auth0';
import {auth0Config} from '../../auth0-configuration';

const auth0 = new Auth0(auth0Config);

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      
      // 明确指定 redirectUrl，根据平台选择
      const bundleId = 'org.reactjs.native.example.carevoiceosrnsso';
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';
      const redirectUri = `${bundleId}://${auth0Config.domain}/${platform}/${bundleId}/callback`;
      
      console.log('Platform:', Platform.OS);
      console.log('Starting Auth0 login with redirectUrl:', redirectUri);
      console.log('Auth0 Config:', auth0Config);
      
      // 构建认证参数 - 支持SSO
      const authParams = {
        scope: 'openid profile email',
        redirectUrl: redirectUri,
        // 移除 prompt: 'login' 以支持SSO
        // 如果Auth0 session存在，会静默登录；如果不存在，会显示登录页面
      };

      console.log('Auth params:', authParams);
      console.log('Expected callback URL:', redirectUri);
      
      // 为了支持SSO，我们需要适当的配置
      // 不使用ephemeralSession，但需要提供一些基本配置
      const authOptions = Platform.OS === 'ios' ? {
        // iOS配置：不使用ephemeralSession以支持SSO
        safariViewControllerPresentationStyle: 0 // 使用默认样式
      } : {};
      
      console.log('Auth options:', authOptions);
      
      const credentials = await auth0.webAuth.authorize(authParams, authOptions);

      if (credentials) {
        console.log('Login successful:', credentials);
        // 登录成功，跳转到主页
        navigation.replace('Home', {credentials});
      }
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      if (error.error !== 'a0.session.user_cancelled') {
        let errorMessage = 'Login failed, please try again';
        
        // Check for network errors
        if (error.message && error.message.includes('network connection')) {
          errorMessage = 'Network connection failed, please check your network settings and try again';
        } else if (error.error === 'network_error') {
          errorMessage = 'Network connection failed, please check your network settings and try again';
        } else if (error.message && error.message.includes('Callback URL mismatch')) {
          errorMessage = 'Authentication configuration error, please contact technical support';
        }
        
        Alert.alert('Login Failed', errorMessage, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: () => handleLogin() }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Client SSO App</Text>
        <Text style={styles.subtitle}>Please login to continue</Text>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login / Register</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7BF6',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 50,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#2E7BF6',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 24,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#2E7BF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LoginScreen;
