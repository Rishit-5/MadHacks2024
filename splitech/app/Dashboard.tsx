// Dashboard.js
import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, FlatList, Pressable, TouchableOpacity, Alert, Button} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Link from 'react-native-vector-icons/AntDesign';
import Remove from 'react-native-vector-icons/FontAwesome';
import {Swipeable} from 'react-native-gesture-handler';
import {Share} from 'react-native';
import {getDatabase, ref, get, set, remove} from 'firebase/database';
import {encodeEmail} from './utils';
import * as Linking from 'expo-linking';

const URL_HOST = 'https://webapp-woad-psi.vercel.app';


const data = [
  {id: 1, title: 'Card 1', owner: true },
  {id: 2, title: 'Card 2', owner: false },
  {id: 3, title: 'Card 3', owner: true },
  {id: 4, title: 'Card 4', owner: false },
];

const delimiteUrl = (input: string) => {
  const parts = input.split('?');
  
  // Check if we have at least two `?` symbols
  if (parts.length < 3) {
    console.log("The input doesn't contain enough '?' characters");
    return [];
  }
  
  // Get the three parts: before first `?`, between two `?`, and the rest
  const part1 = parts[0];
  const part2 = parts[1];
  const part3 = parts.slice(2).join("?");
  
  return [part1, part2, part3];
}



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

