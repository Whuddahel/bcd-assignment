const { expect } = require("chai")
const { ethers } = require("hardhat")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")

describe("AureonAsset", function () {
  let asset
  let deployer, seller, buyer, stranger

  const PRODUCT_ID = 1001n
  const METADATA = JSON.stringify({ title: "Patek Philippe Nautilus", supabaseId: "demo-uuid" })

  beforeEach(async function () {
    ;[deployer, seller, buyer, stranger] = await ethers.getSigners()
    const AureonAsset = await ethers.getContractFactory("AureonAsset")
    // deployer is also the operator here.
    asset = await AureonAsset.deploy(deployer.address)
    await asset.waitForDeployment()
    // Approve `seller` as a minter.
    await asset.grantSellerRole(seller.address)
  })

  describe("minting", function () {
    it("only approved sellers can mint", async function () {
      await expect(
        asset.connect(stranger).mintDigitalTwin(PRODUCT_ID, seller.address, METADATA),
      ).to.be.revertedWithCustomError(asset, "AccessControlUnauthorizedAccount")

      // Approved seller succeeds.
      await expect(asset.connect(seller).mintDigitalTwin(PRODUCT_ID, seller.address, METADATA)).to.not.be.reverted
    })

    it("emits DigitalTwinMinted with correct args", async function () {
      await expect(asset.connect(seller).mintDigitalTwin(PRODUCT_ID, seller.address, METADATA))
        .to.emit(asset, "DigitalTwinMinted")
        .withArgs(1n, PRODUCT_ID, seller.address, anyValue)
    })

    it("assigns ownership to the seller and records the product mapping", async function () {
      await asset.connect(seller).mintDigitalTwin(PRODUCT_ID, seller.address, METADATA)
      expect(await asset.ownerOf(1n)).to.equal(seller.address)
      expect(await asset.tokenOfProduct(PRODUCT_ID)).to.equal(1n)
      expect(await asset.totalMinted()).to.equal(1n)
    })

    it("cannot mint the same product twice", async function () {
      await asset.connect(seller).mintDigitalTwin(PRODUCT_ID, seller.address, METADATA)
      await expect(
        asset.connect(seller).mintDigitalTwin(PRODUCT_ID, seller.address, METADATA),
      ).to.be.revertedWith("AureonAsset: product already minted")
    })
  })

  describe("provenance", function () {
    it("returns the correct history after mint", async function () {
      await asset.connect(seller).mintDigitalTwin(PRODUCT_ID, seller.address, METADATA)
      const history = await asset.getProvenance(1n)
      expect(history.length).to.equal(1)
      expect(history[0].owner).to.equal(seller.address)
      expect(history[0].eventType).to.equal("Minted")
    })

    it("returns the correct history after a transfer", async function () {
      await asset.connect(seller).mintDigitalTwin(PRODUCT_ID, seller.address, METADATA)
      await asset.connect(seller).transferAsset(1n, buyer.address)

      const history = await asset.getProvenance(1n)
      expect(history.length).to.equal(2)
      expect(history[0].eventType).to.equal("Minted")
      expect(history[0].owner).to.equal(seller.address)
      expect(history[1].eventType).to.equal("Transferred")
      expect(history[1].owner).to.equal(buyer.address)
      expect(await asset.ownerOf(1n)).to.equal(buyer.address)
    })
  })

  describe("transfer authorisation", function () {
    beforeEach(async function () {
      await asset.connect(seller).mintDigitalTwin(PRODUCT_ID, seller.address, METADATA)
    })

    it("a non-owner, non-operator cannot transfer", async function () {
      await expect(
        asset.connect(stranger).transferAsset(1n, buyer.address),
      ).to.be.revertedWith("AureonAsset: caller is not owner or operator")
    })

    it("the current owner can transfer", async function () {
      await expect(asset.connect(seller).transferAsset(1n, buyer.address))
        .to.emit(asset, "AssetTransferred")
        .withArgs(1n, seller.address, buyer.address, anyValue)
    })

    it("the platform operator can transfer on an owner's behalf", async function () {
      // `deployer` holds OPERATOR_ROLE but does not own the token.
      await expect(asset.connect(deployer).transferAsset(1n, buyer.address))
        .to.emit(asset, "AssetTransferred")
        .withArgs(1n, seller.address, buyer.address, anyValue)
      expect(await asset.ownerOf(1n)).to.equal(buyer.address)
    })

    it("reverts when transferring to the zero address", async function () {
      await expect(
        asset.connect(seller).transferAsset(1n, ethers.ZeroAddress),
      ).to.be.revertedWith("AureonAsset: transfer to zero address")
    })
  })

  describe("role management", function () {
    it("owner can revoke a seller's minting rights", async function () {
      await asset.revokeSellerRole(seller.address)
      await expect(
        asset.connect(seller).mintDigitalTwin(PRODUCT_ID, seller.address, METADATA),
      ).to.be.revertedWithCustomError(asset, "AccessControlUnauthorizedAccount")
    })

    it("a non-owner cannot grant seller roles", async function () {
      await expect(
        asset.connect(stranger).grantSellerRole(stranger.address),
      ).to.be.revertedWithCustomError(asset, "OwnableUnauthorizedAccount")
    })
  })
})
