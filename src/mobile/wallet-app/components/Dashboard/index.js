import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Alert, TextInput } from 'react-native';

import TransactionList from './transactionList.js'
import { SafeAreaView } from 'react-native-safe-area-context';
import { withGlobalContext } from '../Context/GlobalContext.js';
import axios from 'axios';

class Dashboard extends React.Component {
    
    state = {
        user: '',
        balance: '500',
    }

    /*shouldComponentUpdate(nextProps, nextState) {
        return this.state.user == '' || this.state.balance == 5;
    }*/

    componentDidMount() {
        this.props.navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity>
                    <Text style={styles.headerRight} onPress={this.signOut}>Sign Out</Text>
                </TouchableOpacity>
            ),
        });
        console.log("dashboard mounted");
        this.setState({ user: this.props.global.username })
        console.log(this.props.route);
        const userDetails = JSON.parse(this.props.global.userDetails);
        if (userDetails === null) {
            console.log("user details are null");
            return;
        }
        /*const address = userDetails.publicKey;
        const body = {
            address,
        }
        console.log("from dashboard: " + userDetails.publicKey);
        axios.post(`https://5a1395d3.ngrok.io/getBalance`, body)
        .then((res) => {
            const balance = res.data.balance;
            console.log("current balance: " + balance);
            this.setState({ balance });
        })
        .catch((err) => {
            console.log(err);
        });*/
    }

    updateMockData = () => {
        const balance = 494
        this.setState({ balance });
        const txList = {
            sender: "2d2d2d2d2d424547494e2...",
            amount: "5",
            date: "04/01/2020",
        }
        const data = [txList];
        return data;
    }

    showTransactionScreen = () => {
        this.props.navigation.navigate('SendTransaction', {
            user: this.state.user,
          }); 
    }

    showScanScreen = () => {
        console.log("going to scan screen");
        this.setModalVisible(false);
        this.props.navigation.navigate('Scan', {
            user: this.state.user,
          }); 
    }

    showQRCodeScreen = () => {
        console.log("going to qr code screen");
        this.props.navigation.navigate('showQRCode', {
            user: this.state.user,
          });
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
            <SafeAreaView style={styles.container}>
                <View style={styles.modal}>
                    <Text style={styles.nameText}>{user}</Text>
                    <Text style={styles.nameText}>Balance: {balance} coins</Text>
                    <TouchableOpacity style={[styles.buttonContainer, styles.sendButton]} onPress={this.showTransactionScreen}>
                        <Text style={styles.loginText}>Send Coins</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.buttonContainer, styles.sendButton]} onPress={this.showQRCodeScreen}>
                        <Text style={styles.loginText}>Show QR Code</Text>
                    </TouchableOpacity>
                </View>
                <TransactionList mockData={this.updateMockData}/>
            </SafeAreaView>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#DCDCDC',
        // alignItems: 'center',
        justifyContent: 'center',
      },
      modal: {
        alignItems: 'center',
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
      buttonContainer: {
        marginTop: 20,
        height:45,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom:20,
        width:250,
        borderRadius:30,
      },
      sendButton: {
        backgroundColor: "green",
      },
  });

  export default withGlobalContext(Dashboard);