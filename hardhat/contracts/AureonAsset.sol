// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AureonAsset
 * @notice The "digital twin" of a physical collectible on the Aureon marketplace.
 *         Each approved listing is minted as a unique ERC-721 token that carries an
 *         immutable, on-chain provenance chain (mint → transfers). Authenticity
 *         attestations live in a separate contract (AureonAttestor) to keep the
 *         concerns clean.
 *
 * Roles (OpenZeppelin AccessControl):
 *  - DEFAULT_ADMIN_ROLE / Ownable owner : the platform deployer.
 *  - SELLER_ROLE   : addresses allowed to mint digital twins.
 *  - OPERATOR_ROLE : the platform's server-side signer, allowed to move an asset
 *                    on an owner's behalf when an order is delivered (buyers have
 *                    no wallets in this demo, so the platform custodies + transfers).
 */
contract AureonAsset is ERC721, AccessControl, Ownable {
    bytes32 public constant SELLER_ROLE = keccak256("SELLER_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    /// @dev Token ids start at 1 so `0` unambiguously means "not minted".
    uint256 private _nextTokenId = 1;

    struct AssetInfo {
        uint256 productId; // off-chain product reference (hashed Supabase UUID)
        address seller; // who minted the twin
        uint256 mintedAt;
        string metadataUri; // JSON blob / URI describing the item
    }

    struct ProvenanceEntry {
        address owner; // owner as of this event
        uint256 timestamp;
        string eventType; // "Minted" | "Transferred"
    }

    mapping(uint256 => AssetInfo) private _assets;
    mapping(uint256 => ProvenanceEntry[]) private _provenance;

    /// @notice productId => tokenId (0 when the product has never been minted).
    mapping(uint256 => uint256) public tokenOfProduct;

    event DigitalTwinMinted(
        uint256 indexed tokenId,
        uint256 indexed productId,
        address indexed seller,
        uint256 timestamp
    );

    event AssetTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );

    /**
     * @param operator The platform's server-side signer. Granted OPERATOR_ROLE and
     *        SELLER_ROLE so the backend can mint/transfer on the platform's behalf.
     *        Pass the deployer address itself when they are the same key.
     */
    constructor(address operator) ERC721("Aureon Digital Twin", "AUREON") Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(SELLER_ROLE, msg.sender);
        if (operator != address(0) && operator != msg.sender) {
            _grantRole(OPERATOR_ROLE, operator);
            _grantRole(SELLER_ROLE, operator);
        }
    }

    // ─── Role management (owner only) ──────────────────────────────────────────

    function grantSellerRole(address seller) external onlyOwner {
        _grantRole(SELLER_ROLE, seller);
    }

    function revokeSellerRole(address seller) external onlyOwner {
        _revokeRole(SELLER_ROLE, seller);
    }

    // ─── Minting ───────────────────────────────────────────────────────────────

    /**
     * @notice Mint the digital twin for a product. Callable by approved sellers only.
     * @param productId  Off-chain product reference (a hashed Supabase UUID).
     * @param owner      The selling user's own derived address (not the caller —
     *                   the platform operator signs on every seller's behalf, since
     *                   sellers have no wallets in this demo; see identity.ts's
     *                   `addressForUser`). Minting straight to this address, rather
     *                   than to `msg.sender`, is what makes the provenance array a
     *                   real per-user chain from the very first entry instead of
     *                   every token starting out "owned" by the same operator key.
     * @param metadataUri JSON/URI describing the item (title, images, Supabase id).
     * @return tokenId The freshly minted token id.
     */
    function mintDigitalTwin(uint256 productId, address owner, string memory metadataUri)
        external
        onlyRole(SELLER_ROLE)
        returns (uint256 tokenId)
    {
        require(tokenOfProduct[productId] == 0, "AureonAsset: product already minted");
        require(owner != address(0), "AureonAsset: mint to zero address");

        tokenId = _nextTokenId++;
        _safeMint(owner, tokenId);

        _assets[tokenId] = AssetInfo({
            productId: productId,
            seller: owner,
            mintedAt: block.timestamp,
            metadataUri: metadataUri
        });
        tokenOfProduct[productId] = tokenId;

        _provenance[tokenId].push(
            ProvenanceEntry({ owner: owner, timestamp: block.timestamp, eventType: "Minted" })
        );

        emit DigitalTwinMinted(tokenId, productId, owner, block.timestamp);
    }

    // ─── Ownership transfer ──────────────────────────────────────────────────────

    /**
     * @notice Record an ownership transfer on-chain. Callable by the current owner
     *         or the platform operator (used automatically when an order is delivered).
     */
    function transferAsset(uint256 tokenId, address newOwner) external {
        address owner = _requireOwned(tokenId);
        require(newOwner != address(0), "AureonAsset: transfer to zero address");
        require(
            msg.sender == owner || hasRole(OPERATOR_ROLE, msg.sender),
            "AureonAsset: caller is not owner or operator"
        );

        // Operator moves the token directly (no per-owner approval needed).
        _transfer(owner, newOwner, tokenId);

        _provenance[tokenId].push(
            ProvenanceEntry({ owner: newOwner, timestamp: block.timestamp, eventType: "Transferred" })
        );

        emit AssetTransferred(tokenId, owner, newOwner, block.timestamp);
    }

    // ─── Views ────────────────────────────────────────────────────────────────

    /// @notice Full ownership history for a token: [{owner, timestamp, eventType}].
    function getProvenance(uint256 tokenId) external view returns (ProvenanceEntry[] memory) {
        return _provenance[tokenId];
    }

    /// @notice Metadata recorded at mint time.
    function getAsset(uint256 tokenId) external view returns (AssetInfo memory) {
        return _assets[tokenId];
    }

    /// @notice Total number of tokens minted so far.
    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    // ─── Overrides ──────────────────────────────────────────────────────────────

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
