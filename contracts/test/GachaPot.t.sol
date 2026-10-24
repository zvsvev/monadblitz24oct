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
        vm.deal(owner, 1_000 ether);

        vm.prank(owner);
        (bool ok,) = address(pot).call{value: 50 ether}("");
        require(ok, "fund failed");
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
        assertEq(pot.potBalance(address(0)), 50 ether);
        assertEq(pot.potBalance(address(usdc)), 100e6);
    }

    function test_CommitRevealPaysNative() public {
        uint8 tier = pot.TIER_MON();
        uint256 amount = 1 ether;
        bytes32 nonce = keccak256("nonce");
        bytes32 c = _commitment(alice, tier, amount, nonce);

        vm.prank(payer);
        pot.commitSpin(alice, c);

        vm.prank(payer);
        pot.revealSpin(alice, tier, amount, nonce, address(0));

        assertEq(alice.balance, amount);
        assertEq(pot.potBalance(address(0)), 50 ether - amount);
    }

    function test_CommitRevealPaysUsdc() public {
        uint8 tier = pot.TIER_USDC();
        uint256 amount = 5e6;
        bytes32 nonce = keccak256("nonce2");
        bytes32 c = _commitment(alice, tier, amount, nonce);

        vm.prank(payer);
        pot.commitSpin(alice, c);

        vm.prank(payer);
        pot.revealSpin(alice, tier, amount, nonce, address(usdc));

        assertEq(usdc.balanceOf(alice), amount);
        assertEq(pot.potBalance(address(usdc)), 100e6 - amount);
    }

    function test_MismatchReverts() public {
        uint8 tier = pot.TIER_MON();
        bytes32 nonce = keccak256("nonce");
        vm.prank(payer);
        pot.commitSpin(alice, _commitment(alice, tier, 1 ether, nonce));

        vm.prank(payer);
        vm.expectRevert(GachaPot.CommitmentMismatch.selector);
        pot.revealSpin(alice, tier, 2 ether, nonce, address(0));
    }

    function test_ZonkPaysNothing() public {
        uint8 tier = pot.TIER_ZONK();
        bytes32 nonce = keccak256("nonce");
        vm.prank(payer);
        pot.commitSpin(alice, _commitment(alice, tier, 0, nonce));

        uint256 before = pot.potBalance(address(0));
        vm.prank(payer);
        pot.revealSpin(alice, tier, 0, nonce, address(0));
        assertEq(pot.potBalance(address(0)), before);
    }

    function test_InsolventReverts() public {
        uint8 tier = pot.TIER_BIG_MON();
        uint256 amount = 1_000 ether; // more than the pot holds
        bytes32 nonce = keccak256("nonce");
        vm.prank(payer);
        pot.commitSpin(alice, _commitment(alice, tier, amount, nonce));

        vm.prank(payer);
        vm.expectRevert(GachaPot.Insolvent.selector);
        pot.revealSpin(alice, tier, amount, nonce, address(0));
    }

    function test_OnlyPayerCanCommit() public {
        vm.prank(bob);
        vm.expectRevert(GachaPot.NotPayer.selector);
        pot.commitSpin(alice, bytes32(uint256(1)));
    }

    function test_NoCommitmentReverts() public {
        uint8 tier = pot.TIER_MON();
        vm.prank(payer);
        vm.expectRevert(GachaPot.NoCommitment.selector);
        pot.revealSpin(alice, tier, 1 ether, keccak256("x"), address(0));
    }
}