// Dashboard Component
const Dashboard = ({route, navigation}) => {


  const [groups, setGroups] = useState<{ title: string; owner: boolean }[]>([]);

// Group management functions
    function shareLink(url) {
        Share.share({
            title: 'Add People to Group',
            message: `Click this link to join my splitech group:\n ${url}`,
        }).catch((error) => console.log('Error sharing link:', error));
    }


    const removeGroup = async (groupName, owner) => {
            if (!owner) {
                console.error('Only the owner can remove the group');
                return;
            }

            const db = getDatabase();
            const groupRef = ref(db, `Groups/${groupName}`);
            const usersRef = ref(db, 'Users');

            try {
                // Remove the group from the Groups node
                await remove(groupRef);

                // Get all users
                const usersSnapshot = await get(usersRef);
                if (usersSnapshot.exists()) {
                    const usersData = usersSnapshot.val();

                    // Iterate through all users and remove the group from their list of groups
                    for (const userId in usersData) {
                        const userGroups = usersData[userId].Groups || [];
                        const updatedGroups = userGroups.filter(group => group !== groupName);

                        // Update the user's groups if the group was removed
                        if (updatedGroups.length !== userGroups.length) {
                            await set(ref(db, `Users/${userId}/Groups`), updatedGroups);
                        }
                    }
                    setGroups(prevGroups => prevGroups.filter(group => group.title !== groupName));
                }

                console.log(`Group ${groupName} removed successfully`);
            } catch (error) {
                console.error('Error removing group:', error);
            }
        }
    ;

// Card Component
    const Card = ({title, owner, onPress, onSwipeOpen}) => {
        const renderLeftActions = () => (
            <View style={styles.leftActionContainer}>
                <Pressable style={[styles.cardButtons, styles.editButton]} onPress={() => shareLink(`${URL_HOST}/${title.replaceAll(" ","%20")}`)}>
                  <Link name="link" size={40} color="#fff"/>
                </Pressable>
                {owner && (
                  <Pressable style={[styles.cardButtons, styles.deleteButton]} onPress={() => removeGroup(title, owner)}>
                    <Remove name="remove" size={40} color="#fff"/>
                  </Pressable>
                )}
            </View>
        );

        return (
            <Swipeable renderLeftActions={renderLeftActions} onSwipeableOpen={onSwipeOpen} overshootFriction={1000}>
                <Pressable onPress={onPress} style={styles.cardContainer}>
                    {owner && <Icon name="crown" size={20} color="gold" style={styles.crownIcon}/>}
                    <Text style={styles.title}>{title}</Text>
                </Pressable>
            </Swipeable>
        );
    };
    const [groupInvite, setGroupInvite] = useState<string | null>(null);


    const url = Linking.useURL();
    useEffect(() => {
        const setUrl = async () => {
            let isVirgin = false;
            const currentUrl = await AsyncStorage.getItem('url');
            if (!currentUrl && url) {
                isVirgin = true;
            } else if (currentUrl && url && currentUrl !== url) {
                isVirgin = true;
            }
            if (isVirgin && url && url.toString().includes('?')) {
                setGroupInvite(url.toString().split("?")[1] == 'invite' ? url.toString() : null);
                await AsyncStorage.setItem('url', url?.toString() ? url.toString() : '');
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
                const usersRef = ref(db, `Users/${encodedEmail}/Groups`);
                const snapshot = await get(groupsRef);
                const usersSnapshot = await get(usersRef);
                if (usersSnapshot.exists()) {
                    const userGroups = usersSnapshot.val();
                    if (snapshot.exists()) {
                        const groupsData = snapshot.val();
                        let groupData = [];
                        for (const groupId of userGroups) {
                            if (groupsData[groupId]) {
                                const group = groupsData[groupId];
                                const isOwner = group.Owner === encodedEmail;
                                groupData.push({ title: groupId, owner: isOwner });
                            }
                        }
                        setGroups(groupData);
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
        navigation.navigate('GroupDetails', {groupName});
    };

    function addGroup() {
        navigation.navigate('CreateGroup');
    }

    const rejectInvitation = async (arg0: null) => {
        setGroupInvite(null);
        await AsyncStorage.setItem('virginLink', "false");
    };
    const aceptInvitation = async () => {
    if(!groupInvite) return;
        const groupId = delimiteUrl(groupInvite)[2].replaceAll("?"," ");
        alert(`Accepted invitation to group ${groupId}`);
        setGroupInvite(null);
        await AsyncStorage.setItem('virginLink', "false");

        const db = getDatabase();
        const groupRef = ref(db, `Groups/${groupId}`);
        const email = await AsyncStorage.getItem('email');

        if (!email) {
            console.error('No email found in AsyncStorage');
            return;
        }

        const encodedEmail = encodeEmail(email);
        const userGroupsRef = ref(db, `Users/${encodedEmail}/Groups`);
        const userGroupsSnapshot = await get(userGroupsRef);

        let userGroups = [];
        if (userGroupsSnapshot.exists()) {
            userGroups = userGroupsSnapshot.val();
        }

        userGroups.push(groupId);

        await set(userGroupsRef, userGroups);

        const authenticatedUsersRef = ref(db, `Groups/${groupId}/AuthenticatedUsers`);
        const authenticatedUsersSnapshot = await get(authenticatedUsersRef);

        let authenticatedUsers = [];
        if (authenticatedUsersSnapshot.exists()) {
            authenticatedUsers = authenticatedUsersSnapshot.val();
        }

        authenticatedUsers.push(encodedEmail);

        await set(authenticatedUsersRef, authenticatedUsers);
        setGroups(prevGroups => [...prevGroups, { title: groupId, owner: false }]);
        // alert(groups.length);
        //TODO IMPLEMENT ACCEPT INVITATION
    }

  return (
    <View style={styles.container}>
      <Text style={styles.subHeader}>Your Groups</Text>
      {groupInvite && (
  <View style={styles.overlay}>
    <View style={styles.invitationContainer}>
      <Text style={styles.invitationText}>
        Do you want to join
      </Text>
      <Text style={styles.invitationText2}>
        {delimiteUrl(groupInvite)[2].replaceAll("?"," ")}?</Text>
      <View style={styles.invitationButtons}>
        <Button title="Join Group" onPress={aceptInvitation} />
        <Button title="Decline" color="red" onPress={() => rejectInvitation(null)} />
      </View>
    </View>
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
    // return (
    //     <View style={styles.container}>
    //         <Text style={styles.subHeader}>Your Groups</Text>
    //         {groupInvite && (
    //             <View>
    //                 <Text>Do You Want To Join //InviterName//'s Group {groupInvite?.split('?').pop()}</Text>
    //                 <Button title="Join Group" onPress={() => aceptInvitation()}/>
    //                 <Button title="Decline" onPress={() => rejectInvitation(null)}/>
    //             </View>
    //         )}
    //         <FlatList
    //             data={groups}
    //             keyExtractor={(item, index) => index.toString()}
    //             renderItem={({item}) => (
    //                 <Card
    //                     title={item.title}
    //                     owner={item.owner}
    //                     onPress={() => handleCardPress(item.title)}
    //                     onSwipeOpen={() => console.log("Swipe opened for", item.title)}
    //                 />
    //             )}
    //             contentContainerStyle={styles.listContainer}
    //         />
    //         <TouchableOpacity onPress={addGroup}>
    //             <Text style={styles.newGroupButton}>New Group</Text>
    //         </TouchableOpacity>
    //     </View>
    // );
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  crownIcon: {
    position: 'absolute',
    top: 18,
    right: 18,
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
    paddingVertical: 10,

  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    paddingVertical: 10,
  },
  newGroupButton: {
    textAlign: 'center',
    padding: 10,
    color: 'blue',
    fontSize: 22,
    marginTop: 10,
    // backgroundColor: '#dddddd',
    borderRadius: 20,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    paddingVertical: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  invitationContainer: {
    width: '85%',
    padding: 25,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 12,
  },
  invitationText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  invitationText2: {
    fontSize: 20,
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  invitationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

