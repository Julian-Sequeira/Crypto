import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from './home.js';
import BlockPage from './blockPage.js';

const Main = () => {
  return (
    <Switch>
      <Route exact path='/' component={Home}></Route>
      <Route exact path='/block/:hash' component={BlockPage}></Route>
    </Switch>
  );
}

export default Main;