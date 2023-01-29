// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Token1 is ERC20,Ownable {
    constructor(uint256 initialSupply) ERC20("Token1", "T1")  {
        _mint(msg.sender, initialSupply);
    }

    function mint(address account,uint256 amount) public onlyOwner{
        _mint(account, amount);
    }
}