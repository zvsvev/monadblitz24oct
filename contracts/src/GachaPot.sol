// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title GachaPot
/// @notice The BuzzMe reward pot, funded by 50% of placement revenue plus any direct top-ups, and
///         paid out in **USDC only** (MON is never a prize; it is only gas). A role-gated `payer`
///         (the BuzzMe backend) draws prizes. Each spin is committed to before it is revealed, so
///         the outcome is verifiable against the pre-committed hash.
/// @dev The prize ladder lives on-chain in `tierAmount`, so the published odds and the paid amounts
///      cannot drift apart. The probabilities themselves are off-chain (the payer's draw); they are
///      published on the frontend. Payouts are always bounded by the pot balance, and the payer is
///      expected to clamp a draw down to what the pot can cover.
contract GachaPot is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev Zonk pays nothing, so it never moves tokens.
    uint8 public constant TIER_ZONK = 0;
    uint8 public constant TIER_USDC_0_01 = 1;
    uint8 public constant TIER_USDC_0_05 = 2;
    uint8 public constant TIER_USDC_1 = 3;
    uint8 public constant TIER_USDC_10 = 4;
    uint8 public constant TIER_USDC_50 = 5;
    uint8 public constant TIER_USDC_100 = 6;
    uint8 public constant TIER_COUNT = 7;

    address public payer;
    mapping(address => bytes32) public commitmentOf;

    event Funded(address indexed from, address token, uint256 amount);
    event PayerChanged(address payer);
    event Committed(address indexed player, bytes32 commitment);
    event Revealed(address indexed player, uint8 tier, uint256 amount);
    event Paid(address indexed player, address token, uint256 amount, uint8 tier);

    error NotPayer();
    error Insolvent();
    error NoCommitment();
    error CommitmentMismatch();
    error TransferFailed();
    error ZeroAddress();

    modifier onlyPayer() {
        if (msg.sender != payer) revert NotPayer();
        _;
    }

    constructor(address owner_, address payer_) Ownable(owner_) {
        if (payer_ == address(0)) revert ZeroAddress();
        payer = payer_;
    }

    /// @notice Stray native MON is accepted but is not a prize; the pot pays USDC.
    receive() external payable {
        emit Funded(msg.sender, address(0), msg.value);
    }

    function setPayer(address payer_) external onlyOwner {
        if (payer_ == address(0)) revert ZeroAddress();
        payer = payer_;
        emit PayerChanged(payer_);
    }

    /// @notice The nominal prize for a tier, in 6-decimal USDC units. This is the published ladder.
    function tierAmount(uint8 tier) public pure returns (uint256) {
        if (tier == TIER_USDC_0_01) return 10_000;
        if (tier == TIER_USDC_0_05) return 50_000;
        if (tier == TIER_USDC_1) return 1_000_000;
        if (tier == TIER_USDC_10) return 10_000_000;
        if (tier == TIER_USDC_50) return 50_000_000;
        if (tier == TIER_USDC_100) return 100_000_000;
        return 0;
    }

    /// @notice Commit to a spin for `player`. commitment = keccak256(abi.encode(player, tier, amount, nonce)).
    function commitSpin(address player, bytes32 commitment) external onlyPayer {
        commitmentOf[player] = commitment;
        emit Committed(player, commitment);
    }

    /// @notice Reveal and pay a spin. The encoded tuple must match the commitment.
    function revealSpin(address player, uint8 tier, uint256 amount, bytes32 nonce, address token)
        external
        onlyPayer
        nonReentrant
    {
        bytes32 commitment = commitmentOf[player];
        if (commitment == bytes32(0)) revert NoCommitment();
        if (keccak256(abi.encode(player, tier, amount, nonce)) != commitment) {
            revert CommitmentMismatch();
        }
        delete commitmentOf[player];
        emit Revealed(player, tier, amount);

        if (amount > 0) {
            _pay(token, player, amount);
            emit Paid(player, token, amount, tier);
        }
    }

    /// @notice Current pot balance for a token; address(0) means native MON.
    function potBalance(address token) external view returns (uint256) {
        return token == address(0) ? address(this).balance : IERC20(token).balanceOf(address(this));
    }

    function _pay(address token, address to, uint256 amount) private {
        if (token == address(0)) {
            if (address(this).balance < amount) revert Insolvent();
            (bool ok,) = to.call{value: amount}("");
            if (!ok) revert TransferFailed();
        } else {
            if (IERC20(token).balanceOf(address(this)) < amount) revert Insolvent();
            IERC20(token).safeTransfer(to, amount);
        }
    }
}
