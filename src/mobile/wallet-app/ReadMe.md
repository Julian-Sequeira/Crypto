Title: Mobile wallet app for DeerCoin

Features:
1) Register/Sign in
2) View account balance
3) View transaction history
4) Send coins to another public address from either copying recipients address or scanning QR Code
5) Generate QR Code from user's public key

How to get started:
1) Download expo app on your iOS/Android
2) Create an expo account
3) Sign into expo on the app
4) Install Expo CLI on PC
5) npm install
6) Expo sign in onto your PC terminal
7) npm start
8) Browser popup -> switch to tunnel
7) On Expo app, go to projects and tap the current development server
8) App runs on personal device

App Components:
1) Login
    - Fetches user information (password, username, keys) from Async Storage
2) Register
    - Generates public/private key pair and stores all user information on Async Storage
3) Dashboard
    - Displays current balance and transaction history (data recieved from API endpoints)
    - Transaction history list has pulldown features to update transactions
    - Send Transaction
        - Given amount and recipients public key, user can send transaction
    - QR Code functionality
        - Ability to generate and scan QR codes using Expo SDK

Other notes:
1) App uses Stack Navigator to navigate to different components
TBA
