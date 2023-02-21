// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract FactoryPair{
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function allPairsLength() external view returns (uint) {
        return allPairs.length;
    }

    function createPair(address token0, address  token1) external returns (address pair) {
        require(token0 != token1,  "IDENTICAL_ADDRESSES");
        require(token0 != address(0), "ZERO_ADDRESS");
        require(getPair[token0][token1] == address(0), "PAIR_EXISTS"); // single check is sufficient
 
        bytes32 _salt = keccak256(abi.encodePacked(token0, token1));
        PairNewOrder newPair = new PairNewOrder{salt: _salt}(token0,token1);

        getPair[token0][token1] = address(newPair);
        getPair[token1][token0] = address(newPair); // populate mapping in the reverse direction
        allPairs.push(address(newPair));
        emit PairCreated(token0, token1, address(newPair), allPairs.length);
        return address(newPair);
    }
}


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
  
  event CreateLimitOrder(uint8 _isBuy,uint256 _amount,uint256 _price,address indexed trader);
  event SumMarketOrder(uint8 _isBuy,uint256 _amount,address indexed trader);
  event UpdateOrder(uint8 _isBuy,uint256 newPriceOrder,uint256 newAmount,address indexed trader);
  event RemoveOrder(uint8 _isBuy,uint256 _amount,uint256 _price,address indexed trader);

  event MarketOrder(uint8 _isBuy,uint256 _amount,uint256 _price);

  // node 
  // Buy Or sell => ID => Order
  mapping(uint8 => mapping (uint256 => Order )) linkedListsNode; 

  // list size 0 = buy    1 = sell
  mapping(uint8 => uint256) listSize;

  // nodeID 0 = nodeIDBuy 1 = nodeIDSell
  mapping(uint8 => uint256) nodeID;


  uint256 immutable GUARDHEAD = 0 ;
  uint256 immutable GUARDTAIL = 115792089237316195423570985008687907853269984665640564039457584007913129639935 ;
  
  // There is this section to query data directly through the blockchain, 
  // no backend required, just used for testing purposes. 
  // not a good way
  OrderMarket[] orderMarket;
  struct OrderMarket {
        uint8 isBuy;
        uint256 amount;
        uint256 price;
        uint256 date;
    }
  mapping(address => OrderHistory[])  orderHistory;
  struct OrderHistory {
    string Type;
    uint8 isBuy;
    uint256 amount;
    uint256 price;
    address Trader;
    uint256 date;
  }
  uint256 public price;
  

  constructor(address _tokne0 , address _token1) Wallet(_tokne0,_token1)  {
    nodeID[0] =1;
    nodeID[1] =1;
    linkedListsNode[0][0].nextNodeID = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
    linkedListsNode[1][0].nextNodeID  = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
  }

////////////////////////////////////// Function but use like modifier ////////////////////////////////////// 
function checkIsPrev(uint8 _isBuy,uint256 index, uint256 prevIndex)view private{
    require(_isPrev(_isBuy,index, prevIndex),"not prevIndex");
}
function checklinkedListsExist(uint8 _isBuy,uint256 index)view private{
    require(linkedListsNode[_isBuy][index].nextNodeID != 0,"index not exist");
}
function checkBalances(address _token,uint256 _amount)view private{
    require(balancesSpot[msg.sender][_token] >= _amount, "insufficient balance");
}
function checkVerifyIndexOrder(uint256 prevNodeID, uint256 _price, uint8 _isBuy, uint256 nextNodeID)view private{
     require(_verifyIndex(prevNodeID, _price,_isBuy, nextNodeID),"position in linked list not order");
}
function checkUintZero(uint256  number)pure private{
     require(number > 0 , "Zero");
}
function checkOwnerOrder(uint8 _isBuy,uint256 index)view private{
      require(linkedListsNode[_isBuy][index].trader == msg.sender,"not owner this order");
}





