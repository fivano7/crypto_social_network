import { useState, useEffect } from "react"
import { Row, Form, Button, Card, Col } from 'react-bootstrap';
import { create as ipfsHttpClient } from "ipfs-http-client";
import { Buffer } from 'buffer';
import './App.css';

const projectId = 'INSERT_YOUR_PROJECT_ID'
const projectSecret = 'INSERT_YOUR_PROJECT_SECRET'
const GATEWAY = "INSERT_YOUR_GATEWAY"
const subdomain = `https://${GATEWAY}.infura-ipfs.io`;

const authorization = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString('base64')

const client = ipfsHttpClient({
    host: "infura-ipfs.io",
    port: 5001,
    protocol: "https",
    headers: {
        authorization: authorization,
    },
});

const Profile = ({ contract }) => {
    const [loading, setLoading] = useState(true)
    const [nfts, setNfts] = useState("")
    const [avatar, setAvatar] = useState("")
    const [username, setUsername] = useState("")
    const [profile, setProfile] = useState("")

    const loadMyNFTs = async () => {
        //učitaj NFT id-eve usera
        const results = await contract.getMyNfts()

        //nfts je array, ovo radi slično kao yield return
        let nfts = await Promise.all(
            results.map(async i => {
                const uri = await contract.tokenURI(i) //uri NFT-a .json
                const response = await fetch(uri)
                const metadata = await response.json()

                return ({
                    id: i,
                    username: metadata.username,
                    avatar: metadata.avatar
                })

            }))

        setNfts(nfts)
        getProfile(nfts)
    }

    const getProfile = async (nfts) => {
        const address = await contract.signer.getAddress()
        const id = await contract.profileNFTs(address)
        const profile = nfts.find((i) => i.id.toString() === id.toString())
        setProfile(profile)
        setLoading(false)
    }

    //uploada NFT SLIKU na IPFS
    const uploadToIpfs = async (event) => {
        event.preventDefault()
        //iz eventa vadimo selectani file
        const file = event.target.files[0]
        if (typeof(file) !== "undefined") {
            try {
                const result = await client.add(file)
                setAvatar(`${subdomain}/ipfs/${result.path}`)
            } catch (error) {
                window.alert("IPFS image upload error: ", error)
            }
        }
    }

    //uploada NFT METADATA na IPFS
    const mintProfile = async (event) => {
        if (!avatar || !username) return

        try {
            //dohvaća link na uploadanu NFT sliku kroz "avatar"
            const result = await client.add(JSON.stringify({ avatar, username }))
            setLoading(true)
            const transaction = await contract.mint(`${subdomain}/ipfs/${result.path}`)
            await transaction.wait()
            loadMyNFTs()

        } catch (error) {
            window.alert("IPFS URI upload error: ", error)
        }
    }

    const switchProfile = async (nft) => {
        setLoading(true)
        const transaction = await contract.setProfileNFT(nft.id)
        await transaction.wait()
        getProfile(nfts)
    }

    useEffect(() => {
        if (!nfts) {
            loadMyNFTs()
        }
    })

    if (loading) return (
        <div className="text-center">
            <main style={{ padding: "1rem 0" }}>
                <h2>Loading...</h2>
            </main>
        </div>
    )

    return (
        <div className="mt-4 text-center">
            {profile ? (
                <div className="mb-3">
                    <h3 className="mb-3">{profile.username}</h3>
                    <img className="mb-3" style={{ width: "400px" }} src={profile.avatar} alt="" />
                </div>) :
                (<h4 className="mb-4">No NFT profile, please create one...</h4>)
            }

            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: "1000px" }}>
                    <div className="content mx-auto">
                        <Row className="g-4">
                            <Form.Control
                                type="file"
                                required
                                name="file"
                                onChange={uploadToIpfs}
                            />
                            {profile ? (
                                undefined
                            ) : (
                                <Form.Control onChange={(e) => setUsername(e.target.value)} size="lg" required type="text" placeholder="Username" />
                            )}

                            <div className="d-grid px-0">
                                <Button onClick={mintProfile} variant="primary" size="lg">
                                    Mint NFT Profile
                                </Button>
                            </div>
                        </Row>
                    </div>
                </main>
            </div>
            <div className="px-5 container">
                <Row xs={1} md={2} lg={4} className="g-4 py-5">
                    {nfts.map((nft, idx) => {
                        if (nft.id === profile.id) return
                        return (
                            <Col key={idx} className="overflow-hidden">
                                <Card>
                                    <Card.Img variant="top" src={nft.avatar} />
                                    <Card.Footer>
                                        <div className="d-grid">
                                            <Button onClick={() => switchProfile(nft)} variant="primary" size="lg">
                                                Set as profile
                                            </Button>
                                        </div>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        )
                    })}
                </Row>
            </div>
        </div>
    )
}

export default Profile