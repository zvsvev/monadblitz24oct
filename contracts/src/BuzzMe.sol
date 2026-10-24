// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title BuzzMe
/// @notice A pay-to-rank billboard. Anyone lists a URL by paying in native MON or an ERC-20
///         (testnet USDC). Spend becomes rank on three boards: all-time (cumulative), today, and
///         each archived day. Every payment is split `gachaBps` to the gacha pot, the rest to the
///         treasury. The first payer of a URL owns that listing.
/// @dev Rank is a USD-normalized score with 6 decimals (1e6 = $1). USDC-like tokens normalize by
///      their own decimals; MON normalizes through `monUsdRate`, an owner-set demonstration rate
///      (a real chain would point this at a price oracle).
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

    address public gachaPot;
    address public treasury;

    uint16 public gachaBps = 5000;
    uint256 public minSpendUsd = 10 * USD_DECIMALS;
    uint256 public minIncrementUsd = 5 * USD_DECIMALS;
    /// @notice USD per 1 MON, 6 decimals (1e6 = $1 per MON). Demonstration rate.
    uint256 public monUsdRate = 1e6;

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
        address gachaPot,
        address treasury,
        uint16 gachaBps,
        uint256 minSpendUsd,
        uint256 minIncrementUsd,
        uint256 monUsdRate
    );

    error ZeroAddress();
    error NoValue();
    error AlreadyListed();
    error NotListed();
    error NotOwner();
    error BelowMinimum();
    error IncrementTooSmall();

    constructor(address owner_, address gachaPot_, address treasury_) Ownable(owner_) {
        if (gachaPot_ == address(0) || treasury_ == address(0)) revert ZeroAddress();
        gachaPot = gachaPot_;
        treasury = treasury_;
    }

    // ---------------------------------------------------------------------
    // Listing
    // ---------------------------------------------------------------------

    /// @notice List a URL with a native MON payment. The funded amount is msg.value.
    function list(string calldata url, string calldata title) external payable returns (bytes32) {
        if (msg.value == 0) revert NoValue();
        return _list(url, title, address(0), msg.value);
    }

    /// @notice List a URL with an ERC-20 payment. Approve this contract for `amount` first.
    function listERC20(string calldata url, string calldata title, address token, uint256 amount)
        external
        returns (bytes32)
    {
        if (token == address(0)) revert ZeroAddress();
        if (amount == 0) revert NoValue();
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        return _list(url, title, token, amount);
    }

    /// @notice Raise your own listing with a native MON payment.
    function raise(bytes32 key) external payable {
        if (msg.value == 0) revert NoValue();
        _spend(key, address(0), msg.value);
    }

    /// @notice Raise your own listing with an ERC-20 payment. Approve this contract first.
    function raiseERC20(bytes32 key, address token, uint256 amount) external {
        if (token == address(0)) revert ZeroAddress();
        if (amount == 0) revert NoValue();
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        _spend(key, token, amount);
    }

    function _list(string calldata url, string calldata title, address token, uint256 amount)
        private
        returns (bytes32 key)
    {
        key = keccak256(bytes(url));
        if (_exists[key]) revert AlreadyListed();

        uint256 usd = _toUsd(token, amount);
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
        _split(key, token, amount);

        emit Listed(key, msg.sender, token, amount, usd, url, title);
        emit Raised(key, msg.sender, token, amount, usd);
    }

    function _spend(bytes32 key, address token, uint256 amount) private {
        Listing storage listing = _listings[key];
        if (listing.owner == address(0)) revert NotListed();
        if (msg.sender != listing.owner) revert NotOwner();

        uint256 usd = _toUsd(token, amount);
        listing.totalUsd += usd;

        _applyRank(key, listing.totalUsd);
        _accountDay(key, usd);
        _split(key, token, amount);

        emit Raised(key, msg.sender, token, amount, usd);
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

    function _split(bytes32 key, address token, uint256 amount) private {
        uint256 toGacha = (amount * gachaBps) / BPS_DENOMINATOR;
        uint256 toTreasury = amount - toGacha;
        _pay(token, gachaPot, toGacha);
        _pay(token, treasury, toTreasury);
        emit Split(key, token, toGacha, toTreasury);
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

    /// @notice Set the demonstration MON/USD rate: USD per 1 MON with 6 decimals.
    function setMonUsdRate(uint256 monUsdRate_) external onlyOwner {
        require(monUsdRate_ > 0, "rate zero");
        monUsdRate = monUsdRate_;
        _emitConfig();
    }

    function _emitConfig() private {
        emit ConfigChanged(
            gachaPot, treasury, gachaBps, minSpendUsd, minIncrementUsd, monUsdRate
        );
    }

    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------

    function _toUsd(address token, uint256 amount) private view returns (uint256) {
        if (token == address(0)) {
            // amount is 18-decimal wei; monUsdRate is USD(6dp) per 1 MON.
            return (amount * monUsdRate) / 1e18;
        }
        uint8 decimals = IERC20Metadata(token).decimals();
        return (amount * USD_DECIMALS) / (10 ** decimals);
    }

    function _pay(address token, address to, uint256 amount) private {
        if (amount == 0) return;
        if (token == address(0)) {
            (bool ok,) = to.call{value: amount}("");
            require(ok, "native transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }
}