////////////////////////////////////// CreateLimitOrder ////////////////////////////////////// 

 function createLimitOrder(uint8 _isBuy,uint256 _amount,uint256 _price,uint256 prevNodeID)  public {
      checkUintZero(_price);
      checkUintZero(_amount);
      checklinkedListsExist(_isBuy,prevNodeID);
      checkVerifyIndexOrder(prevNodeID, _price,_isBuy, linkedListsNode[_isBuy][prevNodeID].nextNodeID);


      address tokenMain = _isBuy==0 ? token1 : token0;   
      uint8 decimals = IERC20(tokenMain).decimals();
      if(_isBuy==0){
        checkBalances(tokenMain, (_amount * _price)/10 ** decimals);
       _amount = createMarketOrder(_isBuy,(_amount * _price)/10 ** decimals,_price); 
       _amount = (_amount *10 ** decimals)/_price;
        if(_amount<=0) {
          return;
        }
       // transfer balance Spot to Trade wallet 
       balancesSpot[msg.sender][tokenMain] -= (_amount * _price)/10 ** decimals;
       balancesTrade[msg.sender][tokenMain] += (_amount * _price)/10 ** decimals;

      }else{
          checkBalances(tokenMain,_amount);
          _amount  = createMarketOrder(_isBuy,_amount,_price);
           if(_amount<=0) return;
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

      // There is this section to query data directly through the blockchain, 
      // no backend required, just used for testing purposes. 
      // not a good way
      orderHistory[msg.sender].push(OrderHistory("LimitOrder",_isBuy,_amount,_price,msg.sender,block.timestamp));
      emit  CreateLimitOrder(_isBuy, _amount, _price,msg.sender);
    }

////////////////////////////////////// Check pre_price > new_price > next_price ////////////////////////////////////// 

  function _verifyIndex(uint256 prevNodeID, uint256 _price, uint8 _isBuy, uint256 nextNodeID)  private view returns(bool) {

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
  function _findIndex(uint256  _price,uint8 _isBuy) external view returns(uint256) {
    checkUintZero(_price);
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

////////////////////////////////////// Remove Limit Order   ////////////////////////////////////// 
 function removeOrder(uint8 _isBuy,uint256 index, uint256 prevIndex) public {
     checkOwnerOrder(_isBuy,index);
     checklinkedListsExist(_isBuy,index);
     checkIsPrev(_isBuy,index, prevIndex);
     address token =  linkedListsNode[_isBuy][index].token;
     uint256 _amount =  linkedListsNode[_isBuy][index].amount;
     uint256 _price =  linkedListsNode[_isBuy][index].price;
     uint256 _filled =   linkedListsNode[_isBuy][index].filled;

      uint8 decimals = IERC20(token).decimals();
     if(_isBuy==0) {
        // transfer balance Trade to Spot wallet 
        balancesSpot[msg.sender][token] += ( (_amount-_filled) * _price)/10 ** decimals;
        balancesTrade[msg.sender][token] -= ( (_amount-_filled) * _price)/10 ** decimals;
      } else  {
        // transfer balance Trade to Spot wallet 
        balancesSpot[msg.sender][token]  += (_amount-_filled) ;
        balancesTrade[msg.sender][token] -= (_amount-_filled) ;
      }
      linkedListsNode[_isBuy][prevIndex].nextNodeID = linkedListsNode[_isBuy][index].nextNodeID;
      linkedListsNode[_isBuy][index].nextNodeID = 0;
      listSize[_isBuy]--;

      // There is this section to query data directly through the blockchain, 
      // no backend required, just used for testing purposes. 
      // not a good way
      orderHistory[msg.sender].push(OrderHistory("CanCelOrder",_isBuy,_amount,_price,msg.sender,block.timestamp));
      emit RemoveOrder(_isBuy,_amount,_price,msg.sender);
 }

 function removeOrderNoUpdateBalances(uint8 _isBuy,uint256 index, uint256 prevIndex) private {
      checklinkedListsExist(_isBuy,index);
      checkIsPrev(_isBuy,index, prevIndex);
      linkedListsNode[_isBuy][prevIndex].nextNodeID = linkedListsNode[_isBuy][index].nextNodeID;
      linkedListsNode[_isBuy][index].nextNodeID = 0;
      listSize[_isBuy]--;
 }

 ////////////////////////////////////// Check isPrev index ////////////////////////////////////// 

  function _isPrev(uint8 _isBuy,uint256 currentNodeID, uint256 prevNodeID) private view returns(bool) {
    checklinkedListsExist(_isBuy,prevNodeID);
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
     checkUintZero(newPriceOrder);
     checkUintZero(newAmount);
     checklinkedListsExist(_isBuy,index);
     checklinkedListsExist(_isBuy,prevIndexRemove);
     checklinkedListsExist(_isBuy,prevIndexAdd);
     if(prevIndexRemove==prevIndexAdd || index==prevIndexAdd){
        checkOwnerOrder(_isBuy,index);
        checkIsPrev(_isBuy,index,prevIndexRemove);
        checkVerifyIndexOrder(prevIndexAdd, newPriceOrder,_isBuy, linkedListsNode[_isBuy][index].nextNodeID);
        
        address token =  linkedListsNode[_isBuy][index].token;
        uint256 _amount =  linkedListsNode[_isBuy][index].amount;
        uint256 _price =  linkedListsNode[_isBuy][index].price;
        uint8 decimals = IERC20(token).decimals();
        linkedListsNode[_isBuy][index].price = newPriceOrder;
        linkedListsNode[_isBuy][index].amount = newAmount;
        
          // transfer balance Trade to Spot wallet 
          if(_isBuy==0) {
          bool isMoreThan = (newPriceOrder*newAmount) > ( _amount * _price);
          if(isMoreThan){
            uint256 diff = ((newPriceOrder*newAmount)-( _amount * _price))/10 ** decimals;
            balancesSpot[msg.sender][token] -= diff;
            balancesTrade[msg.sender][token] += diff;
          }else{
            uint256 diff = (( _amount * _price)-(newPriceOrder*newAmount))/10 ** decimals;
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

     // There is this section to query data directly through the blockchain, 
     // no backend required, just used for testing purposes. 
     // not a good way
     orderHistory[msg.sender].push(OrderHistory("UpdateOrder",_isBuy,newAmount,newPriceOrder,msg.sender,block.timestamp));
     emit UpdateOrder(_isBuy,newPriceOrder,newAmount,msg.sender);



  }



//////////////////////////////////////  Market Order    ////////////////////////////////////// 
    function createMarketOrder(uint8 _isBuy,uint256 amount,uint256 _price) public returns(uint256) {
        uint256 totalFilled = 0;
        (address tokenMain,address tokenSeconry) = _isBuy == 0 ? (token1,token0) : (token0,token1);
        uint8 isBuy = _isBuy==0? 1 : 0; // toggle isBuy
        checkBalances(tokenMain,amount);
        if (listSize[isBuy]<=0) return amount;
        // Market Sell token0
        // sell token0 buy token1

        uint8 decimals = IERC20(tokenMain).decimals();
            uint256 currentNodeID = linkedListsNode[isBuy][GUARDHEAD].nextNodeID;
            for (uint256 i = 0; i < listSize[isBuy] && totalFilled < amount; i++) {
                 Order storage _order = linkedListsNode[isBuy][currentNodeID];
                 
                 if(_price>0){
                    if(isBuy==1){ 
                      if(_price < _order.price){
                        break;
                      }
                    }else{
                      if(_price > _order.price){
                        break;
                      }
                    }
                 }
                uint256 leftToFill = amount - totalFilled;
                uint256 availableToFill = _order.amount -  _order.filled;
                uint256 filled = 0;
                uint256 cost ;
                if(isBuy==1){
                    if( (availableToFill*_order.price)/10 ** decimals > leftToFill){
                    filled = leftToFill; //Full Fill 
                    }
                    else{ 
                        filled = (availableToFill*_order.price)/10 ** decimals; // Fill as much as can Fill
                    }
                
                    orderMarket.push(OrderMarket(isBuy, ((filled * 10 ** decimals)/_order.price),_order.price,block.timestamp));
                    emit MarketOrder(isBuy, ((filled * 10 ** decimals)/_order.price),_order.price);
                }else{
                    if(availableToFill > leftToFill){
                        filled = leftToFill; //Full Fill 
                    }
                    else{ 
                        filled = availableToFill; // Fill as much as can Fill
                    }
                    orderMarket.push(OrderMarket(isBuy, filled,_order.price,block.timestamp));
                    emit MarketOrder(isBuy, filled,_order.price);
                  }

                totalFilled = totalFilled + filled;

                if(isBuy==1){
                  _order.filled += (filled* 10 ** decimals)/_order.price;
                  cost = (filled* 10 ** decimals)/_order.price; // amount token0
                }else{
                  _order.filled += filled;
                  cost = (filled * _order.price)/10 ** decimals;
              
                }

                //msg.sender is the seller

                // sell
                balancesSpot[msg.sender][tokenMain] -= filled;
                balancesSpot[_order.trader][tokenMain] += filled;
                
          
                // recive after sell
                balancesSpot[msg.sender][tokenSeconry] += cost;
                balancesTrade[_order.trader][tokenSeconry] -= cost;


                 // update latest price
                price = _order.price ;
                currentNodeID =_order.nextNodeID;
                
        }
  
    
        //Remove 100% filled orders from the orderbook
        while(listSize[isBuy] > 0 && linkedListsNode[isBuy][linkedListsNode[isBuy][GUARDHEAD].nextNodeID].filled == linkedListsNode[isBuy][linkedListsNode[isBuy][GUARDHEAD].nextNodeID].amount ){
        //Remove the top element in the orders
             removeOrderNoUpdateBalances(isBuy,linkedListsNode[isBuy][GUARDHEAD].nextNodeID,0);
        }

        // There is this section to query data directly through the blockchain, 
        // no backend required, just used for testing purposes. 
        // not a good way
        if(totalFilled != 0){
          orderHistory[msg.sender].push(OrderHistory("MarketOrder",isBuy,amount,0,msg.sender,block.timestamp));
          emit SumMarketOrder( isBuy, amount,msg.sender);
        }

        return amount-totalFilled;

      }

      function getOrderHisotyByAddress(address _address) external view returns(OrderHistory[] memory){
        return orderHistory[_address];
      }
      
      function getMarketOrder() external view returns(OrderMarket[] memory){
        return orderMarket;
      }

}


  


 
