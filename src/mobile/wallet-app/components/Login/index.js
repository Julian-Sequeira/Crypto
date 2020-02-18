import React from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import LoginForm from './loginForm';


// TODO: onPress route to register screen
const Login = () => (
    <View style={styles.container}>
        <Text>Welcome to DeerCoin</Text>
        <Button title="Login" />
        <Button title="Register" />
    </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Login;
