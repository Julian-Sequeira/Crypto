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
                        style={styles.TextInput}
                        value={username}
                        placeholder="Username"
                        placeholderTextColor="#003f5c"
                        onChangeText={this.handleNameChange}
                    />
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.TextInput}
                        secureTextEntry
                        value={password}
                        placeholder="Password"
                        placeholderTextColor="#003f5c"
                        onChangeText={this.handlePasswordChange}
                    />
                </View>
                <TouchableOpacity style={styles.loginBtn} onPress={this.handleSubmit} disabled={isInvalid}>
                    <Text style={styles.loginText}>LOGIN</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.loginText} onPress={this.handleRegistration}>Register</Text>
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
      backgroundColor: '#003f5c',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo:{
      fontWeight:"bold",
      fontSize:50,
      color:"#fb5b5a",
      marginBottom:40
    },
    inputView:{
      width:"80%",
      backgroundColor:"#465881",
      borderRadius:25,
      height:50,
      marginBottom:20,
      justifyContent:"center",
      padding:20
    },
    inputText:{
      height:50,
      color:"white"
    },
    forgot:{
      color:"white",
      fontSize:11
    },
    loginBtn:{
      width:"80%",
      backgroundColor:"#fb5b5a",
      borderRadius:25,
      height:50,
      alignItems:"center",
      justifyContent:"center",
      marginTop:40,
      marginBottom:10
    },
    loginText:{
      color:"white"
    },
    errorText: {
      color: 'red',
    },
  });


export default Login;
