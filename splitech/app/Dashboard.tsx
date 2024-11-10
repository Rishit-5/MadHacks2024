// Dashboard.js
import React, {useEffect, useState} from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, TouchableOpacity, Alert, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Link from 'react-native-vector-icons/AntDesign';
import Remove from 'react-native-vector-icons/FontAwesome';
import { Swipeable } from 'react-native-gesture-handler';
import { Share } from 'react-native';
import { getDatabase, ref, get, set } from 'firebase/database';
import { encodeEmail } from './utils';
import * as Linking from 'expo-linking';

const URL_HOST = 'exp://192.168.1.188:8081';


const data = [
  {id: 1, title: 'Card 1', owner: true },
  {id: 2, title: 'Card 2', owner: false },
  {id: 3, title: 'Card 3', owner: true },
  {id: 4, title: 'Card 4', owner: false },
];



const loadUserGroups = async () => {
  try {
    const email = await AsyncStorage.getItem('email');
    if (!email) {
      console.error('No email found in AsyncStorage');
      return [];
    }

    const encodedEmail = encodeEmail(email);
    const db = getDatabase();
    const userRef = ref(db, `Users/${encodedEmail}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      return userData.Groups || [];
    } else {
      console.error('User not found in database');
      return [];
    }
  } catch (error) {
    console.error('Error loading user groups:', error);
    return [];
  }
};

// Group management functions
function shareLink(url) {
  Share.share({
    title: 'Check out this link',
    message: `Check out this link: ${url}`,
  }).catch((error) => console.log('Error sharing link:', error));
}



function removeGroup(groupId) {
  Alert.alert(
    'Remove Group',
    'Are you sure you want to remove this group?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        onPress: () => {
          console.log(`Group with ID ${groupId} removed`);
        },
        style: 'destructive',
      },
    ],
    { cancelable: true }
  );
}

const dbAdd = async (group) => {
  const db = getDatabase();
  set(ref(db, `Groups/${group}`), {
    Owner: encodeEmail(await AsyncStorage.getItem('email')),
    AuthenticatedUsers: ["Email 1", "Email 2", "Email 3"],
    Guests: {
      1828283892: {
        Name: "Guest 1",
        Email: "blah@gmail.com"
      },
      9329849904: {
        Name: "Guest 2",
      },
      8924857428: {
        Name: "Guest 3",
        Email: "blah2@outlook.com"
      }
    }
  }).then(r => console.log('Data set.'));
}

// Card Component
const Card = ({ title, owner, onPress, onSwipeOpen }) => {
  const renderLeftActions = () => (
    <View style={styles.leftActionContainer}>
      <Pressable style={[styles.cardButtons, styles.editButton]} onPress={() => shareLink(`${URL_HOST}?invite?${title}`)}>
        <Link name="link" size={40} color="#fff" />
      </Pressable>
      <Pressable style={[styles.cardButtons, styles.deleteButton]} onPress={() => removeGroup('EXAMPLE_GROUP_ID')}>
        <Remove name="remove" size={40} color="#fff" />
      </Pressable>
    </View>
  );

  return (
    <Swipeable renderLeftActions={renderLeftActions} onSwipeableOpen={onSwipeOpen}>
      <Pressable onPress={onPress} style={styles.cardContainer}>
        {owner && <Icon name="crown" size={20} color="gold" style={styles.crownIcon} />}
        <Text style={styles.title}>{title}</Text>
      </Pressable>
    </Swipeable>
  );
};

// Dashboard Component
const Dashboard = ({ route, navigation }) => {
  const [groups, setGroups] = useState([]);

  const [groupInvite, setGroupInvite] = useState<string | null>(null);


  const url = Linking.useURL();
  useEffect(() => {
    const setUrl = async () => {
      let isVirgin = false;
      const currentUrl = await AsyncStorage.getItem('url');
      if (!currentUrl && url) {
          isVirgin = true;
      }
      else if (currentUrl && url && currentUrl !== url) {
        isVirgin = true;
      }
      if(isVirgin && url && url.toString().includes('?')){
        setGroupInvite(url.toString().split("?")[1] == 'invite' ? url.toString() : null);
        await AsyncStorage.setItem('url', url?.toString()? url.toString() : '');
      }
    }
    if (!groupInvite) {
      setUrl();
    }
  }, [url]);

  

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const email = await AsyncStorage.getItem('email');
        if (!email) {
          console.error('No email found in AsyncStorage');
          return;
        }
        const encodedEmail = encodeEmail(email);
        const db = getDatabase();
        const groupsRef = ref(db, 'Groups');
        const usersRef = ref(db, `Users/${encodedEmail}`);
        const snapshot = await get(groupsRef);
        const usersSnapshot = await get(usersRef);
        console.log(usersSnapshot.val())
        if (usersSnapshot.exists()) {
          for (const group in usersSnapshot.val().Groups) {
            if (snapshot.exists()){
                const groupsData = snapshot.val();
                let groupData = [];
                for (const groupId in groupsData) {
                    const group = groupsData[groupId];
                    const isOwner = group.Owner === encodedEmail;
                    groupData.push({ title: groupId, owner: isOwner });
                }
                setGroups(groupData);
                console.log(groups);
            }
          }
        }
        //
        // if (snapshot.exists()) {
        //   const groupsData = snapshot.val();
        //   let groupData = [];
        //
        //   for (const groupId in groupsData) {
        //     const group = groupsData[groupId];
        //     const isOwner = group.Owner === encodedEmail;
        //     groupData.push({ title: groupId, owner: isOwner });
        //   }
        //
        //   setGroups(groupData);
        //   console.log(groups);
        // } else {
        //   console.error('No groups found in database');
        // }
      } catch (error) {
        console.error('Error loading groups:', error);
      }
    };

    fetchGroups();
  }, []);

  const onLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    navigation.replace('Home');
  };

  const handleCardPress = (groupName) => {
    navigation.navigate('GroupDetails', { groupName });
  };

  function addGroup() {
    navigation.navigate('CreateGroup');
  }

  const rejectInvitation = async (arg0: null) => {
    setGroupInvite(null);
    await AsyncStorage.setItem('virginLink', "false");
  };
  const aceptInvitation = async() => {
    const groupId = groupInvite?.split('?').pop();
    alert(`Accepted invitation to group ${groupId}`);
    setGroupInvite(null);
    await AsyncStorage.setItem('virginLink', "false");

    //TODO IMPLEMENT ACCEPT INVITATION
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subHeader}>Your Groups</Text>
      {groupInvite && (
        <View>
          <Text>Do You Want To Join //InviterName//'s Group {groupInvite?.split('?').pop()}</Text>
          <Button title="Join Group" onPress={() => aceptInvitation()} />
          <Button title="Decline" onPress={() => rejectInvitation(null)} />
        </View>
      )}
      <FlatList
        data={groups}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Card
            title={item.title}
            owner={item.owner}
            onPress={() => handleCardPress(item.title)}
            onSwipeOpen={() => console.log("Swipe opened for", item.title)}
          />
        )}
        contentContainerStyle={styles.listContainer}
      />
      <TouchableOpacity onPress={addGroup}>
        <Text style={styles.newGroupButton}>New Group</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  subHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
  },
  listContainer: {
    padding: 10,
  },
  cardContainer: {
    backgroundColor: '#fff',
    marginBottom: 20,
    padding: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  crownIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  title: {
    fontSize: 26,
    color: '#111827',
  },
  leftActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    overflow: 'hidden', // Ensures the rounded corners apply to swipe buttons
    marginBottom: 20,
  },
  cardButtons: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
  },
  newGroupButton: {
    textAlign: 'center',
    padding: 10,
    color: 'blue',
    fontSize: 18,
    marginTop: 10,
  },
});
