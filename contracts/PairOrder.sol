// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PairNewOrder{
    enum Side {
        BUY, //  0 BUY
        SELL //  1 Sell
    }

    address  token0; // BUY ETH
    address  token1; // SELL BUSD

    struct Order {
        uint256 id;
        address trader;
        Side side;
        address token;
        uint256 amount;
        uint256 price;
        uint256 filled;
    }

  mapping(uint8 => mapping (uint256 =>  Order))  payloadOrder;    //  Side (buy or sell) -> nodeID  -> Order

  // node OrderBUY
  mapping(uint256 => uint256) _nextNodeBuyID; 
  uint256  listBuySize;
  uint256  nodeBuyID = 1;
  

  // node OrderSell
  mapping(uint256 => uint256) _nextNodeSellID; 
  uint256  listSellSize;
  uint256  nodeSellID = 1;

  uint256 immutable GUARDHEAD = 0 ;
  uint256 immutable GUARDTAIL = 115792089237316195423570985008687907853269984665640564039457584007913129639935 ;


  constructor(address _tokne0 , address _token1)  {
    token0 =  _tokne0;
    token1 = _token1;
    _nextNodeBuyID[0] = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
    _nextNodeSellID[0] = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
  }

//////////////////////////////////////createLimitOrder ////////////////////////////////////// 

 function createLimitOrder(Side side,address _token,uint256 amount,uint256 price,uint256 prevNodeID) public {
      require(_token==token0 || _token==token1 ,"invilde address token");
      require(price > 0,"price must > 0");
      require(amount > 0,"amount must > 0");
      // BUY  _token
      // SELL _token
       bool isToken0 = _token == token0;
       address tokenBuy;
       address tokenSell;


        if(side == Side.BUY) {  
            ( tokenBuy,  tokenSell) =  isToken0 ? 
            (token0, token1) : (token1, token0);
            require(IERC20(tokenSell).balanceOf(msg.sender) >= amount * price,"not enough balanceOf");
            addBuyOrder( side, tokenBuy, amount, price,  prevNodeID);
        }
        else if(side == Side.SELL) {
            ( tokenBuy,  tokenSell) =  isToken0 ? 
            (token1, token0) : (token0, token1);
            require(IERC20(tokenSell).balanceOf(msg.sender) >= amount,"not enough balanceOf");
            addSellOrder( side, tokenSell, amount, price,  prevNodeID);
        }


    }

   

////////////////////////////////////// createLimitOrder ////////////////////////////////////// 


////////////////////////////////////// ADD DATA ////////////////////////////////////// 

   function addBuyOrder( Side _side,address _token,uint256 _amount,uint256 _price,  uint256 prevNodeID) private {  
    require(_nextNodeBuyID[prevNodeID] != 0);
    require(_verifyIndex(prevNodeID, _price,_side, _nextNodeBuyID[prevNodeID]));
    payloadOrder[uint8(_side)][nodeBuyID] = Order(
        nodeBuyID,      // uint256 id
        msg.sender,  // address trader
        _side,       // Side side
        _token,      // address token
        _amount,     // uint256 amount
        _price,      // uint256 price
        0           // uint256 filled
    );

    _nextNodeBuyID[nodeBuyID] = _nextNodeBuyID[prevNodeID];
    _nextNodeBuyID[prevNodeID] = nodeBuyID;
    listBuySize++;
    nodeBuyID++;
  }

   function addSellOrder( Side _side,address _token,uint256 _amount,uint256 _price,  uint256 prevNodeID) private {  
    require(_nextNodeSellID[prevNodeID] != 0);
    require(_verifyIndex(prevNodeID, _price,_side, _nextNodeSellID[prevNodeID]));
    payloadOrder[uint8(_side)][nodeSellID] = Order(
        nodeSellID,      // uint256 id
        msg.sender,  // address trader
        _side,       // Side side
        _token,      // address token
        _amount,     // uint256 amount
        _price,      // uint256 price
        0           // uint256 filled
    );

    _nextNodeSellID[nodeSellID] = _nextNodeSellID[prevNodeID];
    _nextNodeSellID[prevNodeID] = nodeSellID;
    listSellSize++;
    nodeSellID++;
  }



  function _verifyIndex(uint256 prevNodeID, uint256 _price, Side _side, uint256 nextNodeID)
    internal
    view
    returns(bool)
  {
    return (prevNodeID == GUARDHEAD || payloadOrder[uint8(_side)][prevNodeID].price >= _price) && 
           (nextNodeID == GUARDTAIL || _price > payloadOrder[uint8(_side)][nextNodeID].price);
  }

  function _findIndex(uint256 _price,Side _side) external view returns(uint256) {
    require(_price > 0,"price must > 0");
    uint256 currentNodeID = GUARDHEAD;
    if(_side == Side.BUY){
        while(true) {
        if(_verifyIndex(currentNodeID, _price,_side, _nextNodeBuyID[currentNodeID]))
            return currentNodeID;
        currentNodeID = _nextNodeBuyID[currentNodeID];
        }
    } else if(_side == Side.SELL) {
            while(true) {
            if(_verifyIndex(currentNodeID, _price,_side, _nextNodeSellID[currentNodeID]))
                return currentNodeID;
            currentNodeID = _nextNodeSellID[currentNodeID];
            }
    }
    revert("can't find index");
  }

