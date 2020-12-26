// @refresh reset

import React , {useState,useEffect,useCallback} from 'react';
import AsyncStorage from '@react-native-community/async-storage'
import { StyleSheet, Text, View, LogBox, TextInput, Image,TouchableOpacity } from 'react-native';
import {GiftedChat}  from 'react-native-gifted-chat'
import * as firebase from 'firebase'
import 'firebase/firestore'
import { Ionicons } from '@expo/vector-icons'

var firebaseConfig = {
  apiKey: "AIzaSyDHPHfljnW702IzShIWCyVHhawYvZMTGao",
  authDomain: "chatwme-32f52.firebaseapp.com",
  databaseURL: "https://chatwme-32f52-default-rtdb.firebaseio.com",
  projectId: "chatwme-32f52",
  storageBucket: "chatwme-32f52.appspot.com",
  messagingSenderId: "811980866058",
  appId: "1:811980866058:web:fc466aed38eb816bc055f3",
  measurementId: "G-NK6CYH9WVE"
};


if(firebase.apps.length === 0){
  firebase.initializeApp(firebaseConfig); 
}

LogBox.ignoreLogs(['Setting a timer for a long period of time']);

//firebase 

const db = firebase.firestore();
const chatsRef = db.collection('chats')


export default function App() {
    const [user, setUser] = useState(null)
    const [name, setName] = useState('')
    const [messages, setMessages] = useState([])

    useEffect(() => {
      readUser();
      const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
        const messagesFirestore = querySnapshot
            .docChanges()
            .filter(({ type }) => type === 'added')
            .map(({ doc }) => {
                const message = doc.data()
                return { ...message, createdAt: message.createdAt.toDate() }
            })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            appendMessages(messagesFirestore)
    })
    return () => unsubscribe()
}, [])

const appendMessages = useCallback(
  (messages) => {
      setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  },
  [messages]
)

    async function readUser(){
        const user = await AsyncStorage.getItem('user')
        if(user){
          setUser(JSON.parse(user))
        }
    }

    async function handlePress(){
        const _id = Math.random().toString(36).substring(7);
        const user ={_id,name};
        await AsyncStorage.setItem('user', JSON.stringify(user));
        setUser(user)

    }

    async function handleSend(messages){
        const writes = messages.map((m) => chatsRef.add(m))
        await Promise.all(writes)
    }

    if(!user){
      return (
      <View style={styles.container}>
                    
      <View style={styles.circle} />

          <View style={{marginTop:64,alignItems:"center"}}>
              <Image source={require("./assets/chat.png")} style={{width: 100,height:100}}/>
          </View>
          <View style={{marginHorizontal:32}}> 
              <Text style={styles.header}> Username </Text>
              <TextInput 
              style={styles.input} 
              placeholder="Enter you username" 
              onChangeText={setName}
              value={name}
              />
          <View style={{alignItems:"flex-end",marginTop: 64}}>
                  <TouchableOpacity style={styles.continue} onPress={handlePress}> 
                  <Ionicons name="md-checkmark-circle"  size={24} color="#FFF"/>
                  </TouchableOpacity>

          </View>

          </View>
   </View>
      )
    }

  return <GiftedChat  messages={messages} user={user} onSend={handleSend}/>
  
  
}

const styles = StyleSheet.create({
  ccontainer:{
    flex:1,
    backgroundColor: "#F4F5F7",
  },
  input:{
    marginTop:32,
    height:50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#BAB7C3",
    borderRadius: 30,
    paddingHorizontal: 16,
    color: "#514E5A",
    fontWeight: "600"
},
circle: {
  width:500,
  height:500,
  borderRadius:500/2,
  backgroundColor:"#FFF",
  position:"absolute",
  left:-120,
  top:-20,

},
header:{
  fontWeight: "800",
  fontSize: 30,
  color: "#514E5A",
  marginTop: 32,
},
continue:{
  width:70,
  height: 70,
  borderRadius: 70 / 2,
  backgroundColor:"#9075E3",
  alignItems:"center",
  justifyContent:"center"
}

});
