import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, View, StatusBar, TouchableOpacity, ScrollView, Platform, Share, ImageBackground, Image } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Permissions from 'expo-permissions';
import ViewShot from 'react-native-view-shot';
import { Icon } from '@rneui/themed';
// import { BackgroundImage } from '@rneui/base';

export default function App() {
  const [data, setData] = useState([]);
  const [newVid, setNewVid] = useState('');
  const [newPartNo, setNewPartNo] = useState('');
  const [newHouse, setNewHouse] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [capturing, setCapturing] = useState(false);
  const viewShotRef = useRef();
  const clear = () => {
    setNewHouse('')
    setNewPartNo('')
    setNewHouse('')
  }

  useEffect(() => {
    askForPermissions();
  }, []);

  // const askForPermissions = async () => {
  //   if (Platform.OS === 'android') {
  //     try {
  //       const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
  //       if (status !== 'granted') {
  //         console.log('Permission to access the media library is required!');
  //       }
  //     } catch (error) {
  //       console.error('Error asking for permissions:', error);
  //     }
  //   }
  // };

  const askForPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access the media library is required!');
        }
      } catch (error) {
        console.error('Error asking for permissions:', error);
      }
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (newVid) {
        queryParams.append('vid', newVid);
      }
      if (newPartNo) {
        queryParams.append('partNo', newPartNo.toString());
      }
      if (newHouse) {
        queryParams.append('house', newHouse);
      }

      const apiUrl = `https://voter-backend-2oi2.onrender.com/voterdata?${queryParams}`;

      const response = await axios.get(apiUrl);
      setData(response.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [newVid, newPartNo, newHouse]);

  const downloadCard = async () => {
    try {
      if (selectedCard === null) {
        console.warn('No card selected');
        return;
      }
      setCapturing(true);
      const uri = await viewShotRef.current.capture();
      console.log('Captured URI:', uri);
  
      await saveToCameraRoll(uri);
  
      setCapturing(false);
    } catch (error) {
      console.error('Error capturing image:', error);
      setCapturing(false);
    }
  };
  

  const shareCard = async () => {
    try {
      if (selectedCard === null) {
        console.warn('No card selected');
        return;
      }
      const shareContent = {
        message: `Name: ${data[selectedCard].NAME}\nPS Name: ${data[selectedCard].PS_NAME_EN}\nHouse No: ${data[selectedCard].C_HOUSE_NO}\nEPIC No: ${data[selectedCard].EPIC_NO}\nPart No: ${data[selectedCard].PART_NO}`,
      };
      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing card:', error);
    }
  };

  const saveToCameraRoll = async (uri) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access the media library is required!');
        return;
      }
  
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Expo', asset, false);
  
      alert("Image saved to camera roll successfully.");
      console.log('Image saved to camera roll successfully.');
    } catch (error) {
      console.error('Error saving image to camera roll:', error);
    }
  };
  

  const renderCards = () => {
    if (data.length === 0) {
      return null;
    }
    return data.map((record, index) => (
      <ScrollView scrollEnabled={true} key={index}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => setSelectedCard(index)}
        >
          <Text>Name: {record.NAME}</Text>
          <Text>PS Name (English): {record.PS_NAME_EN}</Text>
          <Text>House No: {record.C_HOUSE_NO}</Text>
          <Text>EPIC No: {record.EPIC_NO}</Text>
          <Text>Part No: {record.PART_NO}</Text>
        </TouchableOpacity>
      </ScrollView>
    ));
  };

  return (
    <ImageBackground source={require("./assets/Amitjp.png")} style={styles.container}>
      {selectedCard === null ? (
        <View style={{ marginTop: 30 }}>
          <TextInput placeholder='voter id' value={newVid} onChangeText={setNewVid} style={styles.input}></TextInput>
          <TextInput placeholder='partno' value={newPartNo} onChangeText={setNewPartNo} style={styles.input}></TextInput>
          <TextInput placeholder='house no' value={newHouse} onChangeText={setNewHouse} style={styles.input}></TextInput>
          <TouchableOpacity onPress={fetchData} style={styles.btn} >
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={clear} style={styles.btn}>
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <ViewShot ref={viewShotRef} style={{ flex: 1 }}>
          {selectedCard !== null ? (
            <View >
        <View style={{marginTop:100,backgroundColor:'white',alignItems:"center"}}>
          <Image source={require('./assets/bjp.png')} style={{width:100,height:100}}></Image>
           <Text>Name: {data[selectedCard].NAME}</Text>
           <Text>PS name</Text>
              <Text>{data[selectedCard].PS_NAME_EN}</Text>
              <Text>House No: {data[selectedCard].C_HOUSE_NO}</Text>
              <Text>EPIC No: {data[selectedCard].EPIC_NO}</Text>
              <Text>Part No: {data[selectedCard].PART_NO}</Text>
              <Text>Section-no: {data[selectedCard].SECTION_NO}</Text>

           </View>

              {!capturing && (
                <View >
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={downloadCard}
                  >
                    <Text style={styles.buttonText}>Download Image</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={shareCard}
                  >
                    <Text style={styles.buttonText}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => setSelectedCard(null)}
                  >
                    <Text style={styles.buttonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            renderCards()
          )}
        </ViewShot>
      </ScrollView>

      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    // width:"100wv"
  },
  input: {
    marginTop:50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    // marginBottom: 10,
    width:300,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems:'center'
  },
  shareButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#4CAF50', // Green color for the share button
    borderRadius: 5,
    alignItems:'center'

  },
  backButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FF0000',
    borderRadius: 5,
    color:"white",
    alignItems:'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  btn:{
    backgroundColor:"green",
    height:30,
    margin:20,
    alignItems:"center",
    justifyContent:"center"
  },
  btntxt:{
    color:'white'

  }
});
