//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract CryptoSocialNetwork is ERC721URIStorage {
    uint256 public tokenCount; //default = 0
    uint256 public postCount; //default = 0
    mapping(uint256 => Post) public posts;
    //address -> nftID (jedan nft po profilu)
    mapping(address => uint256) public profileNFTs;

    struct Post {
        uint256 id;
        string hash;
        uint256 tipAmount;
        address payable author;
    }

    event PostCreated(
        uint256 id,
        string hash,
        uint256 tipAmount,
        address payable author
    );

    event PostTipped(
        uint256 id,
        string hash,
        uint256 tipAmount,
        address payable author
    );

    constructor() ERC721("CryptoSocialNetwork", "CSN") {}

    function mint(string memory _tokenURI) external returns (uint256) {
        tokenCount++;
        _safeMint(msg.sender, tokenCount); //inherited funkcija
        _setTokenURI(tokenCount, _tokenURI);
        setProfileNFT(tokenCount);
        return (tokenCount);
    }

    function setProfileNFT(uint256 _id) public {
        require(
            ownerOf(_id) == msg.sender,
            "You must own NFT that you want to use for your profile"
        );

        profileNFTs[msg.sender] = _id;
    }

    function uploadPost(string memory _postHash) external {
        require(balanceOf(msg.sender)> 0, "Must own a CryptoSocialNetwork nft to post");

        //Make sure the post hash exists
        require(bytes(_postHash).length > 0, "Cannot pass an empty hash");

        postCount++;
        posts[postCount] = Post(postCount, _postHash, 0, payable(msg.sender));

        emit PostCreated(postCount, _postHash, 0, payable(msg.sender));
    }

    function tipPostOwner(uint256 _id) external payable {
        require(_id > 0 && _id <= postCount, "Invalid post id");
        
        //Kloniranje posta
        Post memory _post = posts[_id];

        require(_post.author != msg.sender, "Cannot tip your own post");

        _post.author.transfer(msg.value);
        _post.tipAmount += msg.value;

        //Update posta
        posts[_id] = _post;

        emit PostTipped(_id, _post.hash, _post.tipAmount, _post.author);
    }

    // Dohvati sve postove
    function getAllPosts() external view returns(Post[] memory) {
        //pravimo novi array, alternativa returns(Post[] memory _posts) 
        //i onda ga ne treba deklarirati ovdje nego samo koristiti _posts)
        Post[] memory _posts = new Post[](postCount);  //pošto je array length je odma 2, iako je prazan prije "for-a"
        for (uint256 i = 0; i < _posts.length; i++) {
            _posts[i] = posts[i+1];
        }
        return _posts;
    }

    //Dohvaća sve NFTove usera
    function getMyNfts() external view returns(uint256[] memory) {
        uint256[] memory _ids = new uint256[](balanceOf(msg.sender));
        uint256 currentIndex; //0
        uint256 _tokenCount = tokenCount;
        for (uint256 i = 0; i < _tokenCount; i++) {
            if (ownerOf(i+1) == msg.sender) {
                _ids[currentIndex] = i+1;
                currentIndex++;
            }
        }
        return _ids;
    }


}
