import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Data from './data.js';
import { FlatList, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Constants from 'expo-constants';

const Item = ({ title }) => {
    return (
        <TouchableOpacity
            // onPress={() => onSelect(id)}
            style={styles.item}
        >
            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    );
}

export default class TransactionList extends React.Component {

    state = {
        data: Data,
    }

    componentDidMount = () => {
        // TODO: Fetch data
    }

    // TODO: add list refresh

    render() {
        const { data } = this.state;

        return (
            <SafeAreaView style={styles.container}>
                <Text>Transaction History</Text>
                <FlatList 
                    data={data}
                    renderItem={({ item }) => (
                        <Item 
                            id={item.id}
                            title={item.title}
                        />
                    )}
                />
            </SafeAreaView>
        );
    }

}

const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      flex: 1,
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