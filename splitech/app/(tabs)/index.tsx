import { Image, StyleSheet, Button, Platform } from 'react-native';
import {initializeApp, getApps, getApp} from 'firebase/app';
import {getDatabase, ref, onValue, set} from 'firebase/database';
import { firebaseConfig } from '../../firebaseConfig';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

if (!getApps().length) {
    initializeApp(firebaseConfig);
}

export default function HomeScreen() {

  const writeRandomData = () => {
    const app = getApp()
    const database = getDatabase(app);
    const dbRef = ref(database, `users/123`);
    set(dbRef,{
      name: 'Ada Lovelace',
      age: 31,
    })
    .then(() => console.log('Data set.'));
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({ ios: 'cmd + d', android: 'cmd + m' })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Button title="Write Random Data" onPress={writeRandomData} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 10,
  },
  card_container: {
    backgroundColor: '#fff',
    marginBottom: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderRadius: 25,
  },

  cardTittleContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderRadius: 25,
  },
  cardButtonContainer: {
    backgroundColor: '#fff',
    paddingRight: 0,
    paddingLeft: 0,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderRadius: 8,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25

  },
  crownIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 5,
  },
  title: {
    fontSize: 26,
    marginTop: 5,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardButtons: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

function shareLink(url: string): void {
  Share.share({
    title: 'Check out this link',
    message: `Check out this link: ${url}`,
  }).catch((error) => console.log('Error sharing link:', error));
}

//TODO IMPLEMENT REMOVE GROUP
function removeGroup(groupId: string): void {
  Alert.alert(
    'Remove Group',
    'Are you sure you want to remove this group?',
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Remove',
        onPress: () => {
          // Logic to remove the group
          console.log(`Group with ID ${groupId} removed`);
          // You can update the state or perform any other necessary actions here
        },
        style: 'destructive',
      },
    ],
    { cancelable: true }
  );
}

//TODO IMPLEMENT ADD GROUP
function addGroup(): void {
  alert('Add Group');
}
