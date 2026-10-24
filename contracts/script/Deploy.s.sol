// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {BuzzMe} from "../src/BuzzMe.sol";
import {GachaPot} from "../src/GachaPot.sol";

/// @notice Reference deploy script. The Blitz deploy goes through an Alchemy Agent Wallet session
///         as CREATE2 through the canonical CreateX factory (see the monskills `wallet` skill);
///         this script documents the constructor wiring and is the local/fallback path.
///
///   OWNER=0x.. TREASURY=0x.. PAYER=0x.. USDC=0x.. \
///     forge script script/Deploy.s.sol --rpc-url $MONAD_TESTNET_RPC --broadcast
contract Deploy is Script {
    /// @dev Monad testnet USDC, 6 decimals.
    address constant DEFAULT_USDC = 0x534b2f3A21130d7a60830c2Df862319e593943A3;

    function run() external {
        address owner = vm.envOr("OWNER", msg.sender);
        address treasury = vm.envOr("TREASURY", msg.sender);
        address payer = vm.envOr("PAYER", msg.sender);
        address usdc = vm.envOr("USDC", DEFAULT_USDC);

        vm.startBroadcast();

        GachaPot pot = new GachaPot(owner, payer);
        BuzzMe board = new BuzzMe(owner, address(pot), treasury, usdc);

        vm.stopBroadcast();

        console.log("GachaPot   ", address(pot));
        console.log("BuzzMe     ", address(board));
        console.log("usdc       ", usdc);
        console.log("owner      ", owner);
        console.log("treasury   ", treasury);
        console.log("payer      ", payer);
    }
}
