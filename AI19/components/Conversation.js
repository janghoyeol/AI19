import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';

export default function Conversation({ conversation }) {
  return (
    <ScrollView style={styles.container}>
      {conversation.map((message, index) => (
        <Text key={index} style={styles.message}>
          {message}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    marginTop: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 10,
  },
});
