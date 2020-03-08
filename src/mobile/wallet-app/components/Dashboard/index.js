import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

class Dashboard extends React.Component {
    
    state = {
        user: '',
        balance: '1000',
    }

    componentDidMount() {
        this.props.navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity>
                    <Text style={styles.headerRight} onPress={this.signOut}>Sign Out</Text>
                </TouchableOpacity>
            ),
        });
        console.log("dashboard mounted");
        if (typeof(this.props.route.params.user) != 'undefined') {
            this.setState({ user: this.props.route.params.user })
            console.log("success");
        }
        console.log(this.props.route);
    }


    goToLogin = () => {
        this.props.navigation.reset({
            index: 0,
            routes: [{name: "Login"}],
        });
    }

    signOut = () => {

        Alert.alert(
            'Sign Out',
            'Are you sure?',
            [
                {
                    text: 'Cancel', 
                    onPress: () => console.log("cancel sign out alert"),
                    style: 'cancel',
                },
                {
                    text: 'OK',
                    onPress: this.goToLogin,
                }
            ],
        );
    }

    render() {
        const { user, balance } = this.state;
        return (
            <View style={styles.container}>
                <Text style={styles.nameText}>{user}</Text>
                <Text style={styles.nameText}>Balance: {balance} coins</Text>
                <TouchableOpacity onPress={this.sendMoney}>
                    <Text style={styles.loginText}>Send Money</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DCDCDC',
        alignItems: 'center',
        justifyContent: 'center',
      },
    headerRight: {
        color: 'black',
        fontWeight: 'bold',
        paddingHorizontal: 20,
    },
    nameText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 30,
    },
  });

export default Dashboard;