import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Alert, TextInput } from 'react-native';

import TransactionList from './transactionList.js'
import { SafeAreaView } from 'react-native-safe-area-context';

// import QRCodeScanner from 'react-native-qrcode-scanner';

class Dashboard extends React.Component {
    
    state = {
        user: '',
        balance: '1000',
        // Send money modal
        modalVisible: false,
        // recipient public key
        sendTo: '',
        amount: '',
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

    handlePubKeyChange = sendTo => {
        this.setState({ sendTo });
    }

    handleAmountChange = amount => {
        this.setState({ amount });
    }

    setModalVisible = visible => {
        this.setState({modalVisible: visible});
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

    handleTransaction = () => {
        
        Alert.alert(
            'Transaction',
            'Money sent',
            [
                {
                    text: 'OK', 
                    onPress: () => console.log("sent transaction"),
                },
            ],
        );
    }

    render() {
        const { user, balance, sendTo } = this.state;
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.modal}>
                    <Text style={styles.nameText}>{user}</Text>
                    <Text style={styles.nameText}>Balance: {balance} coins</Text>
                    <TouchableOpacity style={[styles.buttonContainer, styles.sendButton]} onPress={() => this.setModalVisible(true)}>
                        <Text style={styles.loginText}>Send Coins</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.buttonContainer, styles.sendButton]} onPress={this.showQRCodeScreen}>
                        <Text style={styles.loginText}>Show QR Code</Text>
                    </TouchableOpacity>
                </View>
                <View>
                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={this.state.modalVisible}
                    >
                        <View style={[styles.container, styles.modal]}>
                            <Text style={styles.logo}>Create a Transaction</Text>
                            <View style={styles.inputView}>
                                <TextInput
                                    style={styles.inputText}
                                    value={sendTo}
                                    placeholder="Enter Recipient's Public Key"
                                    placeholderTextColor="#003f5c"
                                    onChangeText={this.handlePubKeyChange}
                                />
                            </View>
                            <View style={styles.inputView}>
                                <TextInput
                                    style={styles.inputText}
                                    value={sendTo}
                                    placeholder="Amount"
                                    placeholderTextColor="#003f5c"
                                    onChangeText={this.handleAmountChange}
                                />
                            </View>
                            <TouchableOpacity style={[styles.buttonContainer, styles.loginButton]} onPress={this.handleTransaction}>
                                <Text>Send</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.setModalVisible(false)}>
                                <Text>Go back</Text>
                            </TouchableOpacity>
                        </View>
                        </Modal>
                    </View>
                    <TransactionList />
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

export default Dashboard;