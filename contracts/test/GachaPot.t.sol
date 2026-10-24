// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {GachaPot} from "../src/GachaPot.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract GachaPotTest is Test {
    GachaPot pot;
    MockUSDC usdc;

    address owner = address(0xA11CE);
    address payer = address(0xCAFE);
    address alice = address(0xA1);
    address bob = address(0xB1);

    function setUp() public {
        pot = new GachaPot(owner, payer);
        usdc = new MockUSDC();
        usdc.mint(address(pot), 100e6);
    }

    function _commitment(address player, uint8 tier, uint256 amount, bytes32 nonce)
        internal
        pure
        returns (bytes32)
    {
        return keccak256(abi.encode(player, tier, amount, nonce));
    }

    function test_Funded() public {
        assertEq(pot.potBalance(address(usdc)), 100e6);
    }

    function test_TierLadder() public {
        assertEq(pot.tierAmount(pot.TIER_ZONK()), 0);
        assertEq(pot.tierAmount(pot.TIER_USDC_0_01()), 10_000, "0.01 USDC");
        assertEq(pot.tierAmount(pot.TIER_USDC_0_05()), 50_000, "0.05 USDC");
        assertEq(pot.tierAmount(pot.TIER_USDC_1()), 1_000_000, "1 USDC");
        assertEq(pot.tierAmount(pot.TIER_USDC_10()), 10_000_000, "10 USDC");
        assertEq(pot.tierAmount(pot.TIER_USDC_50()), 50_000_000, "50 USDC");
        assertEq(pot.tierAmount(pot.TIER_USDC_100()), 100_000_000, "100 USDC");
        assertEq(pot.tierAmount(99), 0, "unknown tier pays nothing");
    }

    function test_CommitRevealPaysUsdc() public {
        uint8 tier = pot.TIER_USDC_10();
        uint256 amount = pot.tierAmount(tier);
        bytes32 nonce = keccak256("nonce");

        vm.prank(payer);
        pot.commitSpin(alice, _commitment(alice, tier, amount, nonce));

        vm.prank(payer);
        pot.revealSpin(alice, tier, amount, nonce, address(usdc));

        assertEq(usdc.balanceOf(alice), amount);
        assertEq(pot.potBalance(address(usdc)), 100e6 - amount);
    }

    function test_MismatchReverts() public {
        uint8 tier = pot.TIER_USDC_1();
        bytes32 nonce = keccak256("nonce");
        vm.prank(payer);
        pot.commitSpin(alice, _commitment(alice, tier, 1e6, nonce));

        vm.prank(payer);
        vm.expectRevert(GachaPot.CommitmentMismatch.selector);
        pot.revealSpin(alice, tier, 2e6, nonce, address(usdc));
    }

    function test_ZonkPaysNothing() public {
        uint8 tier = pot.TIER_ZONK();
        bytes32 nonce = keccak256("nonce");
        vm.prank(payer);
        pot.commitSpin(alice, _commitment(alice, tier, 0, nonce));

        uint256 before = pot.potBalance(address(usdc));
        vm.prank(payer);
        pot.revealSpin(alice, tier, 0, nonce, address(usdc));
        assertEq(pot.potBalance(address(usdc)), before);
    }

    function test_InsolventReverts() public {
        uint8 tier = pot.TIER_USDC_100();
        uint256 amount = 1_000e6; // more than the pot holds
        bytes32 nonce = keccak256("nonce");
        vm.prank(payer);
        pot.commitSpin(alice, _commitment(alice, tier, amount, nonce));

        vm.prank(payer);
        vm.expectRevert(GachaPot.Insolvent.selector);
        pot.revealSpin(alice, tier, amount, nonce, address(usdc));
    }

    function test_OnlyPayerCanCommit() public {
        vm.prank(bob);
        vm.expectRevert(GachaPot.NotPayer.selector);
        pot.commitSpin(alice, bytes32(uint256(1)));
    }

    function test_NoCommitmentReverts() public {
        uint8 tier = pot.TIER_USDC_1();
        vm.prank(payer);
        vm.expectRevert(GachaPot.NoCommitment.selector);
        pot.revealSpin(alice, tier, 1e6, keccak256("x"), address(usdc));
    }
}
