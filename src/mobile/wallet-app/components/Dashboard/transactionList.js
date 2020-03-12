import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';

import Data from './data.js';
import Constants from 'expo-constants';
import { ListItem } from 'react-native-elements';

export default class TransactionList extends React.Component {

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
        // TODO: Fetch data
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

    // TODO: add list refresh

    render() {
        const { data, refreshing } = this.state;

        return (
            <View style={styles.container}>
                <FlatList 
                    data={data}
                    renderItem={({ item }) => (
                        <ListItem
                            title={item.title}
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