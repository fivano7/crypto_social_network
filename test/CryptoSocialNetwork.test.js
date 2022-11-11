const { expect } = require("chai");
const { deepCopy } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("CryptoSocialNetwork", function () {

    let deployer, user1, user2, users
    let cryptoSocialNetworkInstance;
    let URI = "nekiURI"
    let postHash = "nekiHash"

    beforeEach(async () => {
        //prva 3 se smještaju u svoje varijable, a ostali od users
        //što znači da je 4. po redu users[0], ove prije ignorira
        [deployer, user1, user2, ...users] = await ethers.getSigners();

        const CryptoSocialNetwork = await ethers.getContractFactory("CryptoSocialNetwork")
        cryptoSocialNetworkInstance = await CryptoSocialNetwork.deploy()
        await cryptoSocialNetworkInstance.connect(user1).mint(URI)
    })

    describe("Deployment", () => {
        it("Has a name and symbol", async () => {
            const nftName = "CryptoSocialNetwork"
            const nftSymbol = "CSN"

            const name = await cryptoSocialNetworkInstance.name()
            const symbol = await cryptoSocialNetworkInstance.symbol()
            expect(name).to.equal(nftName)
            expect(symbol).to.equal(nftSymbol)
        })
    })

    describe("Minting NFTs", () => {
        it("Should track each minted NFT", async () => {
            //user1 minta
            expect(await cryptoSocialNetworkInstance.tokenCount()).to.equal(1)
            expect(await cryptoSocialNetworkInstance.balanceOf(user1.address)).to.equal(1)
            expect(await cryptoSocialNetworkInstance.tokenURI(1)).to.equal(URI)

            //user2 minta
            await cryptoSocialNetworkInstance.connect(user2).mint(URI)
            expect(await cryptoSocialNetworkInstance.tokenCount()).to.equal(2)
            expect(await cryptoSocialNetworkInstance.balanceOf(user2.address)).to.equal(1)
            expect(await cryptoSocialNetworkInstance.tokenURI(2)).to.equal(URI)
        })
    })

    describe("Setting profileNFTs", () => {
        it("Should allow users to select which NFT they own to represent their profile", async () => {
            //user1 minta drugi NFT
            await cryptoSocialNetworkInstance.connect(user1).mint(URI)

            //po defaultu korisnička slika usera je njegov posljednje mintani NFT
            expect(await cryptoSocialNetworkInstance.profileNFTs(user1.address)).to.equal(2) //drugi mintani

            //user1 postavlja profilnu sliku na prvi NFT koji je mintao (u beforeEach)
            await cryptoSocialNetworkInstance.connect(user1).setProfileNFT(1)
            expect(await cryptoSocialNetworkInstance.profileNFTs(user1.address)).to.equal(1)

            //FAIL -> user2 pokuša staviti za profilnu sliku nft čiji je vlasnik user1
            await expect(cryptoSocialNetworkInstance.connect(user2).setProfileNFT(2)).to.be.revertedWith("You must own NFT that you want to use for your profile")
        })
    })

    describe('Uploading posts', async () => {
        it("Should track posts uploaded only by users who own an NFT", async function () {
            // user1 uploada post
            await expect(cryptoSocialNetworkInstance.connect(user1).uploadPost(postHash))
                .to.emit(cryptoSocialNetworkInstance, "PostCreated")
                .withArgs(
                    1,
                    postHash,
                    0,
                    user1.address
                )
            const postCount = await cryptoSocialNetworkInstance.postCount()
            expect(postCount).to.equal(1);

            // provjera stukture
            const post = await cryptoSocialNetworkInstance.posts(postCount)
            expect(post.id).to.equal(1)
            expect(post.hash).to.equal(postHash)
            expect(post.tipAmount).to.equal(0)
            expect(post.author).to.equal(user1.address)

            // FAIL 1: user2 pokuša uploadati post bez da posjeduje NFT
            await expect(
                cryptoSocialNetworkInstance.connect(user2).uploadPost(postHash)
            ).to.be.revertedWith("Must own a CryptoSocialNetwork nft to post");

            // FAIL 2: user1 pokuša uploadati post bez hasha (sadržaja)
            await expect(
                cryptoSocialNetworkInstance.connect(user1).uploadPost("")
            ).to.be.revertedWith("Cannot pass an empty hash");
        });
    })

    describe("Tipping posts", () => {
        it("Should allow users to tip posts and trach each posts tip amount", async () => {
            //user1 uploada post
            await cryptoSocialNetworkInstance.connect(user1).uploadPost(postHash)

            //Balance prije tippa
            const initAuthorBalance = await ethers.provider.getBalance(user1.address)

            const tipAmount = ethers.utils.parseEther("1")

            await expect(cryptoSocialNetworkInstance.connect(user2).tipPostOwner(1, { value: tipAmount }))
                .to.emit(cryptoSocialNetworkInstance, "PostTipped")
                .withArgs(
                    1, postHash, tipAmount, user1.address
                )

            //provjerit da je tipAmount updatean u strukturi
            const post = await cryptoSocialNetworkInstance.posts(1)
            expect(post.tipAmount).to.equal(tipAmount)

            //provjera primitka ethera
            const finalAuthorBalance = await ethers.provider.getBalance(user1.address)
            expect(finalAuthorBalance).to.equal(initAuthorBalance.add(tipAmount))

            //FAIL 1: tippanje posta koji ne postoji ()
            await expect(cryptoSocialNetworkInstance.connect(user2).tipPostOwner(2)).to.be.revertedWith("Invalid post id")

            //FAIL 2: user1 sam sebe tipa
            await expect(cryptoSocialNetworkInstance.connect(user1).tipPostOwner(1)).to.be.revertedWith("Cannot tip your own post")
        })
    })

    describe("Getter functions", function () {
        let ownedByUser1 = [1, 2]
        let ownedByUser2 = [3]W
        beforeEach(async function () {
            // user1 posta
            await cryptoSocialNetworkInstance.connect(user1).uploadPost(postHash)
            // user1 minta drugi NFT
            await cryptoSocialNetworkInstance.connect(user1).mint(URI)
            // user2 minta NFT
            await cryptoSocialNetworkInstance.connect(user2).mint(URI)
            // user2 posta
            await cryptoSocialNetworkInstance.connect(user2).uploadPost(postHash)
        })

        it("getAllPosts should fetch all the posts", async () => {
            const allPosts = await cryptoSocialNetworkInstance.getAllPosts()
            expect(allPosts.length).to.equal(2)
        });
        it("getMyNfts should fetch all nfts the user owns", async () => {
            const user1Nfts = await cryptoSocialNetworkInstance.connect(user1).getMyNfts()
            expect(user1Nfts.length).to.equal(2)
            const user2Nfts = await cryptoSocialNetworkInstance.connect(user2).getMyNfts()
            expect(user2Nfts.length).to.equal(1)
        });
    });


});
