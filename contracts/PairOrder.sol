// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "./wallet.sol";

contract PairNewOrder is Ownable,Wallet{
    enum Side {
        BUY, //  0 BUY
        SELL //  1 Sell
    }

    // address  token0; // Main Token
    // address  token1; // Ssecondary Token

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

  // node OrderBUY -> descending price token0 for buy
  mapping(uint256 => uint256) _nextNodeBuyID; 
  uint256  listBuySize;
  uint256  nodeBuyID = 1;
  

  // node OrderSell -> ascending price token0 for sell
  mapping(uint256 => uint256) _nextNodeSellID; 
  uint256  listSellSize;
  uint256  nodeSellID = 1;

  uint256 immutable GUARDHEAD = 0 ;
  uint256 immutable GUARDTAIL = 115792089237316195423570985008687907853269984665640564039457584007913129639935 ;


  constructor(address _tokne0 , address _token1) Wallet(_tokne0,_token1)  {
    // token0 =  _tokne0;
    // token1 = _token1;
    _nextNodeBuyID[0] = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
    _nextNodeSellID[0] = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
  }

////////////////////////////////////// CreateLimitOrder ////////////////////////////////////// 

 function createLimitOrder(Side side,uint256 amount,uint256 price,uint256 prevNodeID)  public {
      require(price > 0,"price must > 0");
      require(amount > 0,"amount must > 0");
      // BUY  token0 -> create selltoken1 with (amount*price) to buy token0
      // SELL token0 -> create selltoken0

        if(side == Side.BUY) {  
            // buy token0  -> sell token1 
            // amountToken0 priceToken0
            addBuyOrder( amount, price,  prevNodeID);
        }
        else if(side == Side.SELL) {
            // sell token0 -> buy token1
            addSellOrder( amount, price,  prevNodeID);
        }


    }



////////////////////////////////////// Add Order ////////////////////////////////////// 

   function addBuyOrder(uint256 _amount,uint256 _price,  uint256 prevNodeID)  private {  
    //BUY token0 amount - price
    require(balancesSpot[msg.sender][token1] >= _amount * _price,"not enough balance token for buy");
    require(_nextNodeBuyID[prevNodeID] != 0,"index not exist");
    require(_verifyIndex(prevNodeID, _price,Side.BUY, _nextNodeBuyID[prevNodeID]),"position in linked list not order");

    // transfer balance Spot to Trade wallet 
    balancesSpot[msg.sender][token1] -= (_amount * _price);
    balancesTrade[msg.sender][token1] += (_amount * _price);

    payloadOrder[0][nodeBuyID] = Order(
        nodeBuyID,      
        msg.sender,  
        Side.BUY,      
        token1,      
        _amount,   
        _price,    
        0          
    );

    _nextNodeBuyID[nodeBuyID] = _nextNodeBuyID[prevNodeID];
    _nextNodeBuyID[prevNodeID] = nodeBuyID;
    listBuySize++;
    nodeBuyID++;
  }

   function addSellOrder( uint256 _amount,uint256 _price,  uint256 prevNodeID)  private {
    //SELL token0 amount - price  
    require(balancesSpot[msg.sender][token0] >= _amount,"not enough balance token for sell");
    require(_nextNodeSellID[prevNodeID] != 0,"index not exist");
    require(_verifyIndex(prevNodeID, _price,Side.SELL, _nextNodeSellID[prevNodeID]),"position in linked list not order");

    // transfer balance Spot to Trade wallet 
    balancesSpot[msg.sender][token0] -= _amount;
    balancesTrade[msg.sender][token0] += _amount;

    payloadOrder[1][nodeSellID] = Order(
        nodeSellID,    
        msg.sender,  
        Side.SELL,       
        token0,     
        _amount,    
        _price,    
        0           
    );

    _nextNodeSellID[nodeSellID] = _nextNodeSellID[prevNodeID];
    _nextNodeSellID[prevNodeID] = nodeSellID;
    listSellSize++;
    nodeSellID++;
  }



////////////////////////////////////// Check pre_price > new_price > next_price ////////////////////////////////////// 

  function _verifyIndex(uint256 prevNodeID, uint256 _price, Side _side, uint256 nextNodeID)  internal view returns(bool) {
    uint8 side = uint8(_side);
     if(_side == Side.BUY){
        return (prevNodeID == GUARDHEAD || payloadOrder[side][prevNodeID].price >= _price) && 
           (nextNodeID == GUARDTAIL || _price > payloadOrder[side][nextNodeID].price);
     } else if(_side == Side.SELL) {
         return (prevNodeID == GUARDHEAD || payloadOrder[side][prevNodeID].price <= _price) && 
           (nextNodeID == GUARDTAIL || _price < payloadOrder[side][nextNodeID].price);
     }
     revert("_verifyIndex revert");
  }

//////////////////////////////////////           For offchain use           ////////////////////////////////////// 
////////////////////////////////////// Find index makes  linked list order  ////////////////////////////////////// 
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



////////////////////////////////////  For offchain use ////////////////////////////////////// 
////////////////////////////////////// Get OrderBook ////////////////////////////////////// 

  function getOrderBook(Side _side) external view returns(Order[] memory) {
    if(_side == Side.BUY) {
        Order[] memory dataList = new Order[](listBuySize);
        uint256 currentNodeID = _nextNodeBuyID[GUARDHEAD];
        for(uint256 i = 0; i < listBuySize; ++i) {
        dataList[i] = payloadOrder[uint8(_side)][currentNodeID];
        currentNodeID = _nextNodeBuyID[currentNodeID];
        }
        return dataList;
    } else if(_side == Side.SELL) {
        Order[] memory dataList = new Order[](listSellSize);
        uint256 currentNodeID = _nextNodeSellID[GUARDHEAD];
        for(uint256 i = 0; i < listSellSize; ++i) {
        dataList[i] = payloadOrder[uint8(_side)][currentNodeID];
        currentNodeID = _nextNodeSellID[currentNodeID];
        }
        return dataList;
    }
    revert("Can't Get Data Order Something Wrong");

    
  }



////////////////////////////////////// Remove Limit Order   ////////////////////////////////////// 
 function removeOrder(Side _side,uint256 index, uint256 prevIndex) public {
     uint8 side = uint8(_side);
     require(payloadOrder[side][index].trader == msg.sender,"you are not owner of this position order");
     if(_side == Side.BUY) {
        require(_nextNodeBuyID[index] != 0,"index not exist");
        require(_isPrev(_side,index, prevIndex),"index is not pre");
        
        // transfer balance Trade to Spot wallet 
        balancesSpot[msg.sender][payloadOrder[side][index].token] += ( payloadOrder[side][index].amount *  payloadOrder[side][index].price);
        balancesTrade[msg.sender][payloadOrder[side][index].token] -= ( payloadOrder[side][index].amount *  payloadOrder[side][index].price);

        _nextNodeBuyID[prevIndex] = _nextNodeBuyID[index];
        _nextNodeBuyID[index] = 0;
        listBuySize--;

      } else if(_side == Side.SELL) {
        require(_nextNodeSellID[index] != 0,"index not exist");
        require(_isPrev(_side,index, prevIndex),"index is not pre");

        // transfer balance Trade to Spot wallet 
        balancesSpot[msg.sender][payloadOrder[side][index].token]  += payloadOrder[side][index].amount ;
        balancesTrade[msg.sender][payloadOrder[side][index].token] -= payloadOrder[side][index].amount ;

        _nextNodeSellID[prevIndex] = _nextNodeSellID[index];
        _nextNodeSellID[index] = 0;
        listSellSize--;

      }

 }

 ////////////////////////////////////// Check isPrev index ////////////////////////////////////// 

  function _isPrev(Side _side,uint256 currentNodeID, uint256 prevNodeID) private view returns(bool) {
     if(_side == Side.BUY) {
          return _nextNodeBuyID[prevNodeID] == currentNodeID;
      } else if(_side == Side.SELL) {
           return _nextNodeSellID[prevNodeID] == currentNodeID;
      }

      revert("_isPrev revert");
   
  }

  

//////////////////////////////////////           For offchain use           ////////////////////////////////////// 
//////////////////////////////////////         Find PrevOrder index    ////////////////////////////////////// 

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
    
    revert("_findPrevOrder not exist");
  }




