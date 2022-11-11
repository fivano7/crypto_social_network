import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useState } from "react"
import { ethers } from "ethers";
import CryptoSocialNetworkAbi from "./contractsData/cryptoSocialNetwork.json"
import CryptoSocialNetworkAddress from "./contractsData/cryptoSocialNetwork-address.json"
import Home from "./Home"
import Navigation from "./Navigation"
import Profile from "./Profile"
import './App.css';

function App() {

  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState({})

  const web3Handler = async () => {
    let accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    setAccount(accounts[0])

    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    })

    window.ethereum.on("accountsChanged", async () => {
      setLoading(true)
      web3Handler();
    })

    const provider = new ethers.providers.Web3Provider(window.ethereum)
    
    loadContract(provider)
  }

  const loadContract = async (provider) => {
    const signer = provider.getSigner()
    const network = await provider.getNetwork()
    console.log("Network Chain ID: ", network.chainId)
    const contract = new ethers.Contract(CryptoSocialNetworkAddress[network.chainId].address, CryptoSocialNetworkAbi.abi, signer)
    setContract(contract)
    setLoading(false)
  }

  return (
    <BrowserRouter>
      <div className='App'>
        <Navigation account={account} web3Handler={web3Handler} />
        <div>
          {
            loading ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <Spinner animation="border" style={{ display: "flex" }} />
                <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={
                  <Home contract={contract} />
                } />
                <Route path="/profile" element={
                  <Profile contract={contract} />
                } />
              </Routes>
            )
          }
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;