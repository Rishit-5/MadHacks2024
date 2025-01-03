import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, Text, View, Image, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, get, set } from 'firebase/database';
import { firebaseConfig } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encodeEmail } from './utils';


if (!getApps().length) {
  initializeApp(firebaseConfig);
}

// Auth0 Configuration
const AUTH0_DOMAIN = 'dev-2l54u7lu3bidibfm.us.auth0.com';
const AUTH0_CLIENT_ID = 'UqYXERixdhnqf7XeqK87KHq18ANY3Aqm';

const redirectUri = AuthSession.makeRedirectUri({ useProxy: Platform.OS !== 'web' });
const discovery = {
  authorizationEndpoint: `https://${AUTH0_DOMAIN}/authorize`,
  tokenEndpoint: `https://${AUTH0_DOMAIN}/oauth/token`,
};
  
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Invalid token format', error);
    return null;
  }
}


const Home = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasHandledResponse, setHasHandledResponse] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: AUTH0_CLIENT_ID,
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      extraParams: {
        nonce: 'nonce',
      },
    },
    discovery
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleAuth = async () => {
        const hash = window.location.hash;
        const idTokenMatch = hash.match(/id_token=([^&]+)/);
        if (idTokenMatch) {
          const idToken = idTokenMatch[1];
          const decoded = decodeJWT(idToken);
          if (decoded) {
            setUserInfo(decoded);
            await AsyncStorage.setItem('authToken', idToken);
            await AsyncStorage.setItem('email', decoded.email);
            setLoggedOut(false);
            const db = getDatabase();
            const encodedEmail = encodeEmail(decoded.email);
            const userRef = ref(db, `Users/${encodedEmail}`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
              const userData = snapshot.val();
              await AsyncStorage.setItem('name', userData.name);
              await AsyncStorage.setItem('pfpId', userData.pfpId || 'image_part_001.jpg'); // Default to '1' if pfpId is not set
              navigation.replace('Dashboard');
            } else {
              window.history.replaceState(null, '', window.location.pathname);
              navigation.replace('Name');
            }
            // const app = getApp();
            // const database = getDatabase(app);
            // const userRef = ref(database, `Users/${userInfo}`);

            // const app = getApp()
            // const database = getDatabase(app);
            // const dbRef = ref(database, `Users/`);
            // set(dbRef,{
            //   name: 'Ada Lovelace',
            //   age: 31,
            // }).then(() => console.log('Data set.'));

          }
        }
      };

      handleAuth();
    }
  }, [navigation]);

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === 'success' && !hasHandledResponse && !loggedOut) {
        setHasHandledResponse(true);
        const { id_token } = response.params;
        const decoded = decodeJWT(id_token);
        if (decoded) {
          setUserInfo(decoded);
          await AsyncStorage.setItem('authToken', id_token);
          await AsyncStorage.setItem('email', decoded.email);
          setLoggedOut(false);
          const db = getDatabase();
          const encodedEmail = encodeEmail(decoded.email);
          const userRef = ref(db, `Users/${encodedEmail}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const userData = snapshot.val();
            await AsyncStorage.setItem('name', userData.name);
            await AsyncStorage.setItem('pfpId', userData.pfpId || 'image_part_001.jpg'); // Default to '1' if pfpId is not set
            navigation.replace('Dashboard');
          } else {
            navigation.replace('Name');
          }
        }
      } else if (response?.type === 'error') {
        Alert.alert('Authentication error', response.error?.message || 'An error occurred');
      }
    };

    handleResponse();
  }, [response, hasHandledResponse, loggedOut, navigation]);

  const onLogin = async () => {
    if (!userInfo) {
      setIsLoading(true);
      try {
        setHasHandledResponse(false);
        setLoggedOut(false);
        if (Platform.OS === 'web') {
          const authUrl = `${discovery.authorizationEndpoint}?` +
            `client_id=${encodeURIComponent(AUTH0_CLIENT_ID)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=id_token` +
            `&scope=${encodeURIComponent('openid profile email')}` +
            `&nonce=${encodeURIComponent('nonce')}`;
          window.location.assign(authUrl);
        } else {
          await promptAsync({ useProxy: false });
        }
      } catch (error) {
        console.error('Login error', error);
        Alert.alert('Login error', error.message || 'An error occurred during login');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const onLogout = async () => {
    setUserInfo(null);
    await AsyncStorage.removeItem('authToken');
    setHasHandledResponse(false);
    setLoggedOut(true);
    Alert.alert('Logged out');
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/images/splitech_logo_transparent.png')} style={styles.logo} />
      <Text style={styles.header}>Welcome to Splitech!</Text>

      {isLoading && <ActivityIndicator size="large" color="#2D9CDB" />}
      {userInfo ? (
        <>
          <Text style={styles.userText}>Logged in as {userInfo.name}</Text>
          <Text style={styles.userText}>Email: {userInfo.email}</Text>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={onLogout}>
            <Text style={styles.buttonText}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={() => {navigation.navigate('Dashboard')}}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.button}
            onPress={onLogin}
            disabled={!request && Platform.OS !== 'web'}
          >
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    marginBottom: 20,
    marginTop: -50,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F4A442',
    marginBottom: 10,
    marginTop: 120,
  },
  userText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#f4c542',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: 300,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#EB5757',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
