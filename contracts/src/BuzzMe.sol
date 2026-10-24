// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title BuzzMe
/// @notice A pay-to-rank billboard paid in **USDC only**. MON is never accepted as payment; it is
///         only used for gas. The settlement token is fixed by `usdc`, so any other ERC-20 is
///         rejected. Spend becomes rank on three boards: all-time (cumulative), today, and each
///         archived day. Every payment is split `gachaBps` to the gacha pot, the rest to the
///         treasury. The first payer of a URL owns that listing.
/// @dev Rank is a USD-normalized score with 6 decimals (1e6 = $1). Because the settlement token is
///      USDC (6 decimals) the score is the token amount as-is; the scaling stays explicit so the
///      contract still works if the token is swapped for one with different decimals.
contract BuzzMe is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint16 public constant BPS_DENOMINATOR = 10000;
    uint256 public constant USD_DECIMALS = 1e6;

    struct Listing {
        address owner;
        uint64 createdAt;
        uint256 totalUsd;
        string url;
        string title;
    }

    /// @notice Listing metadata keyed by keccak256(bytes(url)); the URL is normalized off-chain.
    mapping(bytes32 => Listing) private _listings;
    /// @notice Per-UTC-day USD spend for a listing. dayIndex = block.timestamp / 1 days.
    mapping(bytes32 => mapping(uint64 => uint256)) public dayUsd;

    bytes32[] private _keys;
    mapping(bytes32 => bool) private _exists;

    /// @notice The current all-time #1, kept so the minimum-increment rule can be enforced.
    bytes32 public topKey;
    uint256 public topUsd;

    /// @notice The only accepted payment token (Monad testnet USDC, 6 decimals).
    address public usdc;
    address public gachaPot;
    address public treasury;

    uint16 public gachaBps = 5000;
    uint256 public minSpendUsd = 10 * USD_DECIMALS;
    uint256 public minIncrementUsd = 5 * USD_DECIMALS;

    event Listed(
        bytes32 indexed key,
        address indexed owner,
        address token,
        uint256 amount,
        uint256 usd,
        string url,
        string title
    );
    event Raised(
        bytes32 indexed key, address indexed payer, address token, uint256 amount, uint256 usd
    );
    event Split(bytes32 indexed key, address token, uint256 toGacha, uint256 toTreasury);
    event ConfigChanged(
        address usdc, address gachaPot, address treasury, uint16 gachaBps, uint256 minSpendUsd, uint256 minIncrementUsd
    );

    error ZeroAddress();
    error ZeroAmount();
    error AlreadyListed();
    error NotListed();
    error NotOwner();
    error BelowMinimum();
    error IncrementTooSmall();

    constructor(address owner_, address gachaPot_, address treasury_, address usdc_)
        Ownable(owner_)
    {
        if (gachaPot_ == address(0) || treasury_ == address(0) || usdc_ == address(0)) {
            revert ZeroAddress();
        }
        gachaPot = gachaPot_;
        treasury = treasury_;
        usdc = usdc_;
    }

    // ---------------------------------------------------------------------
    // Listing
    // ---------------------------------------------------------------------

    /// @notice List a URL by paying `amount` USDC. Approve this contract for `amount` first.
    function list(string calldata url, string calldata title, uint256 amount)
        external
        returns (bytes32)
    {
        if (amount == 0) revert ZeroAmount();
        IERC20(usdc).safeTransferFrom(msg.sender, address(this), amount);
        return _list(url, title, amount);
    }

    /// @notice Raise your own listing by paying `amount` USDC. Approve this contract first.
    function raise(bytes32 key, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        IERC20(usdc).safeTransferFrom(msg.sender, address(this), amount);
        _spend(key, amount);
    }

    function _list(string calldata url, string calldata title, uint256 amount)
        private
        returns (bytes32 key)
    {
        key = keccak256(bytes(url));
        if (_exists[key]) revert AlreadyListed();

        uint256 usd = _toUsd(amount);
        if (usd < minSpendUsd) revert BelowMinimum();

        _exists[key] = true;
        _keys.push(key);
        _listings[key] = Listing({
            owner: msg.sender,
            createdAt: uint64(block.timestamp),
            totalUsd: usd,
            url: url,
            title: title
        });

        _applyRank(key, usd);
        _accountDay(key, usd);
        _split(key, amount);

        emit Listed(key, msg.sender, usdc, amount, usd, url, title);
        emit Raised(key, msg.sender, usdc, amount, usd);
    }

    function _spend(bytes32 key, uint256 amount) private {
        Listing storage listing = _listings[key];
        if (listing.owner == address(0)) revert NotListed();
        if (msg.sender != listing.owner) revert NotOwner();

        uint256 usd = _toUsd(amount);
        listing.totalUsd += usd;

        _applyRank(key, listing.totalUsd);
        _accountDay(key, usd);
        _split(key, amount);

        emit Raised(key, msg.sender, usdc, amount, usd);
    }

    /// @notice Enforce the #1 minimum-increment rule and update the top-of-board pointer.
    function _applyRank(bytes32 key, uint256 total) private {
        if (key == topKey) {
            topUsd = total;
            return;
        }
        if (total > topUsd) {
            if (total < topUsd + minIncrementUsd) revert IncrementTooSmall();
            topKey = key;
            topUsd = total;
        }
    }

    function _accountDay(bytes32 key, uint256 usd) private {
        dayUsd[key][uint64(block.timestamp / 1 days)] += usd;
    }

    function _split(bytes32 key, uint256 amount) private {
        uint256 toGacha = (amount * gachaBps) / BPS_DENOMINATOR;
        uint256 toTreasury = amount - toGacha;
        if (toGacha > 0) IERC20(usdc).safeTransfer(gachaPot, toGacha);
        if (toTreasury > 0) IERC20(usdc).safeTransfer(treasury, toTreasury);
        emit Split(key, usdc, toGacha, toTreasury);
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------

    function listingKey(string calldata url) external pure returns (bytes32) {
        return keccak256(bytes(url));
    }

    function listingCount() external view returns (uint256) {
        return _keys.length;
    }

    function keyAt(uint256 index) external view returns (bytes32) {
        return _keys[index];
    }

    function keys() external view returns (bytes32[] memory) {
        return _keys;
    }

    function isListed(bytes32 key) external view returns (bool) {
        return _exists[key];
    }

    function getListing(bytes32 key) external view returns (Listing memory) {
        return _listings[key];
    }

    function totalUsdOf(bytes32 key) external view returns (uint256) {
        return _listings[key].totalUsd;
    }

    function currentDay() external view returns (uint64) {
        return uint64(block.timestamp / 1 days);
    }

    // ---------------------------------------------------------------------
    // Admin
    // ---------------------------------------------------------------------

    function setUsdc(address usdc_) external onlyOwner {
        if (usdc_ == address(0)) revert ZeroAddress();
        usdc = usdc_;
        _emitConfig();
    }

    function setGachaPot(address gachaPot_) external onlyOwner {
        if (gachaPot_ == address(0)) revert ZeroAddress();
        gachaPot = gachaPot_;
        _emitConfig();
    }

    function setTreasury(address treasury_) external onlyOwner {
        if (treasury_ == address(0)) revert ZeroAddress();
        treasury = treasury_;
        _emitConfig();
    }

    function setGachaBps(uint16 gachaBps_) external onlyOwner {
        require(gachaBps_ <= BPS_DENOMINATOR, "bps too high");
        gachaBps = gachaBps_;
        _emitConfig();
    }

    function setMinimums(uint256 minSpendUsd_, uint256 minIncrementUsd_) external onlyOwner {
        minSpendUsd = minSpendUsd_;
        minIncrementUsd = minIncrementUsd_;
        _emitConfig();
    }

    function _emitConfig() private {
        emit ConfigChanged(usdc, gachaPot, treasury, gachaBps, minSpendUsd, minIncrementUsd);
    }

    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------

    /// @notice Normalize a settlement-token amount to the 6-decimal USD score.
    function _toUsd(uint256 amount) private view returns (uint256) {
        uint8 decimals = IERC20Metadata(usdc).decimals();
        return (amount * USD_DECIMALS) / (10 ** decimals);
    }
}
