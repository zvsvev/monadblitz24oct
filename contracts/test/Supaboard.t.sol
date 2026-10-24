// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Test} from "forge-std/Test.sol";
import {Supaboard} from "../src/Supaboard.sol";
import {GachaPot} from "../src/GachaPot.sol";
import {MockUSDC} from "./mocks/MockUSDC.sol";

contract SupaboardTest is Test {
    Supaboard board;
    GachaPot pot;
    MockUSDC usdc;

    address owner = address(0xA11CE);
    address treasury = address(0xB0B);
    address payer = address(0xCAFE);
    address alice = address(0xA1);
    address bob = address(0xB1);

    function setUp() public {
        pot = new GachaPot(owner, payer);
        board = new Supaboard(owner, address(pot), treasury);
        usdc = new MockUSDC();

        vm.deal(alice, 10_000 ether);
        vm.deal(bob, 10_000 ether);
        usdc.mint(alice, 1_000_000e6);
        usdc.mint(bob, 1_000_000e6);
    }

    function _key(string memory url) internal pure returns (bytes32) {
        return keccak256(bytes(url));
    }

    function test_ListNative_RanksAndSplits() public {
        vm.prank(alice);
        bytes32 key = board.list{value: 100 ether}("https://alice.xyz", "Alice");

        Supaboard.Listing memory l = board.getListing(key);
        assertEq(l.owner, alice);
        assertEq(l.totalUsd, 100e6, "100 MON at $1 = $100");
        assertEq(board.listingCount(), 1);
        assertEq(board.topKey(), key);
        assertEq(board.topUsd(), 100e6);

        // 50/50 split
        assertEq(address(pot).balance, 50 ether, "gacha half");
        assertEq(treasury.balance, 50 ether, "treasury half");
        assertEq(address(board).balance, 0, "board keeps nothing");
    }

    function test_ListBelowMinimumReverts() public {
        vm.prank(alice);
        vm.expectRevert(Supaboard.BelowMinimum.selector);
        board.list{value: 5 ether}("https://alice.xyz", "Alice");
    }

    function test_DuplicateUrlReverts() public {
        vm.prank(alice);
        board.list{value: 100 ether}("https://alice.xyz", "Alice");

        vm.prank(bob);
        vm.expectRevert(Supaboard.AlreadyListed.selector);
        board.list{value: 100 ether}("https://alice.xyz", "Bob");
    }

    function test_Raise_OnlyOwner() public {
        vm.prank(alice);
        bytes32 key = board.list{value: 100 ether}("https://alice.xyz", "Alice");

        vm.prank(alice);
        board.raise{value: 10 ether}(key);
        assertEq(board.totalUsdOf(key), 110e6);

        vm.prank(bob);
        vm.expectRevert(Supaboard.NotOwner.selector);
        board.raise{value: 10 ether}(key);
    }

    function test_MinimumIncrementToTakeTop() public {
        vm.prank(alice);
        board.list{value: 100 ether}("https://alice.xyz", "Alice");

        // A tie does not overtake the earlier listing.
        vm.prank(bob);
        board.list{value: 100 ether}("https://bob.xyz", "Bob");
        assertEq(board.topKey(), _key("https://alice.xyz"));

        // Crossing #1 by less than the increment is rejected.
        vm.prank(bob);
        vm.expectRevert(Supaboard.IncrementTooSmall.selector);
        board.list{value: 102 ether}("https://bob2.xyz", "Bob2");

        // Clearing the increment takes the top.
        vm.prank(bob);
        board.list{value: 105 ether}("https://bob3.xyz", "Bob3");
        assertEq(board.topKey(), _key("https://bob3.xyz"));
        assertEq(board.topUsd(), 105e6);
    }

    function test_DailyBucket() public {
        vm.prank(alice);
        bytes32 key = board.list{value: 100 ether}("https://alice.xyz", "Alice");

        uint64 day = board.currentDay();
        assertEq(board.dayUsd(key, day), 100e6);

        vm.warp(block.timestamp + 1 days);
        vm.prank(alice);
        board.raise{value: 20 ether}(key);
        assertEq(board.dayUsd(key, day), 100e6, "yesterday frozen");
        assertEq(board.dayUsd(key, day + 1), 20e6, "today accumulates");
    }

    function test_ListUsdc() public {
        vm.startPrank(alice);
        usdc.approve(address(board), 100e6);
        bytes32 key = board.listERC20("https://alice.xyz", "Alice", address(usdc), 100e6);
        vm.stopPrank();

        assertEq(board.totalUsdOf(key), 100e6, "100 USDC = $100");
        assertEq(usdc.balanceOf(address(pot)), 50e6, "gacha half");
        assertEq(usdc.balanceOf(treasury), 50e6, "treasury half");
    }

    function test_MonRateScalesUsd() public {
        vm.prank(owner);
        board.setMonUsdRate(2e6); // 1 MON = $2

        vm.prank(alice);
        bytes32 key = board.list{value: 100 ether}("https://alice.xyz", "Alice");
        assertEq(board.totalUsdOf(key), 200e6);
    }

    function test_AdminGuards() public {
        vm.prank(alice);
        vm.expectRevert();
        board.setGachaBps(1000);
    }
}
