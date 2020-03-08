import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage } from 'react-native';


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
      try {
        await AsyncStorage.setItem(this.state.username, this.state.password);
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
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.TextInput}
                        secureTextEntry
                        value={confirmedPassword}
                        placeholder="Confirm Password"
                        placeholderTextColor="#003f5c"
                        onChangeText={this.handleConfirmedPasswordChange}
                    />
                </View>
                <TouchableOpacity style={styles.loginBtn} onPress={this.handleSubmit} disabled={isInvalid}>
                    <Text style={styles.loginText}>Register</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={this.handleGoBack}>
                    <Text style={styles.loginText}>Go back</Text>
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


export default Register;