////////////////////////////////////// Update Limit Order   ////////////////////////////////////// 
//prevIndexAdd      use  _findIndex(newpayloadOrder)
//prevIndexRemove   use _findPrevOrder(index)
  function updateOrder(Side _side,uint256 index, uint256 newPriceOrder, uint256 newAmount,uint256 prevIndexAdd,uint256 prevIndexRemove) public  {

      uint8 side = uint8(_side);
      require(payloadOrder[side][index].trader == msg.sender,"you are not owner of this position order");
    

      if(_side == Side.BUY) {

          require(_nextNodeBuyID[index] != 0,"index not exist");
          require(_nextNodeBuyID[prevIndexRemove]  != 0,"index not exist");
          require(_nextNodeBuyID[prevIndexAdd]  != 0,"index not exist");

          // removeOrder and createLimitOrder
          removeOrder(_side,index,prevIndexRemove);
          addBuyOrder( newAmount, newPriceOrder,  prevIndexAdd);

   
            
      } else if(_side == Side.SELL) {

          require(_nextNodeSellID[index] != 0,"index not exist");
          require(_nextNodeSellID[prevIndexRemove]  != 0,"index not exist");
          require(_nextNodeSellID[prevIndexAdd]  != 0,"index not exist");

          // removeOrder and createLimitOrder
          removeOrder(_side,index,prevIndexRemove);
          addSellOrder( newAmount, newPriceOrder,  prevIndexAdd);
      }
  }



