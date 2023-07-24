import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Linking, BackHandler, Platform, PermissionsAndroid } from 'react-native';
import Button from './components/Button';
import Conversation from './components/Conversation';
import { useSpeechRecognition, useSpeechSynthesis } from 'react-speech-kit';
import * as Permissions from 'expo-permissions';

const BACKGROUND_SERVICE_CHANNEL_ID = 'com.yourapp.channelId';
const BACKGROUND_SERVICE_NOTIFICATION_ID = 1;

export default function App() {
  const [conversation, setConversation] = useState([]);
  const [calling, setCalling] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const { listen, listening, stop } = useSpeechRecognition();
  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    const backAction = () => {
      if (calling) {
        endCall();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [calling]);

  useEffect(() => {
    requestPhoneCallPermission();
  }, []);

  const requestPhoneCallPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
          {
            title: 'Phone Call Permission',
            message: 'App needs permission to make phone calls',
            buttonPositive: 'OK',
            buttonNegative: 'Cancel',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Phone Call permission granted');
        } else {
          console.log('Phone Call permission denied');
        }
      } catch (error) {
        console.log('Phone Call permission request error:', error);
      }
    } else {
      const { status } = await Permissions.askAsync(Permissions.CALL_PHONE);
      if (status === 'granted') {
        console.log('Phone Call permission granted');
      } else {
        console.log('Phone Call permission denied');
      }
    }
  };

  const startCall = async () => {
    setCalling(true);
    setConversation([]);
    await startBackgroundService(); // Foreground Service 시작
    Linking.openURL('tel:010-0000-0000');
    listen({
      onResult: handleSpeechResult,
      onEnd: endCall,
    });
  };

  const handleSpeechResult = (result) => {
    const transcript = result && result.length > 0 ? result[0] : '';
    setConversation((prevConversation) => [...prevConversation, transcript]);
  };

  const endCall = () => {
    setCalling(false);
    stop();
  };

  const startBackgroundService = async () => {
    if (Platform.OS === 'android') {
      const isPermissionGranted = await requestBackgroundServicePermission();
      if (isPermissionGranted) {
        // Foreground Service 시작
        await Notifications.createChannelAndroidAsync(BACKGROUND_SERVICE_CHANNEL_ID, {
          name: 'Background Service Channel',
          sound: true,
          vibrate: true,
        });
        await Notifications.presentLocalNotificationAsync({
          title: 'Background Service',
          body: 'Recording call...',
          channelId: BACKGROUND_SERVICE_CHANNEL_ID,
          priority: 'max',
          sound: 'default',
          vibrate: [0, 250, 250, 250],
          android: {
            channelId: BACKGROUND_SERVICE_CHANNEL_ID,
          },
        });
        await BackgroundFetch.registerTaskAsync('backgroundService', {
          minimumInterval: 60, // 60초마다 실행
        });
      }
    }
  };

  const requestBackgroundServicePermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE,
        {
          title: 'Background Service Permission',
          message: 'App needs permission to run in the background',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    if (conversation.length > 0) {
      speak({ text: conversation[conversation.length - 1] });
    }
  }, [conversation]);

  return (
    <View style={styles.container}>
      {savedMessage ? <Text>{savedMessage}</Text> : <Text>No message</Text>}
      <Button
        onPress={startCall}
        title={calling ? 'AI가 전화 내용을 기록하는 중입니다...' : '전화 걸기'}
        disabled={listening || calling}
      />
      <Conversation conversation={conversation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
  },
});
