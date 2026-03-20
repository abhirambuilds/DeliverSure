import * as Speech from 'expo-speech';

export const speakAlert = (message) => {
  Speech.speak(message, {
    language: 'en-US',
    pitch: 1.0,
    rate: 0.9, // Slightly slower for clarity
    onStart: () => console.log('Speech started: ', message),
    onDone: () => console.log('Speech finished'),
    onError: (error) => console.error('Speech error: ', error),
  });
};

export const stopSpeech = () => {
  Speech.stop();
};
