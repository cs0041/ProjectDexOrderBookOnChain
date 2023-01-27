// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";
contract Wallet is ReentrancyGuard {

    address  token0; 
    address  token1; 

    constructor(address _token0,address _token1) {
        token0 = _token0;
        token1 = _token1;
    }

    modifier validtoken(address _token) {
        require(_token == token0 || _token == token1, "invalid token");
        _;
    }
    
    mapping(address =>  mapping (address=> uint256) ) public balancesSpot;     // wallet Spot
    mapping(address =>  mapping (address=> uint256) ) public balancesTrade;    // wallet Trade 
    // address msg.sender => address Token => balance

    

    function deposit(uint256 amount , address token) validtoken(token) nonReentrant external {
        require(amount > 0 ,"can't deposit 0");
        require(IERC20(token).balanceOf(msg.sender) >= amount,"balance not sufficient");

        balancesSpot[msg.sender][token] += amount;

        // IERC20(token).approve(address(this),amount);
        IERC20(token).transferFrom(msg.sender, address(this),amount);


    }


    function withdraw(uint256 amount , address token) validtoken(token) nonReentrant external {
        require(amount > 0 ,"can't withdraw 0");
        require( balancesSpot[msg.sender][token] >= amount,"balance not sufficient");

        balancesSpot[msg.sender][token]  -= amount;

        IERC20(token).transfer(msg.sender, amount);
    }

    
    
}