//////////////////////////////////////  Market Order    ////////////////////////////////////// 
    function createMarketOrder(Side _side,uint256 amount) public {
        uint256 totalFilled = 0;
        // Market Sell token0
        // sell token0 buy token1

        if(_side == Side.SELL){
            require(balancesSpot[msg.sender][token0] >= amount, "not enough balance token for sell");

            
          // _nextNodeBuyID
          // listBuySize
          // payloadOrder[uint8(_side)][nodeBuyID] 
            uint256 currentNodeID = _nextNodeBuyID[GUARDHEAD];
            for (uint256 i = 0; i < listBuySize && totalFilled < amount; i++) {

                uint256 leftToFill = amount - totalFilled;
                uint256 availableToFill = payloadOrder[0][currentNodeID].amount -  payloadOrder[0][currentNodeID].filled;
                uint256 filled = 0;
                if(availableToFill > leftToFill){
                    filled = leftToFill; //Full Fill 
                }
                else{ 
                    filled = availableToFill; // Fill as much as can Fill
                }

                totalFilled = totalFilled + filled;
                payloadOrder[0][currentNodeID].filled += filled;
                uint256 cost = filled * payloadOrder[0][currentNodeID].price;

                //msg.sender is the seller

                // sell
                balancesSpot[msg.sender][token0] -= filled;
                balancesSpot[payloadOrder[0][currentNodeID].trader][token0] += filled;
           

                // recive after sell
                balancesSpot[msg.sender][token1] += cost;
                balancesSpot[payloadOrder[0][currentNodeID].trader][token1] -= cost;




                currentNodeID = _nextNodeBuyID[currentNodeID];
        }

     

    
        //Remove 100% filled orders from the orderbook
        while(listBuySize > 0 && payloadOrder[0][_nextNodeBuyID[GUARDHEAD]].filled == payloadOrder[0][_nextNodeBuyID[GUARDHEAD]].amount ){
        //Remove the top element in the orders
             removeOrder(_side, _nextNodeBuyID[GUARDHEAD],0);
        }

      // Market Buy token0
      // sell token1 buy token0

      } else if(_side == Side.BUY){
            require(balancesSpot[msg.sender][token1] >= amount, "not enough balance token for buy");
          // _nextNodeSellID
          // listSellSize
          // payloadOrder[uint8(_side)][nodeSellID] 
            uint256 currentNodeID = _nextNodeSellID[GUARDHEAD];
            for (uint256 i = 0; i < listSellSize && totalFilled < amount; i++) {
                uint256 leftToFill = amount - totalFilled;
                uint256 availableToFill = payloadOrder[1][currentNodeID].amount -  payloadOrder[1][currentNodeID].filled;
                uint256 filled = 0;
                if( (availableToFill*payloadOrder[1][currentNodeID].price) > leftToFill){
                    filled = leftToFill; //Full Fill 
                }
                else{ 
                    filled = (availableToFill*payloadOrder[1][currentNodeID].price); // Fill as much as can Fill
                }

                totalFilled = totalFilled + filled;
                payloadOrder[1][currentNodeID].filled += (filled/payloadOrder[1][currentNodeID].price);
                uint256 cost = (filled/payloadOrder[1][currentNodeID].price);

                //msg.sender is the seller

                // sell
                balancesSpot[msg.sender][token1] -= filled;
                balancesSpot[payloadOrder[1][currentNodeID].trader][token1] += filled;
           

                // recive after sell
                balancesSpot[msg.sender][token0] += cost;
                balancesSpot[payloadOrder[1][currentNodeID].trader][token0] -= cost;


                currentNodeID = _nextNodeSellID[currentNodeID];
        }

     

    

        //Remove 100% filled orders from the orderbook
        while(listSellSize > 0 && payloadOrder[1][_nextNodeBuyID[GUARDHEAD]].filled == payloadOrder[1][_nextNodeBuyID[GUARDHEAD]].amount ){
        //Remove the top element in the orders
             removeOrder(_side, _nextNodeBuyID[GUARDHEAD],0);
        }

      }
    }
  ////////////////////////////////////// MARKET ORDER    ////////////////////////////////////// 




  
 function testOwner() public onlyOwner view returns(string memory ){
    return "can onlyOwner";
  }

 }

