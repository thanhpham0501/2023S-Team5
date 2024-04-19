import React, { useState } from 'react';
import {View,Image, Text, Alert, Button, StyleSheet,TouchableOpacity, ScrollView} from 'react-native';
import { Audio } from 'expo-av';
import Config from '../../../config';
import MicStart from '../../../assets/images/micstart.png';
import MicStop from '../../../assets/images/micstop.png';
import Basic from '../../../assets/training_images/basic.png';

const BasicScreen = () => {

 // State variables for managing the recording process and displaying results
    const [textToRead, setTextToRead] = useState([]);
    const [recording, setRecording] = useState('');
    const [message, setMessage] = useState([]);
    const [results, setResults] = useState([]);
    const [result, setResult] = useState([]);
    const [score, setScore] = useState({});
    const [ipa, setIpa] = useState('');
    const [soundsLike, setSoundsLike] = useState({});
    const [ipascore, setIpaScore] = useState({});
// Function to start recording audio
    const startRecording = async () => {
        try {
           // Request permission to use the microphone
            const permission = await Audio.requestPermissionsAsync();// allow app to use phone's microphone
            if (permission.status === "granted") {
              // Set audio mode and create a new recording
                await Audio.setAudioModeAsync({
                  allowsRecordingIOS: true,
                  playsInSilentModeIOS: true
                });
        
                const { recording } = await Audio.Recording.createAsync(
                  {
                    android: {
                      extension: '.m4a',
                      sampleRate: 44100,
                      numberOfChannels: 2,
                      bitRate: 128000,
                    },
                    ios: {
                      extension: '.m4a',
                      outputFormat: Audio.IOSOutputFormat.APPLELOSSLESS,
                      audioQuality: Audio.IOSAudioQuality.MAX,
                      sampleRate: 44100,
                      numberOfChannels: 1,
                      bitRate: 320000
                    },
                  }
                );
        
                setRecording(recording);
              } else {
                setMessage("Please grant permission to app to access microphone");
              }
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }
// Function to stop recording audio and analyze the recorded data
    const stopRecording = async () => {
       // Stop recording and unload the recording
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });
        // Create a new sound from the recording
        const { sound, status } = await recording.createNewLoadedSoundAsync();
        // Fetch the recorded audio file and analyze it
        try {
           // Fetch the recorded audio file and convert it to base64 format
            const response = await fetch(recording.getURI());

            const blob = await response.blob();

            const blobToBase64 = (blob) => {/* Convert blob to base64 */
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                return new Promise((resolve) => {
                  reader.onloadend = () => {
                    resolve(reader.result.split(',')[1]);
                  };
                });
              };

            const audioBase64 = await blobToBase64(blob);
            // Prepare the request options
            const options = {
                method: 'POST',
                headers: {/* Request headers */
                    'content-type': 'application/json',
                    'X-RapidAPI-Key': '85df79b3afmshb9b935fe7ccbcebp1365a4jsn0a21f5b9aca4',
                    'X-RapidAPI-Host': 'pronunciation-assessment1.p.rapidapi.com'
                },
                body: `{"audio_base64":"${audioBase64}","audio_format":"m4a","text":"${textToRead}"}`/* Request body with audio data and text to analyze */
            };
            // Send the audio data to the pronunciation assessment API
            let updatedResults = [...results];

            await fetch('https://pronunciation-assessment1.p.rapidapi.com/pronunciation', options)
                .then(response => response.json())
                .then(response => {
                  // Process the response and update state variables
                    console.log(JSON.stringify(response));
                    updatedResults.push(response);
                    setScore(response.score);
                    // const word = response.words[0];
                     // Extract and set IPA details
                    // Log the phonetic details and IPA score
                    console.log(response.words[0]);
                    // Set IPA and IPA score state variables
                    const ipa_score_map = new Map();
                    var phonetic = '/';
                    var sounds_like = '/';
                    response.words[0].syllables.map((syllable, index) => {
                      phonetic = phonetic + syllable.label_ipa;
                      syllable.phones.map((phone, idx) => {
                        sounds_like = sounds_like + phone.sounds_like[0].label_ipa;
                      });

                      ipa_score_map.set(syllable.label_ipa, syllable.score);
                    });
                    phonetic = phonetic + '/';
                    sounds_like = sounds_like + '/';
                    console.log(phonetic);
                    setIpaScore(JSON.stringify([...ipa_score_map]));
                    setIpa(phonetic);
                    setSoundsLike(sounds_like);
                    setResult(JSON.stringify(response));
                    setResults(updatedResults);
                })
                .catch(err => console.error(err));

        } catch (err) {
            console.log('Error uploading file:', err);
        }
    }
 // Function to randomly select a text to read from the configuration
    const addPost = () => {
      const randomItem = Config.BASIC[Math.floor(Math.random() * Config.BASIC.length)];
        setTextToRead(randomItem);
    }
    
  // Function to render the text to read
    function getTextToRead() {
        return (
          <View style={styles.textContainer}>
        <Text style={styles.text}>{textToRead}</Text>
      </View>
        );
      }
// Render the component
      return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.heading}>Basic Topic Pronunciation</Text>
          <Image source={Basic} style={styles.image}></Image>
          <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={addPost}
          >
            <Text style={styles.button}>GENERATE RANDOM POST</Text>
          </TouchableOpacity>
          </View>
          {getTextToRead()}
          {textToRead == '' ? null : (
            <TouchableOpacity
                onPress={recording ? stopRecording : startRecording}
                style={styles.recordButton}
              >
                {recording ? (
                  <Image
                    source={MicStop} 
                    style={styles.recordImage}
                  />
                ) : (
                  <Image
                    source={MicStart} 
                    style={styles.recordImage}
                  />
                )}
         </TouchableOpacity>
          )}
          {result == '' ? null : (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>Expected IPA: {ipa}</Text>
              <Text style={styles.resultText}>Detailed Score: {ipascore}</Text>
              <Text style={styles.resultText}>Actual IPA: {soundsLike}</Text>
              <Text style={styles.resultText}>Overall Score: {score}</Text>
            </View>
          )}
        </View>
       </ScrollView>
      );
    };
    // style
    const styles = StyleSheet.create({
      scrollContainer: {
        flexGrow: 1,
      },
      container: {
        flex: 1,
        backgroundColor: '#bf9bd9',
        alignItems: 'center',
        justifyContent: 'flex-start',
      },
      heading: {
        fontSize: 30,
        marginBottom: 16,
        fontWeight:'bold',
        marginBottom:20
      },
      image:{
        marginBottom:100
      },
      button: {
        marginVertical: 10,
        fontSize:15,
        color:'#090905',
        backgroundColor: '#f4eb5a', // Background color
        padding: 5, // Padding around the button text
        borderRadius: 5,
        alignItems:'center',
        fontWeight:'bold'
        },

      buttonContainer: {
        marginBottom: 80,
        width:200,
        height:100
      },
      textContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#E7EAF4',
        borderRadius: 8,
        marginBottom: 16,
        width:175,
        alignItems:'center'
      },
      text: {
        fontSize: 18,
      },
      recordButton: {
        marginVertical: 16,
      },
      resultContainer: {
        marginTop: 20,
        backgroundColor: '#FAE9EA',
        padding: 16,
        borderRadius: 8,
      },
      resultText: {
        fontSize: 18,
        alignSelf: 'center',
        marginBottom: 8,
      },
      recordImage:{
        height:55,
        width:45
      }
    });

export default BasicScreen;