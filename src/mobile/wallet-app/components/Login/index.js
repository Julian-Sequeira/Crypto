import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage } from 'react-native';

class Login extends React.Component {

    state = {
        username: "",
        password: "",
        error: "",
    }

    handleNameChange = username => {
        this.setState({ username });
    }
    
    handlePasswordChange = password => {
        this.setState({ password });
    }

    handleSubmit = () => {
        this.getUserInformation();
    }

    getUserInformation = async () => {
      try {
        const {username, password} = this.state;
        const val = await AsyncStorage.getItem(username);
        if (val == password) {
          // TODO: this is double loading the dashboard, find a way to pass params while reseting!!
          this.props.navigation.navigate('Dashboard', {
            user: username,
          });
          /*this.props.navigation.reset({
            index: 0,
            routes: [{name: 'Dashboard'}],
          });*/
          console.log("hello");
        } else {
          this.setState({ error: 'Invalid Username or Password' });
          console.log("Invalid password");
        }
      } catch (error) {
        console.log(error);
      }
    }

    handleRegistration = () => {
        this.props.navigation.push('Register');
    }

    render() {
        const {username, password, error} = this.state;
        const isInvalid = password === '' || username === '';

        return (
            <View style={styles.container}>
                <Text style={styles.logo}>DeerCoin Wallet</Text>
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
                <TouchableOpacity style={[styles.buttonContainer, styles.loginButton]} onPress={this.handleSubmit} disabled={isInvalid}>
                    <Text style={styles.loginText}>LOGIN</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonContainer}>
                    <Text onPress={this.handleRegistration}>Register</Text>
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


export default Login;
