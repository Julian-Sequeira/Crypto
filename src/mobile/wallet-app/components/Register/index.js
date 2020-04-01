import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage } from 'react-native';
import priv from '../Keys/privkey.js';
import pub from '../Keys/pubkey.js';


class Register extends React.Component {

    state = {
        username: "",
        password: "",
        confirmedPassword: "",
        error: "",
    }

    handleNameChange = username => {
        this.setState({ username });
    }
    
    handlePasswordChange = password => {
        this.setState({ password });
    }

    handleConfirmedPasswordChange = confirmedPassword => {
      this.setState({ confirmedPassword });
    }

    handleSubmit = () => {  
      const { password, confirmedPassword } = this.state;
      if (password == confirmedPassword) {
        this.storeUserInformation();
      } else {
        this.setState({ error: 'Passwords do not match' });
      }
    }

    storeUserInformation = async () => {
      try {
        const user = await AsyncStorage.getItem(this.state.username);
        console.log(user);
        if (user !== null) {
          this.setState({ error: 'User exists' });
          console.log("user exists");
          return;
        }
      } catch (error) {
        console.log(error);
      }
      console.log(this.state.username, this.state.password);
      const publicK = pub;
      const privateK = priv;
      const account = {
        username: this.state.username,
        password: this.state.password,
        publicKey: publicK,
        privateKey: privateK,
      }
      try {
        await AsyncStorage.setItem(this.state.username, JSON.stringify(account));
        console.log("registered");
        this.props.navigation.goBack();
      } catch (error) {
        console.log("error saving data");
      }
    }

    handleGoBack = () => {
        this.props.navigation.goBack();
    }

    render() {
        const {username, password, confirmedPassword, error} = this.state;
        const isInvalid = username === '' || password === '' || confirmedPassword === '';

        return (
            <View style={styles.container}>
                <Text style={styles.logo}>Registration</Text>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.inputText}
                        value={username}
                        placeholder="Username"
                        placeholderTextColor="#003f5c"
                        onChangeText={this.handleNameChange}
                    />
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.inputText}
                        secureTextEntry
                        value={password}
                        placeholder="Password"
                        placeholderTextColor="#003f5c"
                        onChangeText={this.handlePasswordChange}
                    />
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.inputText}
                        secureTextEntry
                        value={confirmedPassword}
                        placeholder="Confirm Password"
                        placeholderTextColor="#003f5c"
                        onChangeText={this.handleConfirmedPasswordChange}
                    />
                </View>
                <TouchableOpacity style={[styles.buttonContainer, styles.loginButton]} onPress={this.handleSubmit} disabled={isInvalid}>
                    <Text style={styles.loginText}>Register</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.handleGoBack}>
                    <Text>Go back</Text>
                </TouchableOpacity>
                <Text style={styles.errorText}>
                  {error}
                </Text>
            </View>
        )
    };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DCDCDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo:{
    fontWeight:"bold",
    fontSize:40,
    color:"#00b5ec",
    marginBottom:40
  },
  inputView: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius:30,
    borderBottomWidth: 1,
    width:250,
    height:45,
    marginBottom:20,
    flexDirection: 'row',
    alignItems:'center'
  },
  inputText:{
    height:45,
    marginLeft:16,
    borderBottomColor: '#FFFFFF',
    flex:1,
  },
  buttonContainer: {
    height:45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom:20,
    width:250,
    borderRadius:30,
  },
  loginButton: {
    backgroundColor: "#00b5ec",
  },
  loginText:{
    color:"white"
  },
  errorText: {
    color: 'red',
  },
});


export default Register;