////////////////////////////////////// ADD DATA ////////////////////////////////////// 


////////////////////////////////////// GET DATA   ////////////////////////////////////// 

  function getOrderBook(Side _side) public view returns(uint256[] memory) {
    if(_side == Side.BUY) {
        uint256[] memory dataList = new uint256[](listBuySize);
        uint256 currentNodeID = _nextNodeBuyID[GUARDHEAD];
        for(uint256 i = 0; i < listBuySize; ++i) {
        dataList[i] = payloadOrder[uint8(_side)][currentNodeID].price;
        currentNodeID = _nextNodeBuyID[currentNodeID];
        }
        return dataList;
    } else if(_side == Side.SELL) {
        uint256[] memory dataList = new uint256[](listSellSize);
        uint256 currentNodeID = _nextNodeSellID[GUARDHEAD];
        for(uint256 i = 0; i < listSellSize; ++i) {
        dataList[i] = payloadOrder[uint8(_side)][currentNodeID].price;
        currentNodeID = _nextNodeSellID[currentNodeID];
        }
        return dataList;
    }
    revert("Can't Get Data Order Something Wrong");

    
  }
////////////////////////////////////// GET DATA   ////////////////////////////////////// 



////////////////////////////////////// REMOVE DATA   ////////////////////////////////////// 
 function removeOrder(Side _side,uint256 index, uint256 prevIndex) public {
     if(_side == Side.BUY) {
        require(_nextNodeBuyID[index] != 0);
        require(_isPrev(_side,index, prevIndex));
        _nextNodeBuyID[prevIndex] = _nextNodeBuyID[index];
        _nextNodeBuyID[index] = 0;
        listBuySize--;

      } else if(_side == Side.SELL) {
        require(_nextNodeSellID[index] != 0);
        require(_isPrev(_side,index, prevIndex));
        _nextNodeSellID[prevIndex] = _nextNodeSellID[index];
        _nextNodeSellID[index] = 0;
        listSellSize--;

      }

 }

  function _isPrev(Side _side,uint256 currentNodeID, uint256 prevNodeID) internal view returns(bool) {
     if(_side == Side.BUY) {
          return _nextNodeBuyID[prevNodeID] == currentNodeID;
      } else if(_side == Side.SELL) {
           return _nextNodeSellID[prevNodeID] == currentNodeID;
      }

      revert("_isPrev revert");
   
  }


  function _findPrevOrder(Side _side,uint256 index) public view returns(uint256) {
    uint256 currentNodeID = GUARDHEAD;
     if(_side == Side.BUY) {
          while(_nextNodeBuyID[currentNodeID] != GUARDTAIL) {
                if(_isPrev(_side,index, currentNodeID))
                    return currentNodeID;
                currentNodeID = _nextNodeBuyID[currentNodeID];
            }
      } else if(_side == Side.SELL) {
           while(_nextNodeSellID[currentNodeID] != GUARDTAIL) {
                if(_isPrev(_side,index, currentNodeID))
                    return currentNodeID;
                currentNodeID = _nextNodeSellID[currentNodeID];
            }
      }
    
    revert(" _findPrevOrder not exist");
  }

////////////////////////////////////// REMOVE DATA   ////////////////////////////////////// 


////////////////////////////////////// UPDATE DATA   ////////////////////////////////////// 
  function updateOrder(Side _side,uint256 index, uint256 newPriceOrder,uint256 prevIndexAdd,uint256 prevIndexRemove,address _token, uint256 amount) public {
      if(_side == Side.BUY) {
                require(_nextNodeBuyID[index] != 0,"mist exit");
                require(_nextNodeBuyID[prevIndexRemove]  != 0,"mist exit");
                require(_nextNodeBuyID[prevIndexAdd]  != 0,"mist exit");
                //prevIndexAdd    use  _findIndex(newpayloadOrder)
                //prevIndexRemove   use _findPrevOrder(index)
                uint256 nextNodeID = _nextNodeBuyID[index];
                if(_verifyIndex(prevIndexRemove, newPriceOrder, _side,nextNodeID)){
                    payloadOrder[uint8(_side)][index].price = newPriceOrder;
                } else {
                    removeOrder(_side,index,prevIndexRemove);
                    createLimitOrder( _side, _token, amount, newPriceOrder, prevIndexAdd);
                   
                }
      } else if(_side == Side.SELL) {
                require(_nextNodeSellID[index] != 0,"mist exit");
                require(_nextNodeSellID[prevIndexRemove]  != 0,"mist exit");
                require(_nextNodeSellID[prevIndexAdd]  != 0,"mist exit");
                //prevIndexAdd    use  _findIndex(newpayloadOrder)
                //prevIndexRemove   use _findPrevOrder(index)
                uint256 nextNodeID = _nextNodeSellID[index];
                if(_verifyIndex(prevIndexRemove, newPriceOrder, _side,nextNodeID)){
                    payloadOrder[uint8(_side)][index].price = newPriceOrder;
                } else {
                    removeOrder(_side,index,prevIndexRemove);
                    createLimitOrder( _side, _token, amount, newPriceOrder, prevIndexAdd);
                   
                }

      }
  
  }

////////////////////////////////////// UPDATE DATA   ////////////////////////////////////// 
  
}  