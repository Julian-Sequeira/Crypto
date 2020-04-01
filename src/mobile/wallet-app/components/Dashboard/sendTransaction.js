import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { withGlobalContext } from '../Context/GlobalContext.js';
import firstTx from '../transactions/first.js';
import secondTx from '../transactions/second.js';
import axios from 'axios';

class SendTransaction extends React.Component {

    state = {
        recipient: this.props.global.recipient,
        amount: null,
    }

    componentDidMount = () => {
        this.props.navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={this.showScanScreen} style={styles.headerRight}>
                    <Ionicons name="ios-qr-scanner" size={32} />
                </TouchableOpacity>
            ),
        });       
    }

    handlePubKeyChange = recipient => {
        this.setState({ recipient });
    }

    handleAmountChange = amount => {
        this.setState({ amount });
    }

    showScanScreen = () => {
        console.log("going to scan screen");
        this.props.navigation.navigate('Scan', {
            user: this.state.user,
            updateRecipient: this.handlePubKeyChange,
          }); 
    }

    handleBack = () => {
        this.props.navigation.goBack();
    }

    handleTransaction = () => {
        let result;
        const body = {
            trxData: JSON.stringify(firstTx),
        }

        axios.post(`https://efdac82e.ngrok.io/addTransaction`, body)
        .then((res) => {
            result = res;
            // console.log(res);
        })
        .catch((err) => {
            console.log(err);
        })
        
        Alert.alert(
            'Transaction',
            'Money sent',
            [
                {
                    text: 'OK', 
                    onPress: () => console.log("money sent, status: " + result.status),
                },
            ],
        );
    }

//TODO: get rid of keyboard tapping outside
    render() {
        const { amount, recipient } = this.state;
        return(
            <View style={[styles.container, styles.modal]}>
                <Text style={styles.logo}>Create a Transaction</Text>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.inputText}
                        value={recipient}
                        placeholder="Enter Recipient's Public Key"
                        placeholderTextColor="#003f5c"
                        onChangeText={this.handlePubKeyChange}
                    />
                </View>
                <View style={styles.inputView}>
                    <TextInput
                        style={styles.inputText}
                        value={amount}
                        placeholder="Amount"
                        placeholderTextColor="#003f5c"
                        keyboardType='numeric'
                        onChangeText={this.handleAmountChange}
                    />
                </View>
                <TouchableOpacity style={[styles.buttonContainer, styles.loginButton]} onPress={this.handleTransaction}>
                    <Text>Send</Text>
                </TouchableOpacity>
                <TouchableOpacity  onPress={this.handleBack}>
                    <Text>Go back</Text>
                </TouchableOpacity>
            </View>
        )
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

export default withGlobalContext(SendTransaction);