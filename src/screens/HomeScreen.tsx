import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
} from 'react-native';
import Auth0 from 'react-native-auth0';
import {auth0Config} from '../../auth0-configuration';

const auth0 = new Auth0(auth0Config);

interface HomeScreenProps {
  route: any;
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({route, navigation}) => {
  const {credentials} = route.params || {};
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (credentials?.accessToken) {
      getUserInfo(credentials.accessToken);
    }
  }, [credentials]);

  const getUserInfo = async (accessToken: string) => {
    try {
      const user = await auth0.auth.userInfo({token: accessToken});
      setUserInfo(user);
    } catch (error) {
      console.error('Get user info error:', error);
    }
  };

  const handleSSOToAppB = async () => {
    if (!credentials?.accessToken) {
      Alert.alert('Error', 'Access token not found');
      return;
    }

    try {
      // 使用 Deep Link 跳转到 APP B，并传递 access token
      const deepLink = `carevoiceosdemo://sso?token=${encodeURIComponent(
        credentials.accessToken,
      )}&idToken=${encodeURIComponent(credentials.idToken || '')}`;

      console.log('Attempting to open:', deepLink);
      const canOpen = await Linking.canOpenURL(deepLink);
      if (canOpen) {
        await Linking.openURL(deepLink);
      } else {
        Alert.alert('Error', 'Cannot open APP B, please make sure it is installed');
      }
    } catch (error: any) {
      console.error('SSO error:', error);
      Alert.alert('Error', error.message || 'Navigation failed');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Confirm',
        onPress: () => {
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Client SSO</Text>
        <Text style={styles.headerSubtitle}>Health</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
              <Text style={styles.heartIcon}>♥</Text>
            </View>
            <Text style={styles.cardTitle}>Discover Health Wellness</Text>
          </View>
          
          <Text style={styles.cardDescription}>
            Your personalized health & wellness journey starts here. Unlock exclusive features!
          </Text>
          
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleSSOToAppB}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>⚡</Text>
              <Text style={styles.buttonText}>Get Started</Text>
            </View>
          </TouchableOpacity>
        </View>

        {userInfo && (
          <View style={styles.userInfoCard}>
            <Text style={styles.userInfoTitle}>Login Information</Text>
            <Text style={styles.userInfoText}>User: {userInfo.name || userInfo.email}</Text>
            <Text style={styles.userInfoEmail}>{userInfo.email}</Text>
          </View>
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  header: {
    backgroundColor: '#2E7BF6',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#2E7BF6',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  heartIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 24,
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#2E7BF6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7BF6',
  },
  userInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  userInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userInfoEmail: {
    fontSize: 12,
    color: '#999',
  },
  bottomActions: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
