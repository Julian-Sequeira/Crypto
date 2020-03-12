import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Data from './data.js';
import { FlatList, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Constants from 'expo-constants';
import { List, ListItem } from 'react-native-elements';

// TODO: try this https://shoutem.github.io/docs/ui-toolkit/components/list-view, https://shoutem.github.io/docs/ui-toolkit/introduction

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
        const { data } = this.state;

        return (
            <View style={styles.container}>
                <FlatList 
                    data={data}
                    renderItem={({ item }) => (
                        <ListItem
                            title={item.title}
                            //containerStyle={{ borderBottomWidth: 0 }}
                            bottomDivider
                            // contentContainerStyle={styles.item}
                        />
                    )}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={this.renderSeparator}
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