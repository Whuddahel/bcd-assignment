require("@nomicfoundation/hardhat-toolbox")

/**
 * Aureon local blockchain configuration.
 *
 * Everything runs against a local Hardhat node (chainId 31337) — no testnet,
 * no wallet extension. The commented sepolia block shows how a real network
 * would slot in later without changing any application code.
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
    // Future: real network deployment — supply keys via env vars, no code change.
    // sepolia: {
    //   url: process.env.SEPOLIA_RPC_URL || "",
    //   accounts: process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [],
    //   chainId: 11155111,
    // },
  },
}
