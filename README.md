# Blockchain-Based Document Verification System

## Folder Structure
```
projectphase2/
├── frontend/                  ← React.js app (created in Step 5)
├── backend/                   ← Node.js + Express
│   ├── config/                ← DB connection
│   ├── controllers/           ← Route logic
│   ├── middleware/            ← Auth middleware
│   ├── models/                ← Mongoose schemas
│   ├── routes/                ← API routes
│   ├── uploads/               ← Uploaded documents
│   └── server.js              ← Entry point
└── smart-contract/
    ├── contracts/             ← Solidity .sol files
    └── scripts/               ← Deploy scripts
```

## Tech Stack
- Frontend: React.js + Ethers.js
- Backend: Node.js + Express.js
- Database: MongoDB
- Blockchain: Ethereum (Ganache + Solidity)
