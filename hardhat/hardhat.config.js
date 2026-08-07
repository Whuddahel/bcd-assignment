require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

/**
 * Aureon blockchain configuration.
 *
 * Two ways to run this:
 *  - Local (default, no keys needed): a Hardhat node at chainId 31337.
 *  - Sepolia testnet (free): set SEPOLIA_RPC_URL + DEPLOYER_KEY in hardhat/.env
 *    (gitignored — see hardhat/.env.example), then
 *    `npm run deploy:sepolia`. No code changes needed either way — the app
 *    reads whichever network's addresses `scripts/deploy.js` last wrote to
 *    ../src/lib/blockchain/deployments.json.
 *
 * @type {import('hardhat/config').HardhatUserConfig}
 */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // OpenZeppelin v5.4 uses the `mcopy` opcode (Cancun). The local Hardhat
      // node runs the Cancun hardfork by default, so target it here too.
      evmVersion: "cancun",
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Free public testnet — no paid RPC provider required. Override
    // SEPOLIA_RPC_URL in hardhat/.env if you'd rather use your own
    // Alchemy/Infura endpoint (higher rate limits than the public one).
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
      chainId: 11155111,
    },
  },
}
