import React from 'react';
import { StyleSheet, Pressable, Alert } from 'react-native';
import { FlatList, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Link from 'react-native-vector-icons/AntDesign';
import Remove from 'react-native-vector-icons/FontAwesome';
import { Swipeable } from 'react-native-gesture-handler';
import { Share } from 'react-native';

const data = [
  { id: '1', title: 'Card 1', owner: true },
  { id: '2', title: 'Card 2', owner: false },
  { id: '3', title: 'Card 3', owner: true },
  { id: '4', title: 'Card 4', owner: false },
  // TODO import data
];

interface CardProps {
  title: string;
  owner: boolean;
  onSwipeOpen: () => void;
}

const Card = ({ title, owner, onSwipeOpen }: CardProps) => {
  const renderLeftActions = () => (
    <View style={[styles.rightActions, styles.cardButtonContainer]}>
      <Pressable style={[styles.cardButtons, styles.editButton]} onPress={() => shareLink("www.Example.com")}>
      <Link name="link" size={20} color="gold"  />
      </Pressable>
      <Pressable style={[styles.cardButtons, styles.deleteButton]} onPress={() => removeGroup("EXAMPLE_GROUP_ID")}>
      <Remove name="remove" size={20} color="gold"  />
      </Pressable>
    </View>
  );

  return (
    <View style={styles.card_container}>
      {owner && <Icon name="crown" size={20} color="gold" style={styles.crownIcon} />}
      <Swipeable renderLeftActions={renderLeftActions} overshootFriction={10000} onSwipeableOpen={() => onSwipeOpen()}>
      <Pressable style={styles.cardTittleContainer}>
        <View>
        <Text style={styles.title}>{title}</Text>
        </View>
      </Pressable>
      </Swipeable>
    </View>
  );
};

export default function GroupManagmentScreen() {
  function handleOnSwipeOpen(item: { id: string; title: string; owner: boolean; }): void {
    //TODO: Close all other cards
  }

  return (
    <View style={{ flex: 1, paddingTop: 50, backgroundColor:'gray' }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Card title={item.title} owner={item.owner} onSwipeOpen={() => handleOnSwipeOpen(item)}/>}
        contentContainerStyle={styles.listContainer}
      />
      <Pressable onPress={() => addGroup()}>
        <Text style={{ textAlign: 'center', padding: 10, color: 'blue' }}>New Group</Text>
        </Pressable>
    </View>
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
