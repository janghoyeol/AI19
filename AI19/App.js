import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Button from './components/Button';
import Conversation from './components/Conversation';

export default function App() {
  const [conversation, setConversation] = useState([]);

  const startCall = () => {
    //이런 대화를 했다고 가정합니다.
    const conversation = [
      '안녕하세요?',
      '안녕하세요! 어떤 도움이 필요하세요?',
      '저는 어떤 긴급 상황에 도움을 줄 수 있습니다.',
    ];

    setConversation(conversation);
  };

  return (
    <View style={styles.container}>
      <Button onPress={startCall} title="통화하기" />
      <Conversation conversation={conversation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'yellow',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
});
