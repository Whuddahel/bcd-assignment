/**
 * Deploy AureonAsset + AureonAttestor to the local Hardhat node and write their
 * addresses + ABIs into the frontend so it can talk to them with zero manual
 * copy-paste.
 *
 *   npx hardhat run scripts/deploy.js --network localhost
 *
 * Output: ../src/lib/blockchain/deployments.json
 */
const fs = require("fs")
const path = require("path")
const hre = require("hardhat")

const OUTPUT = path.join(__dirname, "../../src/lib/blockchain/deployments.json")

async function main() {
  const { ethers, artifacts, network } = hre
  const [deployer] = await ethers.getSigners()

  // In the local no-wallet demo the deployer IS the platform operator/attestor:
  // the backend signs mint/attest/transfer with this same key.
  const operator = deployer.address

  console.log("→ Network:", network.name, "(chainId", (await ethers.provider.getNetwork()).chainId + ")")
  console.log("→ Deployer / operator:", operator)

  const AureonAsset = await ethers.getContractFactory("AureonAsset")
  const asset = await AureonAsset.deploy(operator)
  await asset.waitForDeployment()
  const assetAddress = await asset.getAddress()
  console.log("✓ AureonAsset    deployed:", assetAddress)

  const AureonAttestor = await ethers.getContractFactory("AureonAttestor")
  const attestorContract = await AureonAttestor.deploy(operator)
  await attestorContract.waitForDeployment()
  const attestorAddress = await attestorContract.getAddress()
  console.log("✓ AureonAttestor deployed:", attestorAddress)

  const assetArtifact = await artifacts.readArtifact("AureonAsset")
  const attestorArtifact = await artifacts.readArtifact("AureonAttestor")

  const deployments = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    rpcUrl: "http://127.0.0.1:8545",
    operator,
    deployedAt: new Date().toISOString(),
    contracts: {
      AureonAsset: { address: assetAddress, abi: assetArtifact.abi },
      AureonAttestor: { address: attestorAddress, abi: attestorArtifact.abi },
    },
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, JSON.stringify(deployments, null, 2) + "\n")

  console.log("\n✓ Wrote frontend deployment manifest →", path.relative(process.cwd(), OUTPUT))
  console.log("\nNext: seed demo data with")
  console.log("  npx hardhat run scripts/seed-demo.js --network localhost\n")
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
