import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getDeeplink} from '../services/api';

interface HomeScreenProps {
  route: any;
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({route, navigation}) => {
  const {user} = route.params || {};
  const [userInfo, setUserInfo] = useState<any>(user);
  const [modalVisible, setModalVisible] = useState(false);
  const [deeplink, setDeeplink] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 如果route.params中没有用户信息,从AsyncStorage加载
    if (!userInfo) {
      loadUserInfo();
    }
  }, []);

  const loadUserInfo = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const email = await AsyncStorage.getItem('userEmail');
      const name = await AsyncStorage.getItem('userName');
      
      if (userId && email) {
        setUserInfo({id: userId, email, name});
      }
    } catch (error) {
      console.error('Load user info error:', error);
    }
  };

  const handleGetStarted = async () => {
    if (!userInfo?.id) {
      Alert.alert('Error', 'User information not found');
      return;
    }

    try {
      setLoading(true);
      console.log('Getting deeplink for user:', userInfo.id);

      const response = await getDeeplink(userInfo.id);

      if (response.success) {
        console.log('Deeplink generated:', response.data.deeplink);
        console.log('Authorization code:', response.data.authorizationCode);
        setDeeplink(response.data.deeplink);
        setAuthCode(response.data.authorizationCode);
        setModalVisible(true);
      }
    } catch (error: any) {
      console.error('Get deeplink error:', error);
      
      let errorMessage = 'Failed to generate deeplink';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            // 清除所有存储的token和用户信息
            await AsyncStorage.multiRemove([
              'authToken',
              'userId',
              'userEmail',
              'userName',
            ]);
            
            console.log('Logout successful, navigating to login');
            navigation.replace('Login');
          } catch (error) {
            console.error('Logout error:', error);
            navigation.replace('Login');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Client SSO App (APP A)</Text>
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
            Your personalized health & wellness journey starts here. Unlock
            exclusive features!
          </Text>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            disabled={loading}>
            <View style={styles.buttonContent}>
              {loading ? (
                <ActivityIndicator color="#2E7BF6" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonIcon}>⚡</Text>
                  <Text style={styles.buttonText}>Get Started</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {userInfo && (
          <View style={styles.userInfoCard}>
            <Text style={styles.userInfoTitle}>Login Information</Text>
            <Text style={styles.userInfoText}>
              User: {userInfo.name || userInfo.email}
            </Text>
            <Text style={styles.userInfoEmail}>{userInfo.email}</Text>
          </View>
        )}

        <View style={styles.bottomActions}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Deeplink Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>SSO Deeplink Generated</Text>
            <Text style={styles.modalSubtitle}>
              Authorization code for APP B (CareVoice)
            </Text>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Authorization Code:</Text>
              <TextInput
                style={styles.codeInput}
                value={authCode}
                editable={false}
                selectTextOnFocus
              />
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Deeplink URL:</Text>
              <TextInput
                style={styles.deeplinkInput}
                value={deeplink}
                multiline
                numberOfLines={4}
                editable={false}
                selectTextOnFocus
              />
            </View>

            <View style={styles.noteSection}>
              <Text style={styles.noteTitle}>📝 How it works:</Text>
              <Text style={styles.noteText}>
                1. APP A generates authorization code{'\n'}
                2. APP B receives code via deeplink{'\n'}
                3. APP B backend exchanges code for tokens{'\n'}
                4. Tokens used to access CareVoice services
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={async () => {
                  try {
                    console.log('Opening deeplink:', deeplink);
                    
                    // 检查是否可以打开deeplink
                    const canOpen = await Linking.canOpenURL(deeplink);
                    
                    if (canOpen) {
                      await Linking.openURL(deeplink);
                      setModalVisible(false);
                    } else {
                      Alert.alert(
                        'Cannot Open APP B',
                        'APP B (CareVoice Demo) is not installed or deeplink scheme is not supported.\n\nDeeplink: ' + deeplink,
                        [
                          {text: 'OK'},
                        ]
                      );
                    }
                  } catch (error: any) {
                    console.error('Open deeplink error:', error);
                    Alert.alert('Error', error.message || 'Failed to open APP B');
                  }
                }}>
                <Text style={styles.modalButtonText}>Click to Open APP B</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    minHeight: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7BF6',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  codeInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: '#333',
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  deeplinkInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 11,
    color: '#333',
    fontFamily: 'monospace',
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  noteSection: {
    backgroundColor: '#E8F4FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7BF6',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    backgroundColor: '#2E7BF6',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;

