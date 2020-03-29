import React from 'react';
import { StyleSheet, View, Share, TouchableOpacity } from 'react-native';

import { QRCode as CustomQRCode } from 'react-native-custom-qr-codes-expo';
import { Ionicons } from '@expo/vector-icons';
import { withGlobalContext } from '../Context/GlobalContext.js';

class showQRCode extends React.Component {
    
    state = {
        text: ''
    }

    componentDidMount() {
        const userDetails = JSON.parse(this.props.global.userDetails);
        this.setState({ text: userDetails.publicKey });

        this.props.navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={this.onShare} style={styles.headerRight}>
                    <Ionicons name="ios-share" size={32} />
                </TouchableOpacity>
            ),
        });
    }

    onShare = async () => {
        let result = await Share.share({
            message: this.state.text.toString(),
        })
        console.log(result)
    }

    render() {
        const { text } = this.state;
        return (
        <View style={styles.container}>
            <CustomQRCode value={text} />
        </View>
        );
    };
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
    })

export default withGlobalContext(showQRCode);