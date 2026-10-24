// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {BuzzMe} from "../src/BuzzMe.sol";
import {GachaPot} from "../src/GachaPot.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract BuzzMeTest is Test {
    BuzzMe board;
    GachaPot pot;
    MockUSDC usdc;

    address owner = address(0xA11CE);
    address treasury = address(0xB0B);
    address payer = address(0xCAFE);
    address alice = address(0xA1);
    address bob = address(0xB1);

    function setUp() public {
        usdc = new MockUSDC();
        pot = new GachaPot(owner, payer);
        board = new BuzzMe(owner, address(pot), treasury, address(usdc));

        usdc.mint(alice, 1_000_000e6);
        usdc.mint(bob, 1_000_000e6);
    }

    function _key(string memory url) internal pure returns (bytes32) {
        return keccak256(bytes(url));
    }

    function _list(address who, uint256 amount, string memory url) internal returns (bytes32) {
        vm.startPrank(who);
        usdc.approve(address(board), amount);
        bytes32 key = board.list(url, who == alice ? "Alice" : "Bob", amount);
        vm.stopPrank();
        return key;
    }

    function test_ListUsdc_RanksAndSplits() public {
        bytes32 key = _list(alice, 100e6, "https://alice.xyz");

        BuzzMe.Listing memory l = board.getListing(key);
        assertEq(l.owner, alice);
        assertEq(l.totalUsd, 100e6, "100 USDC = $100");
        assertEq(board.listingCount(), 1);
        assertEq(board.topKey(), key);
        assertEq(board.topUsd(), 100e6);

        // 50/50 split, in USDC
        assertEq(usdc.balanceOf(address(pot)), 50e6, "gacha half");
        assertEq(usdc.balanceOf(treasury), 50e6, "treasury half");
        assertEq(usdc.balanceOf(address(board)), 0, "board keeps nothing");
    }

    function test_ListBelowMinimumReverts() public {
        vm.startPrank(alice);
        usdc.approve(address(board), 5e6);
        vm.expectRevert(BuzzMe.BelowMinimum.selector);
        board.list("https://alice.xyz", "Alice", 5e6);
        vm.stopPrank();
    }

    function test_DuplicateUrlReverts() public {
        _list(alice, 100e6, "https://alice.xyz");

        vm.startPrank(bob);
        usdc.approve(address(board), 100e6);
        vm.expectRevert(BuzzMe.AlreadyListed.selector);
        board.list("https://alice.xyz", "Bob", 100e6);
        vm.stopPrank();
    }

    function test_Raise_OnlyOwner() public {
        bytes32 key = _list(alice, 100e6, "https://alice.xyz");

        vm.startPrank(alice);
        usdc.approve(address(board), 10e6);
        board.raise(key, 10e6);
        vm.stopPrank();
        assertEq(board.totalUsdOf(key), 110e6);

        vm.startPrank(bob);
        usdc.approve(address(board), 10e6);
        vm.expectRevert(BuzzMe.NotOwner.selector);
        board.raise(key, 10e6);
        vm.stopPrank();
    }

    function test_ZeroAmountReverts() public {
        vm.prank(alice);
        vm.expectRevert(BuzzMe.ZeroAmount.selector);
        board.list("https://alice.xyz", "Alice", 0);
    }

    function test_MinimumIncrementToTakeTop() public {
        _list(alice, 100e6, "https://alice.xyz");

        // A tie does not overtake the earlier listing.
        _list(bob, 100e6, "https://bob.xyz");
        assertEq(board.topKey(), _key("https://alice.xyz"));

        // Crossing #1 by less than the increment is rejected.
        vm.startPrank(bob);
        usdc.approve(address(board), 102e6);
        vm.expectRevert(BuzzMe.IncrementTooSmall.selector);
        board.list("https://bob2.xyz", "Bob2", 102e6);
        vm.stopPrank();

        // Clearing the increment takes the top.
        bytes32 top = _list(bob, 105e6, "https://bob3.xyz");
        assertEq(board.topKey(), top);
        assertEq(board.topUsd(), 105e6);
    }

    function test_DailyBucket() public {
        bytes32 key = _list(alice, 100e6, "https://alice.xyz");

        uint64 day = board.currentDay();
        assertEq(board.dayUsd(key, day), 100e6);

        vm.warp(block.timestamp + 1 days);
        vm.startPrank(alice);
        usdc.approve(address(board), 20e6);
        board.raise(key, 20e6);
        vm.stopPrank();

        assertEq(board.dayUsd(key, day), 100e6, "yesterday frozen");
        assertEq(board.dayUsd(key, day + 1), 20e6, "today accumulates");
    }

    function test_AdminGuards() public {
        vm.prank(alice);
        vm.expectRevert();
        board.setGachaBps(1000);
    }

    function test_ConstructorRejectsZeroUsdc() public {
        vm.expectRevert(BuzzMe.ZeroAddress.selector);
        new BuzzMe(owner, address(pot), treasury, address(0));
    }
}
