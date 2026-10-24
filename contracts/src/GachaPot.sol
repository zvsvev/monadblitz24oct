// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title GachaPot
/// @notice The Supaboard reward pot, funded by 50% of placement revenue plus any direct top-ups.
///         A role-gated `payer` (the Supaboard backend) draws prizes. Each spin is committed to
///         before it is revealed, so the outcome is verifiable against the pre-committed hash, and
///         payouts are always bounded by the pot balance for the relevant token.
contract GachaPot is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @dev Off-chain outcomes (zonk, super zonk) never reach this contract; they pay nothing.
    uint8 public constant TIER_ZONK = 0;
    uint8 public constant TIER_MON = 1;
    uint8 public constant TIER_BIG_MON = 2;
    uint8 public constant TIER_USDC = 3;
    uint8 public constant TIER_BIG_USDC = 4;

    address public payer;
    mapping(address => bytes32) public commitmentOf;

    event Funded(address indexed from, uint256 amount);
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

    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }

    function setPayer(address payer_) external onlyOwner {
        if (payer_ == address(0)) revert ZeroAddress();
        payer = payer_;
        emit PayerChanged(payer_);
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
