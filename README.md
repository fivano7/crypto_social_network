# Crypto_social_network
Simple crypto social network with NFTs as profile pictures and the option to tip posts built using react, solidity, hardhat, and ethers.js. Deployed to both local hardhat network and Goerli test network

## How to use
- Connect to the dapp with metamask and use either Local Hardhat or Goerli test network
- You can create your profile on the "profile" page and also add multiple NFTs and select them as your profile picture
- Once you created your profile you can post on the "home" page and tip other users' posts. Most tipped post is shown first.

## Technologies
- Javascript
- NodeJS
- Solidity version ^0.8.4
- Ethers.js
- Hardhat
- IPFS
- React
- Metamask
- OpenZeppelin
- Chai for testing

## Requirements for the first Setup
- NodeJS
- Hardhat
- Metamask

## Setting up
- Clone repository
- Install dependencies with "npm install"
- Enter your Infura projectId, projectSecret and gateway at: \src\Home.js and \src\Profile.js files
- Run "npm run hardhatNode"
- Add Hardhat network to Metamask and account from the list of accounts you get from "npm run hardhatNode"
- Run "npm run deploy" in other cmd
- Run "npm run start"
- Connect to website using metamask and start using app

## Running tests
- To run test in cmd run "npx run test"
