// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AureonAttestor
 * @notice Authenticity attestations for Aureon digital twins, kept separate from
 *         ownership (AureonAsset) so the two concerns evolve independently.
 *
 *         An approved attestor (an Aureon admin) records a one-time authenticity
 *         attestation for a token: who attested, a certificate hash (an IPFS hash
 *         in production, any string for the demo), and a timestamp. A token can be
 *         attested exactly once.
 */
contract AureonAttestor is AccessControl {
    bytes32 public constant ATTESTOR_ROLE = keccak256("ATTESTOR_ROLE");

    struct Attestation {
        address attestor;
        string certHash;
        uint256 timestamp;
        bool exists;
    }

    mapping(uint256 => Attestation) private _attestations;

    event AuthenticityAttested(
        uint256 indexed tokenId,
        address indexed attestor,
        string certHash,
        uint256 timestamp
    );

    /**
     * @param attestor The platform's server-side signer, granted ATTESTOR_ROLE so the
     *        backend can attest on an admin's behalf. Pass the deployer when equal.
     */
    constructor(address attestor) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ATTESTOR_ROLE, msg.sender);
        if (attestor != address(0) && attestor != msg.sender) {
            _grantRole(ATTESTOR_ROLE, attestor);
        }
    }

    // ─── Role management (admin only) ────────────────────────────────────────────

    function grantAttestorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(ATTESTOR_ROLE, account);
    }

    function revokeAttestorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(ATTESTOR_ROLE, account);
    }

    // ─── Attestation ──────────────────────────────────────────────────────────────

    /**
     * @notice Record a one-time authenticity attestation for a token. Attestors only.
     * @param tokenId  The AureonAsset token being attested.
     * @param certHash Certificate reference (IPFS hash in production; any string for demo).
     */
    function attestAuthenticity(uint256 tokenId, string memory certHash)
        external
        onlyRole(ATTESTOR_ROLE)
    {
        require(!_attestations[tokenId].exists, "AureonAttestor: already attested");

        _attestations[tokenId] = Attestation({
            attestor: msg.sender,
            certHash: certHash,
            timestamp: block.timestamp,
            exists: true
        });

        emit AuthenticityAttested(tokenId, msg.sender, certHash, block.timestamp);
    }

    // ─── Views ────────────────────────────────────────────────────────────────────

    /// @notice Attestation for a token; `exists` is false when never attested.
    function getAttestation(uint256 tokenId) external view returns (Attestation memory) {
        return _attestations[tokenId];
    }

    /// @notice Convenience boolean for the "Pending Authentication" UI state.
    function isAttested(uint256 tokenId) external view returns (bool) {
        return _attestations[tokenId].exists;
    }
}
