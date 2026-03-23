// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DocumentVerification {

    struct Document {
        string  hash;
        address uploadedBy;
        uint256 timestamp;
    }

    // hash => Document
    mapping(string => Document) private documents;

    event DocumentStored(string hash, address uploadedBy, uint256 timestamp);

    // Store a document hash on blockchain
    function storeDocument(string memory _hash) public {
        require(bytes(documents[_hash].hash).length == 0, "Document already exists");
        documents[_hash] = Document(_hash, msg.sender, block.timestamp);
        emit DocumentStored(_hash, msg.sender, block.timestamp);
    }

    // Verify if a document hash exists on blockchain
    function verifyDocument(string memory _hash) public view returns (bool exists, address uploadedBy, uint256 timestamp) {
        Document memory doc = documents[_hash];
        if (bytes(doc.hash).length == 0) {
            return (false, address(0), 0);
        }
        return (true, doc.uploadedBy, doc.timestamp);
    }
}
