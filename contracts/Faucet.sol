// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Faucet{
    IERC20 public  token0;
    IERC20 public  token1;
    IERC20 public  token2;
    IERC20 public  token3;

    address public owner;
    mapping(address => uint256) public timeFaucet;

    uint256 public lockhourPeriods;
    uint256 public amount0;
    uint256 public amount1;
    uint256 public amount2;
    uint256 public amount3;
    bool public isOpen;

    constructor(address _token0, address _token1,address _token2,address _token3,uint256 _amount0,uint256 _amount1,uint256 _amount2,uint256 _amount3,uint256 _lockhourPeriods) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
        token3 = IERC20(_token3);
        owner = msg.sender;
        lockhourPeriods = _lockhourPeriods;
        amount0 = _amount0 ;
        amount1 = _amount1 ;
        amount2 = _amount2 ;
        amount3 = _amount3 ;
        isOpen =  true;
    }

    function changeTimeFaucet(address user,uint256 newTime) external onlyOwner {
       require(isOpen,"it Close");
       timeFaucet[user] = newTime;
    }

    function changeLockHourPeriods(uint256 _newlockhourPeriods) external onlyOwner {
       require(isOpen,"it Close");
       lockhourPeriods = _newlockhourPeriods;
    }

    function changeAmountToken(uint256 _amount0,uint256 _amount1,uint256 _amount2,uint256 _amount3) external onlyOwner {
       require(isOpen,"it Close");
       amount0 = _amount0 ;
       amount1 = _amount1 ; 
       amount2 = _amount2 ; 
       amount3 = _amount3 ; 
    }

    function changeToken(address _token0,address _token1,address _token2,address _token3) external onlyOwner {
       require(isOpen,"it Close");
       token0 = IERC20(_token0);
       token1 = IERC20(_token1);
       token2 = IERC20(_token2);
       token3 = IERC20(_token3);
    }


    function togleOpen() external onlyOwner {
        isOpen = !isOpen;
    }

    function withdrawToken(address _token) external onlyOwner {
        require(isOpen,"it Close");
        IERC20(_token).transfer(owner, IERC20(_token).balanceOf(address(this)));
  
    }

    function getFaucet() external  {
       require(isOpen,"it Close");
       if(timeFaucet[msg.sender]== 0){
           timeFaucet[msg.sender] = block.timestamp;
       }
       require(timeFaucet[msg.sender] <= block.timestamp,"It is not time pls wait");
       timeFaucet[msg.sender] = block.timestamp + (60*60*lockhourPeriods );
       token0.transfer(msg.sender, amount0);
       token1.transfer(msg.sender, amount1);
       token2.transfer(msg.sender, amount2);
       token3.transfer(msg.sender, amount3);
    }


    modifier onlyOwner {
        require(owner == msg.sender,"Only owner can call this fucntion");
        _;
    }
}

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