// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function decimals() external view   returns (uint8);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
}

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