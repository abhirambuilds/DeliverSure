import React from 'react';
import { Button as PaperButton } from 'react-native-paper';
import { StyleSheet } from 'react-native';

const PrimaryButton = ({ title, onPress, style, loading, disabled, mode = "contained", icon }) => {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      style={[styles.button, style]}
      loading={loading}
      disabled={disabled}
      icon={icon}
      contentStyle={styles.contentStyle}
      labelStyle={styles.labelStyle}
    >
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 10,
    borderRadius: 8,
  },
  contentStyle: {
    paddingVertical: 8,
  },
  labelStyle: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default PrimaryButton;
