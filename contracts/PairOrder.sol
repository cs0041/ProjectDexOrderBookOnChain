// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./wallet.sol";

contract PairNewOrder is Wallet{

    struct Order {
        uint256 id;
        address trader;
        uint8 isBuy; 
        uint256 createdDate;
        address token;
        uint256 amount;
        uint256 price;
        uint256 filled;
        uint256 nextNodeID;
    }
  
  event CreateLimitOrder(uint8 _isBuy,uint256 _amount,uint256 _price);
  event MarketOrder(uint8 _isBuy,uint256 _amount);
  event UpdateOrder(uint8 _isBuy,uint256 newPriceOrder,uint256 newAmount);
  event RemoveOrder(uint8 _isBuy,uint256 index);

  // node 
  // Buy Or sell => ID => Order
  mapping(uint8 => mapping (uint256 => Order )) linkedListsNode; 

  // list size 0 = buy    1 = sell
  mapping(uint8 => uint256) listSize;

  // nodeID 0 = nodeIDBuy 1 = nodeIDSell
  mapping(uint8 => uint256) nodeID;


  uint256 immutable GUARDHEAD = 0 ;
  uint256 immutable GUARDTAIL = 115792089237316195423570985008687907853269984665640564039457584007913129639935 ;
  uint256 public price;



  constructor(address _tokne0 , address _token1) Wallet(_tokne0,_token1)  {
    nodeID[0] =1;
    nodeID[1] =1;
    linkedListsNode[0][0].nextNodeID = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
    linkedListsNode[1][0].nextNodeID  = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
  }

////////////////////////////////////// CreateLimitOrder ////////////////////////////////////// 

 function createLimitOrder(uint8 _isBuy,uint256 _amount,uint256 _price,uint256 prevNodeID)  public {
      require(_price > 0,"price must > 0");
      require(_amount > 0,"amount must > 0");
      require( linkedListsNode[_isBuy][prevNodeID].nextNodeID != 0,"prevNodeID index not exist ");
      require(_verifyIndex(prevNodeID, _price,_isBuy, linkedListsNode[_isBuy][prevNodeID].nextNodeID),"position in linked list not order");

      address tokenMain = _isBuy==0 ? token1 : token0;
      if(_isBuy==0){
       require(balancesSpot[msg.sender][tokenMain] >= _amount * _price,"not enough balance token for buy");
       // transfer balance Spot to Trade wallet 
       balancesSpot[msg.sender][tokenMain] -= (_amount * _price);
       balancesTrade[msg.sender][tokenMain] += (_amount * _price);

      }else{
          require(balancesSpot[msg.sender][tokenMain] >= _amount,"not enough balance token for sell");
          // transfer balance Spot to Trade wallet 
          balancesSpot[msg.sender][tokenMain] -= _amount;
          balancesTrade[msg.sender][tokenMain] += _amount;
      }
      
      linkedListsNode[_isBuy][nodeID[_isBuy]] = Order(
      nodeID[_isBuy],      
      msg.sender,  
      _isBuy,   
      block.timestamp,   
      tokenMain,      
      _amount,   
      _price,    
      0,
      linkedListsNode[_isBuy][prevNodeID].nextNodeID);

      linkedListsNode[_isBuy][prevNodeID].nextNodeID = nodeID[_isBuy];
      listSize[_isBuy]++;
      nodeID[_isBuy]++;

      emit  CreateLimitOrder(_isBuy, _amount, _price);
    }

////////////////////////////////////// Check pre_price > new_price > next_price ////////////////////////////////////// 

  function _verifyIndex(uint256 prevNodeID, uint256 _price, uint8 _isBuy, uint256 nextNodeID)  internal view returns(bool) {

     if(_isBuy==0){
        return (prevNodeID == GUARDHEAD ||  linkedListsNode[0][prevNodeID].price  >= _price) && 
           (nextNodeID == GUARDTAIL || _price >  linkedListsNode[0][nextNodeID].price);
     } else {
         return (prevNodeID == GUARDHEAD || linkedListsNode[1][prevNodeID].price <= _price) && 
           (nextNodeID == GUARDTAIL || _price < linkedListsNode[1][nextNodeID].price);
     }
  }

//////////////////////////////////////           For offchain use           ////////////////////////////////////// 
////////////////////////////////////// Find index makes  linked list order  ////////////////////////////////////// 
  function _findIndex(uint256 _price,uint8 _isBuy) external view returns(uint256) {
    require(_price > 0,"price must > 0");
    uint256 currentNodeID = GUARDHEAD;
    while(true) {
    if(_verifyIndex(currentNodeID, _price,_isBuy, linkedListsNode[_isBuy][currentNodeID].nextNodeID))
        return currentNodeID;
    currentNodeID = linkedListsNode[_isBuy][currentNodeID].nextNodeID;
    }
    revert("_findIndex revert");
  }



////////////////////////////////////  For offchain use ////////////////////////////////////// 
////////////////////////////////////// Get OrderBook ////////////////////////////////////// 

  function getOrderBook(uint8 _isBuy) external view returns(Order[] memory) {
      Order[] memory dataList = new Order[](listSize[_isBuy]);
      uint256 currentNodeID =  linkedListsNode[_isBuy][GUARDHEAD].nextNodeID;
      for(uint256 i = 0; i < listSize[_isBuy]; ++i) {
      dataList[i] = linkedListsNode[_isBuy][currentNodeID];
      currentNodeID = linkedListsNode[_isBuy][currentNodeID].nextNodeID;
      }
      return dataList;

    
  }
  function getOrderBookByAddress(address _trader) external view returns(Order[] memory) {

        uint256 allLengthOrderBookByAddress;
        uint256 currentNodeID;


        currentNodeID = linkedListsNode[0][GUARDHEAD].nextNodeID;
        for(uint256 i = 0; i < listSize[0]; ++i) {
          if(linkedListsNode[0][currentNodeID].trader == _trader){
            allLengthOrderBookByAddress++;
          }
          currentNodeID = linkedListsNode[0][currentNodeID].nextNodeID;
        }

        currentNodeID = linkedListsNode[1][GUARDHEAD].nextNodeID;
        for(uint256 i = 0; i < listSize[1]; ++i) {
          if(linkedListsNode[1][currentNodeID].trader == _trader){
            allLengthOrderBookByAddress++;
          }
          currentNodeID = linkedListsNode[1][currentNodeID].nextNodeID;
        }


        Order[] memory dataList = new Order[](allLengthOrderBookByAddress);
        uint index = 0;

       currentNodeID = linkedListsNode[0][GUARDHEAD].nextNodeID;
        for(uint i = 0; i < listSize[0]; ++i) {
          if(linkedListsNode[0][currentNodeID].trader == _trader){
            dataList[index] = linkedListsNode[0][currentNodeID];
            index++;
          }
          currentNodeID = linkedListsNode[0][currentNodeID].nextNodeID;
        }

        currentNodeID = linkedListsNode[1][GUARDHEAD].nextNodeID;
        for(uint i = 0; i < listSize[1] ; ++i) {
          if(linkedListsNode[1][currentNodeID].trader == _trader){
            dataList[index] = linkedListsNode[1][currentNodeID];
            index++;
          }
          currentNodeID = linkedListsNode[1][currentNodeID].nextNodeID;
        }
        return dataList;
    
    
  }



////////////////////////////////////// Remove Limit Order   ////////////////////////////////////// 
 function removeOrder(uint8 _isBuy,uint256 index, uint256 prevIndex) public {
     require(linkedListsNode[_isBuy][index].trader == msg.sender,"you are not owner of this position order");
     require(linkedListsNode[_isBuy][index].nextNodeID != 0,"removeOrder index not exist");
     require(_isPrev(_isBuy,index, prevIndex),"index is not prevIndex");
     address token =  linkedListsNode[_isBuy][index].token;
     uint256 _amount =  linkedListsNode[_isBuy][index].amount;
     uint256 _price =  linkedListsNode[_isBuy][index].price;
     if(_isBuy==0) {
        // transfer balance Trade to Spot wallet 
        balancesSpot[msg.sender][token] += ( _amount * _price);
        balancesTrade[msg.sender][token] -= ( _amount * _price);
      } else  {
        // transfer balance Trade to Spot wallet 
        balancesSpot[msg.sender][token]  += _amount ;
        balancesTrade[msg.sender][token] -= _amount ;
      }
      linkedListsNode[_isBuy][prevIndex].nextNodeID = linkedListsNode[_isBuy][index].nextNodeID;
      linkedListsNode[_isBuy][index].nextNodeID = 0;
      listSize[_isBuy]--;

      emit RemoveOrder(_isBuy,index);
 }

 function removeOrderNoUpdateBalances(uint8 _isBuy,uint256 index, uint256 prevIndex) private {
      require(linkedListsNode[_isBuy][index].nextNodeID != 0,"removeOrderNoUpdateBalances index not exist");
      require(_isPrev(_isBuy,index, prevIndex),"removeOrderNoUpdateBalances index is not prevIndex");
      linkedListsNode[_isBuy][prevIndex].nextNodeID = linkedListsNode[_isBuy][index].nextNodeID;
      linkedListsNode[_isBuy][index].nextNodeID = 0;
      listSize[_isBuy]--;
 }

 ////////////////////////////////////// Check isPrev index ////////////////////////////////////// 

  function _isPrev(uint8 _isBuy,uint256 currentNodeID, uint256 prevNodeID) private view returns(bool) {
    require(linkedListsNode[_isBuy][prevNodeID].nextNodeID != 0,"prevNodeID not exist");
    return linkedListsNode[_isBuy][prevNodeID].nextNodeID == currentNodeID;
  }

  

//////////////////////////////////////           For offchain use           ////////////////////////////////////// 
//////////////////////////////////////         Find PrevOrder index    ////////////////////////////////////// 

  function _findPrevOrder(uint8 _isBuy,uint256 index) public view returns(uint256) {
    uint256 currentNodeID = GUARDHEAD;
    while(linkedListsNode[_isBuy][currentNodeID].nextNodeID !=  GUARDTAIL) {
                if(_isPrev(_isBuy,index, currentNodeID))
                    return currentNodeID;
                currentNodeID = linkedListsNode[_isBuy][currentNodeID].nextNodeID;
            }
    revert('_findPrevOrder not exist');
  }




////////////////////////////////////// Update Limit Order   ////////////////////////////////////// 
//prevIndexAdd      use  _findIndex(newpayloadOrder)
//prevIndexRemove   use _findPrevOrder(index)
  function updateOrder(uint8 _isBuy,uint256 index, uint256 newPriceOrder, uint256 newAmount,uint256 prevIndexAdd,uint256 prevIndexRemove) public  {
    //  require(_price > 0,"price must > 0");
    // require(_amount > 0,"amount must > 0");
     require(linkedListsNode[_isBuy][index].nextNodeID != 0,"updateOrder index not exist");
     require(linkedListsNode[_isBuy][prevIndexRemove].nextNodeID != 0,"updateOrder index not exist");
     require(linkedListsNode[_isBuy][prevIndexAdd].nextNodeID != 0,"updateOrder index not exist");
     if(prevIndexRemove==prevIndexAdd || index==prevIndexAdd){
        require(_isPrev(_isBuy,index,prevIndexRemove));
        require(_verifyIndex(prevIndexAdd, newPriceOrder,_isBuy, linkedListsNode[_isBuy][index].nextNodeID));
        
        address token =  linkedListsNode[_isBuy][index].token;
        uint256 _amount =  linkedListsNode[_isBuy][index].amount;
        uint256 _price =  linkedListsNode[_isBuy][index].price;
        linkedListsNode[_isBuy][index].price = newPriceOrder;
        linkedListsNode[_isBuy][index].amount = newAmount;

          // transfer balance Trade to Spot wallet 
          if(_isBuy==0) {
          bool isMoreThan = (newPriceOrder*newAmount) > ( _amount * _price);
          if(isMoreThan){
            uint256 diff = (newPriceOrder*newAmount)-( _amount * _price);
            balancesSpot[msg.sender][token] -= diff;
            balancesTrade[msg.sender][token] += diff;
          }else{
            uint256 diff = ( _amount * _price)-(newPriceOrder*newAmount);
            balancesSpot[msg.sender][token] += diff;
            balancesTrade[msg.sender][token] -= diff;
          }
        } else  {
          bool isMoreThan = newAmount >  _amount ;
          if(isMoreThan){
            uint256 diff = newAmount- _amount ;
            balancesSpot[msg.sender][token] -= diff;
            balancesTrade[msg.sender][token] += diff;
          }else{
            uint256 diff = _amount-newAmount ;
            balancesSpot[msg.sender][token] += diff;
            balancesTrade[msg.sender][token] -= diff;
          }
        }

     }else{

      // removeOrder and createLimitOrder
      removeOrder(_isBuy, index, prevIndexRemove);
      createLimitOrder(_isBuy,newAmount,newPriceOrder,prevIndexAdd);
     }
     emit UpdateOrder(_isBuy,newPriceOrder,newAmount);


//เท่ากับตัวเอง ไม่ได้ และ น้อยกว่าตัวถึงจนถึงถึงตัวต่อไปไม่ได้
//22499 - 21000
// 0 -1 -2 -3     // 0 -1 -2 -3
// 1,0                  2,1
// 0 -2 -3                 0 - 1 -3   
// 1,1                       2,1
// 1 ----price -----
// 0 -4- -2 -3
  }



//////////////////////////////////////  Market Order    ////////////////////////////////////// 
    function createMarketOrder(uint8 _isBuy,uint256 amount) public {
        uint256 totalFilled = 0;
        (address tokenMain,address tokenSeconry) = _isBuy == 0 ? (token1,token0) : (token0,token1);
        _isBuy = _isBuy==0? 1 : 0; // toggle isBuy
        require(balancesSpot[msg.sender][tokenMain] >= amount, "not enough balance token for MarketOrder");

        // Market Sell token0
        // sell token0 buy token1


            uint256 currentNodeID = linkedListsNode[_isBuy][GUARDHEAD].nextNodeID;
            for (uint256 i = 0; i < listSize[_isBuy] && totalFilled < amount; i++) {

                uint256 leftToFill = amount - totalFilled;
                uint256 availableToFill = linkedListsNode[_isBuy][currentNodeID].amount -  linkedListsNode[_isBuy][currentNodeID].filled;
                uint256 filled = 0;
                uint256 cost ;
                if(_isBuy==1){
                  if( (availableToFill*linkedListsNode[_isBuy][currentNodeID].price) > leftToFill){
                    filled = leftToFill; //Full Fill 
                    }
                    else{ 
                        filled = (availableToFill*linkedListsNode[_isBuy][currentNodeID].price); // Fill as much as can Fill
                    }
                }else{
                    if(availableToFill > leftToFill){
                        filled = leftToFill; //Full Fill 
                    }
                    else{ 
                        filled = availableToFill; // Fill as much as can Fill
                    }
                  }

                totalFilled = totalFilled + filled;

                if(_isBuy==1){
                  linkedListsNode[_isBuy][currentNodeID].filled += (filled/linkedListsNode[_isBuy][currentNodeID].price);
                  cost = (filled/linkedListsNode[_isBuy][currentNodeID].price); // amount token0
                }else{
                  linkedListsNode[_isBuy][currentNodeID].filled += filled;
                  cost = filled * linkedListsNode[_isBuy][currentNodeID].price;
                }

                //msg.sender is the seller

                // sell
                balancesSpot[msg.sender][tokenMain] -= filled;
                balancesSpot[linkedListsNode[_isBuy][currentNodeID].trader][tokenMain] += filled;
                
          
                // recive after sell
                balancesSpot[msg.sender][tokenSeconry] += cost;
                balancesTrade[linkedListsNode[_isBuy][currentNodeID].trader][tokenSeconry] -= cost;



                // update latest price
                price = linkedListsNode[_isBuy][currentNodeID].price ;

                currentNodeID =linkedListsNode[_isBuy][currentNodeID].nextNodeID;

                
        }
        

    
        //Remove 100% filled orders from the orderbook
        while(listSize[_isBuy] > 0 && linkedListsNode[_isBuy][linkedListsNode[_isBuy][GUARDHEAD].nextNodeID].filled == linkedListsNode[_isBuy][linkedListsNode[_isBuy][GUARDHEAD].nextNodeID].amount ){
        //Remove the top element in the orders
             removeOrderNoUpdateBalances(_isBuy,linkedListsNode[_isBuy][GUARDHEAD].nextNodeID,0);
        }

        _isBuy = _isBuy==0? 1 : 0; // toggle isBuy
        emit MarketOrder( _isBuy, amount);

      }
  
}


  


 

