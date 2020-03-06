import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';

class Dashboard extends React.Component {
    
    state = {
        user: '',
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

    signOut = () => {
        // this.props.navigation.navigate("Login");
        this.props.navigation.reset({
            index: 0,
            routes: [{name: "Login"}],
        });
    }

    render() {
        const { user } = this.state;
        return (
            <View style={styles.container}>
                <Text style={styles.nameText}>Welcome {user}</Text>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#003f5c',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerRight: {
        color: '#ffffff',
        fontWeight: 'bold',
        paddingHorizontal: 20,
    },
    nameText: {
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: 30,
    },
  });

export default Dashboard;