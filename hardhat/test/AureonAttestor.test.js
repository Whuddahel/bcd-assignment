const { expect } = require("chai")
const { ethers } = require("hardhat")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")

describe("AureonAttestor", function () {
  let attestor
  let deployer, admin, stranger

  const TOKEN_ID = 1n
  const CERT_HASH = "ipfs://QmDemoCertificateHash"

  beforeEach(async function () {
    ;[deployer, admin, stranger] = await ethers.getSigners()
    const AureonAttestor = await ethers.getContractFactory("AureonAttestor")
    // deployer is also the attestor signer here.
    attestor = await AureonAttestor.deploy(deployer.address)
    await attestor.waitForDeployment()
    // Approve `admin` as an attestor.
    await attestor.grantAttestorRole(admin.address)
  })

  it("only approved attestors can attest", async function () {
    await expect(
      attestor.connect(stranger).attestAuthenticity(TOKEN_ID, CERT_HASH),
    ).to.be.revertedWithCustomError(attestor, "AccessControlUnauthorizedAccount")

    await expect(attestor.connect(admin).attestAuthenticity(TOKEN_ID, CERT_HASH)).to.not.be.reverted
  })

  it("emits AuthenticityAttested with correct args", async function () {
    await expect(attestor.connect(admin).attestAuthenticity(TOKEN_ID, CERT_HASH))
      .to.emit(attestor, "AuthenticityAttested")
      .withArgs(TOKEN_ID, admin.address, CERT_HASH, anyValue)
  })

  it("cannot attest the same token twice", async function () {
    await attestor.connect(admin).attestAuthenticity(TOKEN_ID, CERT_HASH)
    await expect(
      attestor.connect(admin).attestAuthenticity(TOKEN_ID, "ipfs://another"),
    ).to.be.revertedWith("AureonAttestor: already attested")
  })

  it("getAttestation returns the correct data for an attested token", async function () {
    await attestor.connect(admin).attestAuthenticity(TOKEN_ID, CERT_HASH)
    const a = await attestor.getAttestation(TOKEN_ID)
    expect(a.attestor).to.equal(admin.address)
    expect(a.certHash).to.equal(CERT_HASH)
    expect(a.exists).to.equal(true)
    expect(a.timestamp).to.be.greaterThan(0n)
    expect(await attestor.isAttested(TOKEN_ID)).to.equal(true)
  })

  it("getAttestation returns exists=false for an unattested token", async function () {
    const a = await attestor.getAttestation(999n)
    expect(a.exists).to.equal(false)
    expect(a.attestor).to.equal(ethers.ZeroAddress)
    expect(await attestor.isAttested(999n)).to.equal(false)
  })

  it("a non-admin cannot grant attestor roles", async function () {
    await expect(
      attestor.connect(stranger).grantAttestorRole(stranger.address),
    ).to.be.revertedWithCustomError(attestor, "AccessControlUnauthorizedAccount")
  })
})
