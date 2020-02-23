import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

class Login extends React.Component {

    state = {
        username: "",
        password: "",
    }

    handleNameChange = username => {
        this.setState({ username });
    }
    
    handlePasswordChange = password => {
        this.setState({ password });
    }

    handleSubmit = () => {
        //TODO: authenticate the user here and navigate to main dashbaord
    }

    handleRegistration = () => {
        this.props.navigation.push('Register');
    }

    render() {
        const {username, password} = this.state;
        const isInvalid = password === '' || username === '';

        return (
            <View style={styles.container}>
                <Text style={styles.logo}>Welcome to the DeerCoin App</Text>
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
    }
  });


export default Login;
