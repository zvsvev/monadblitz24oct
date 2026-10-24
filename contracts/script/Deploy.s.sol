// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {Supaboard} from "../src/Supaboard.sol";
import {GachaPot} from "../src/GachaPot.sol";

/// @notice Reference deploy script. The Blitz deploy goes through an Alchemy Agent Wallet session
///         as CREATE2 through the canonical CreateX factory (see the monskills `wallet` skill);
///         this script documents the constructor wiring and is the local/fallback path.
///
///   OWNER=0x.. TREASURY=0x.. PAYER=0x.. \
///     forge script script/Deploy.s.sol --rpc-url $MONAD_TESTNET_RPC --broadcast
contract Deploy is Script {
    function run() external {
        address owner = vm.envOr("OWNER", msg.sender);
        address treasury = vm.envOr("TREASURY", msg.sender);
        address payer = vm.envOr("PAYER", msg.sender);

        vm.startBroadcast();

        GachaPot pot = new GachaPot(owner, payer);
        Supaboard board = new Supaboard(owner, address(pot), treasury);

        vm.stopBroadcast();

        console.log("GachaPot   ", address(pot));
        console.log("Supaboard  ", address(board));
        console.log("owner      ", owner);
        console.log("treasury   ", treasury);
        console.log("payer      ", payer);
    }
}
