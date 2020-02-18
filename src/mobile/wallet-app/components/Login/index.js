import React from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

class Login extends React.Component {

    state = {
        username: "",
        password: "",
    }

    handleNameChange = name => {
        this.setState({ name });
    }
    
    handlePasswordChange = password => {
        this.setState({ password });
    }

    handleSubmit = () => {
        //TODO
    }

    render() {
        const {username, password} = this.state;
        // TODO: style text inputs
        return (
            <View style={styles.container}>
                <TextInput
                    value={username}
                    placeholder="Username"
                    onChangeText={this.handleNameChange}
                />
                <TextInput
                    value={password}
                    placeholder="Password"
                    onChangeText={this.handlePasswordChange}
                />
                <Button title="Login" onPress={this.handleSubmit} />
            </View>
        )
    };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Login;
