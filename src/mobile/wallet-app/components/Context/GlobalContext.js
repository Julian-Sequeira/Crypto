import React from 'react';
import { AsyncStorage } from 'react-native';

const GlobalContext = React.createContext({});

export class GlobalContextProvider extends React.Component {

    state = {
        test: 'Anees',
        username: null,
        userDetails: null,
        recipient: null,
    }

    updateDetails = ( key ) => {
        const data = AsyncStorage.getItem(key);
        this.setState({ username: key });
        this.setState({ userDetails: data });
    }

    updateRecipient = (recipient) => {
        this.setState({ recipient });
    }

    render () {
        return (
            <GlobalContext.Provider
                value={{
                    ...this.state,
                    updateDetails: this.updateDetails,
                    updateRecipient: this.updateRecipient,
                }}
            >
                {this.props.children}
            </GlobalContext.Provider>
        )
    }
}

export const withGlobalContext = ChildComponent => props => (
    <GlobalContext.Consumer>
        {
            context => <ChildComponent {...props} global={context}/>
        }
    </GlobalContext.Consumer>
);