import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';


class Register extends React.Component {

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
        //TODO: Code executes when the login button is tapped
    }

    handleGoBack = () => {
        this.props.navigation.goBack();
    }

    render() {
        const {username, password} = this.state;
        const isInvalid = username === '' || password === '';

        return (
            <View style={styles.container}>
                <Text style={styles.logo}>Registration</Text>
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
                    <Text style={styles.loginText}>Register</Text>
                </TouchableOpacity>
                <TouchableOpacity>
                    <Text style={styles.loginText} onPress={this.handleGoBack}>Go back</Text>
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


export default Register;
