import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';

import Data from './data.js';
import Constants from 'expo-constants';
import { ListItem } from 'react-native-elements';
import { withGlobalContext } from '../Context/GlobalContext.js';

import axios from 'axios';

class TransactionList extends React.Component {

    state = {
        data: Data,
        refreshing: false,
    }

    componentDidMount = () => {
        this.requestTransactionHistory();
    }

    handleRefresh = () => {
        this.setState( { refreshing: true } );
        console.log("refreshed")
        this.requestTransactionHistory();
    }

    requestTransactionHistory = () => {
        this.setState( { refreshing: false } );
        const userDetails = JSON.parse(this.props.global.userDetails);
        if (userDetails === null) {
          console.log("user details are null");
          return;
        }
        console.log("transaction list user details: " + userDetails);
        const mockData = this.props.mockData();
        this.setState({ data: mockData });
        /*
        const body = {
          address: userDetails.publicKey,
        }
        console.log("public key: " + userDetails.publicKey);
        axios.post(`https://5a1395d3.ngrok.io/getTransactions`, body)
        .then((res) => {
            // res.data.transactions.id = 1;
            let result = res.data.transactions;
            //result.sender = result.sender.subString(5);
            console.log("transaction data(result): " + JSON.stringify(result));
            result = [result[0], result[1], result[2], result[3]];
            this.setState({ data: result });
        })
        .catch((err) => {
          console.log(err);
        })*/
    }

    renderSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              width: "86%",
              backgroundColor: "#CED0CE",
              marginLeft: "14%"
            }}
          />
        );
      };

    render() {
        const { data, refreshing } = this.state;

        return (
            <View style={styles.container}>
                <FlatList 
                    data={data}
                    renderItem={({ item }) => (
                        <ListItem
                            title={item.sender}
                            subtitle={item.date}
                            rightTitle={item.amount}
                            bottomDivider
                        />
                    )}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={this.renderSeparator}
                    onRefresh={this.handleRefresh}
                    refreshing={refreshing}
                />
            </View>
        );
    }

}

const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
       //flex: 5,
      marginTop: Constants.statusBarHeight,
    },
    item: {
      backgroundColor: '#00b5ec',
      padding: 20,
      marginVertical: 8,
      marginHorizontal: 16,
    },
    title: {
      fontSize: 20,
    },
  });

  export default withGlobalContext(TransactionList);