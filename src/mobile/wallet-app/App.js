import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GlobalContextProvider } from './components/Context/GlobalContext.js'

import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import showQRCode from "./components/Dashboard/showQRCode.js";
import Scan from "./components/Dashboard/qrScan.js";
import SendTransaction from "./components/Dashboard/sendTransaction.js";

const Stack = createStackNavigator();

export default function App() {
  return (
    <GlobalContextProvider>
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#DCDCDC',
          },
          headerTintColor: 'black',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: 'black',
          },
        }}
      >
        <Stack.Screen name="Login" component={Login} options={{ title: 'Wallet' }}/>
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="showQRCode" component={showQRCode} options={ {title: 'QR Code'} }/>
        <Stack.Screen name="Scan" component={Scan} options={ {title: 'Scan QR Code'} }/>
        <Stack.Screen name="SendTransaction" component={SendTransaction} options={ {title: 'Send Transaction'} }/>
      </Stack.Navigator>
    </NavigationContainer>
    </GlobalContextProvider>
  );
}

