// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Token0 is ERC20,Ownable {
    constructor(uint256 initialSupply) ERC20("Token0", "T0")  {
        _mint(msg.sender, initialSupply);
    }

    function mint(address account,uint256 amount) public onlyOwner{
        _mint(account, amount);
    }
}