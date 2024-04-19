import React, {useState} from 'react';
import { Video } from 'expo-av';
import {
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Alert,
} from 'react-native';
import Logo from '../../../assets/images/Logo_3.png';
import Uicon from '../../../assets/images/UnameIcon.png'
import PWicon from '../../../assets/images/PwordIcon.png'
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import SocialSignInButtons from '../../components/SocialSignInButtons';
import {useNavigation} from '@react-navigation/native';
import { Auth } from 'aws-amplify';
import {useForm, Controller} from 'react-hook-form';
import { useRoute } from "@react-navigation/native";

// Define the SignInScreen component
const SignInScreen = ({navigation}) => {
   // State variables for username, password, and loading state
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const {control, handleSubmit, formState: {errors}} = useForm();
  // Get window dimensions
  const {height} = useWindowDimensions();
  // const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  // Event handler for sign-in button
  const onSignInPressed = async data => {

    try {
       // Attempt to sign in using AWS Amplify Auth module
      const response = await Auth.signIn(data.username, data.password);
      const userInfo = await Auth.currentUserInfo();
      // Get current user info
      console.log(userInfo);
      // Extract user info attributes
      const userName = userInfo.username;
      const name = userInfo.attributes.name;
      const email = userInfo.attributes.email;
      const phone_number = userInfo.attributes.phone_number;

      // Navigate to the home screen upon successful sign-in
      navigation.navigate('TabNavigator', {
        screen: 'Home',
        params: {
          userName: userName,
          name: name,
          email: email,
          phone_number: phone_number,
        }
      });
    } catch(e) {
      // Display an alert in case of sign-in error
      Alert.alert('Oops', e.message);
    }

  };
  // Event handler for forgot password button
  const onForgotPasswordPressed = () => {
    navigation.navigate('ForgotPassword');
  };
  // Event handler for sign-up button
  const onSignUpPress = () => {
    navigation.navigate('SignUp');
  };
  // Render the component
  return (
     // Root view container
      <View style={styles.root}>

            <Video
            source={{ uri: 'https://drive.google.com/uc?id=1jxYZRReov1RI-4wz_9Nh7_sPoTSyN8G2' }}
        rate={1.5}
        isMuted={true}
        resizeMode="cover"
        shouldPlay
        isLooping
        style={StyleSheet.absoluteFillObject}
      />
        
        <Image
          source={Logo}
          style={[styles.logo, {height: height * 0.3}]}
          resizeMode="contain"
        />

        <CustomInput
          name="username"
          value={username}
          setValue={setUsername}
          placeholder="Username"
          control={control}
          rules={{required: 'Username is required'}}
          imageSource={Uicon} 
          imageStyle={[styles.uicon]}
          
          />
        <CustomInput
          name="password"
          placeholder="Password"
          value={password}
          setValue={setPassword}
          secureTextEntry
          control={control}
          imageSource={PWicon} 
          imageStyle={[styles.pwicon]}
          rules={{
            required: 'Password is required',
            minlength: {
              value: 3,
              message: 'Password should be minimum 3 characters long',
            },
          }}
        />

        <CustomButton text="Sign In" onPress={handleSubmit(onSignInPressed)} 
          type="SECONDARY"
          fgColor='#000000'
        />

        <CustomButton
          
          text="Forgot password?"
          onPress={onForgotPasswordPressed}
          type="TERTIARY"
          // imageSource={FwordIcon}
          // imageStyle={[styles.fwicon]}          
        />

        <CustomButton
          text="Don't have an account? Click here and create one"
          onPress={onSignUpPress}
          type='TERTIARY'
          fgColor='#2126e9'
          />

        <SocialSignInButtons />


      </View>
    
  );
};
// Styles
const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: '70%',
    maxWidth: 300,
    maxHeight: 200,
  },

  uicon:{
    width: '10%',
    marginRight: 2,
  },
  pwicon:{
    width: '8%',
    marginRight: 2,
  },
  fwicon:{
    width:'10%'
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },

});

export default SignInScreen;
