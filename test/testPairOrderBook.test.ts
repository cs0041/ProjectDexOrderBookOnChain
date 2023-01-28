import {PairNewOrder,PairNewOrder__factory,TestToken,TestToken__factory} from '../typechain-types'
// @ts-ignore
import { ethers } from 'hardhat'
import { assert, expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'
import {orderToList} from "./helper/OrderToList"
import { FindSum } from './helper/FindSum'

describe("PairOrderBook",async () => {
  let pairorderbook: PairNewOrder
  let token0: TestToken
  let token1: TestToken
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  const initialSupply = 1000 // initialSupply Token

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners()

    const TOKEN0 = (await ethers.getContractFactory('TestToken', owner )) as TestToken__factory
    token0 = await TOKEN0.deploy(initialSupply)
    
    const TOKEN1 = (await ethers.getContractFactory( 'TestToken',  owner )) as TestToken__factory
    token1 = await TOKEN1.deploy(initialSupply)

    const PairOrderBook = (await ethers.getContractFactory( 'PairNewOrder', owner)) as PairNewOrder__factory
    pairorderbook = await PairOrderBook.deploy(token0.address, token1.address)

    // approve
    await token0.connect(owner).approve(pairorderbook.address,initialSupply)
    await token1.connect(owner).approve(pairorderbook.address,initialSupply)

    // deposit token 
    await pairorderbook.connect(owner).deposit(initialSupply,token0.address)
    await pairorderbook.connect(owner).deposit(initialSupply,token1.address)


  })

  describe('CreateLimitOrder',async () => {
     it(' Should revert when Order Buy/Sell and input amount = 0 ', async () => {
        let price = 1
        let amount = 0
        let prevNodeID: BigNumber
        let isBuy = 0
        let isSell = 1

        prevNodeID = await pairorderbook._findIndex(price, isBuy)
        await expect( pairorderbook.connect(owner).createLimitOrder(isBuy,token0.address,amount,price,prevNodeID)).to.be.revertedWith("amount must > 0")


        prevNodeID = await pairorderbook._findIndex(price, isSell)
        await expect( pairorderbook.connect(owner).createLimitOrder(isSell,token0.address,amount,price,prevNodeID)).to.be.revertedWith("amount must > 0")
     })

     it(' Should revert when Order Buy/Sell and input price = 0 ', async () => {
        let price = 0
        let amount = 1
        let isBuy = 0
        let isSell = 1

        await expect( pairorderbook._findIndex(price, isBuy) ).to.be.revertedWith("price must > 0")
        await expect( pairorderbook.connect(owner).createLimitOrder(isBuy,token0.address,amount,price,1)).to.be.revertedWith("price must > 0")

        await expect( pairorderbook._findIndex(price, isSell) ).to.be.revertedWith("price must > 0")
        await expect( pairorderbook.connect(owner).createLimitOrder(isSell,token0.address,amount,price,1)).to.be.revertedWith("price must > 0")
     })

     it(' Should revert when create Order Buy/Sell and balancesSpot not sufficient ', async () => {
        let price: number
        let amount:number
        let prevNodeID: BigNumber
        let isBuy = 0
        let isSell = 1

        
        amount = 1
        price = 1001
        prevNodeID = await pairorderbook._findIndex(price, isBuy)
        await expect( pairorderbook.connect(owner).createLimitOrder(isBuy,token0.address,amount,price,prevNodeID)).to.be.revertedWith("not enough balance token for buy")

        amount = 1001
        price = 1
        prevNodeID = await pairorderbook._findIndex(price, isSell)
        await expect( pairorderbook.connect(owner).createLimitOrder(isSell,token0.address,amount,price,prevNodeID)).to.be.revertedWith("not enough balance token for sell")
     })

     it(' Should order when create 10 Order buy', async  () => {

      let price:number
      let amount = 1
      let prevNodeID:BigNumber
      let isBuy = 0
      let isSell = 1
      let round = 10

      // Loop createLimitOrder
      let resultOrder = [] 
      for(let i = 0 ; i< round;i++){
        // price random  from 1 to 100
        price = Math.floor(Math.random() * 100) + 1
        prevNodeID = await pairorderbook._findIndex(price, isBuy)
        await pairorderbook.connect(owner).createLimitOrder(isBuy,token0.address,amount,price,prevNodeID)
        resultOrder.push(price)
      }

      // Sort numbers in ascending order:
      resultOrder.sort(function (a, b) { return b - a})

      //cheack OrderBook
      expect(orderToList(await pairorderbook.getOrderBook(isBuy))).to.deep.equal(resultOrder)

      //empty
      expect(await pairorderbook.getOrderBook(isSell)).to.deep.equal([])

      //cheack balancesSpot and balancesTrade
      expect(await pairorderbook.balancesSpot(owner.address,token1.address)).to.be.equal( initialSupply - FindSum(resultOrder))
      expect(await pairorderbook.balancesTrade(owner.address,token1.address)).to.be.equal( FindSum(resultOrder))

      expect(await pairorderbook.balancesSpot(owner.address,token0.address)).to.be.equal( initialSupply )
      expect(await pairorderbook.balancesTrade(owner.address,token0.address)).to.be.equal(0)

     })

     it(' Should order when create 10 Order sell', async  () => {

      let price: number
      let amount = 1
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1
      let round = 10

      // Loop createLimitOrder
      let resultOrder = [] 
      for(let i = 0 ; i< round;i++){
        // price random  from 1 to 100
        price = Math.floor(Math.random() * 100) + 1
        prevNodeID = await pairorderbook._findIndex(price, isSell)
        await pairorderbook.connect(owner).createLimitOrder(isSell,token0.address,amount,price,prevNodeID)
        resultOrder.push(price)
      }

      // Sort numbers in ascending order:
      resultOrder.sort(function (a, b) { return b - a})

      //cheack OrderBook
      expect(orderToList(await pairorderbook.getOrderBook(isSell))).to.deep.equal(resultOrder)

      //empty
      expect(await pairorderbook.getOrderBook(isBuy)).to.deep.equal([])
    
      //cheack balancesSpot and balancesTrade
      expect(await pairorderbook.balancesSpot(owner.address,token1.address)).to.be.equal( initialSupply )
      expect(await pairorderbook.balancesTrade(owner.address,token1.address)).to.be.equal(0)
      
      expect(await pairorderbook.balancesSpot(owner.address,token0.address)).to.be.equal( initialSupply - 10)
      expect(await pairorderbook.balancesTrade(owner.address,token0.address)).to.be.equal(10)

     })

     it(' Should order when create 5 Order buy and 5 Order sell', async  () => {

      let price: number
      let amount = 1
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1
      let round = 10

        // Loop createLimitOrder
      let resultBuyOrder = [] 
      let resultSellOrder = [] 
      let amountSell = 0
      for(let i = 0 ; i< round;i++){

        // price random  from 1 to 100
        price = Math.floor(Math.random() * 100) + 1

        // random Buy or Sell
        let randomBuyorSell = Math.random() >= 0.5 ? true : false // true -> sell false -> buy
        if(randomBuyorSell) {
          prevNodeID = await pairorderbook._findIndex(price, isSell)
          await pairorderbook.connect(owner).createLimitOrder(isSell,token0.address,amount,price,prevNodeID)
          resultSellOrder.push(price)
          amountSell++
        }else{
          prevNodeID = await pairorderbook._findIndex(price, isBuy)
          await pairorderbook.connect(owner).createLimitOrder(isBuy,token0.address,amount,price,prevNodeID)
          resultBuyOrder.push(price)
        }
      }

      // Sort numbers in ascending order:
      resultBuyOrder.sort(function (a, b) { return b - a})
      resultSellOrder.sort(function (a, b) { return b - a})

      //cheack OrderBook
      expect(orderToList(await pairorderbook.getOrderBook(isBuy))).to.deep.equal(resultBuyOrder)

      expect(orderToList(await pairorderbook.getOrderBook(isSell))).to.deep.equal(resultSellOrder)

      
      //cheack balancesSpot and balancesTrade
      expect(await pairorderbook.balancesSpot(owner.address,token1.address)).to.be.equal( initialSupply - FindSum(resultBuyOrder))
      expect(await pairorderbook.balancesTrade(owner.address,token1.address)).to.be.equal( FindSum(resultBuyOrder))

      expect(await pairorderbook.balancesSpot(owner.address,token0.address)).to.be.equal( initialSupply - amountSell )
      expect(await pairorderbook.balancesTrade(owner.address,token0.address)).to.be.equal(amountSell)

     })
  })

describe('RemoveOrder',async () => {
    beforeEach(async () => {
      let price: number
      let amount = 1
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1

      // order 1  -> price 112 buy
      price = 112
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder(isBuy,token0.address,amount,price,prevNodeID)

      // order 2  -> price 23 sell
      price = 23
      prevNodeID = await pairorderbook._findIndex(price, isSell)
      await pairorderbook.connect(owner).createLimitOrder (isSell,token0.address,amount,price,prevNodeID)
    

      // order 3  -> price 7 buy
      price = 7
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,amount,price,prevNodeID)

      // order 4  -> price 245 buy
      price = 245
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,amount,price,prevNodeID)

      // order 5  -> price 154 sell
      price = 154
      prevNodeID = await pairorderbook._findIndex(price, isSell)
      await pairorderbook.connect(owner).createLimitOrder (isSell,token0.address,amount,price,prevNodeID)

      // order 6  -> price 477 sell
      price = 277
      prevNodeID = await pairorderbook._findIndex(price, isSell)
      await pairorderbook.connect(owner).createLimitOrder (isSell,token0.address,amount,price,prevNodeID)

      // order 7  -> price 93 sell
      price = 93
      prevNodeID = await pairorderbook._findIndex(price, isSell)
      await pairorderbook.connect(owner).createLimitOrder (isSell,token0.address,amount,price,prevNodeID)

      // order 8  -> price 102 buy
      price = 102
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,amount,price,prevNodeID)

      // order 9  -> price 7 sell
      price = 7
      prevNodeID = await pairorderbook._findIndex(price, isSell)
      await pairorderbook.connect(owner).createLimitOrder (isSell,token0.address,amount,price,prevNodeID)

      // order 10  -> price 23 buy
      price = 23
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,amount,price,prevNodeID)

      // BUY  112 7 245 102 23  --order-->  245 112 102 23 7
      // SELL 23 154 277 93 7   --order-->  277 154 93 23 7


  })

    it("Should revert when RemoveOrder and index not exist", async() => {
      let isBuy = 0
      let index = 6 // not exist -> orderBUY  index(1)112 index(2)7 index(3)245 index(4)102 index(5)23

      await expect(pairorderbook._findPrevOrder(isBuy, index)).to.be.revertedWith("_findPrevOrder not exist")
      await expect(pairorderbook.connect(owner).removeOrder(isBuy, index, 12)).to.be.revertedWith("you are not owner of this position order") // cause owner is address0
    })
    it("Should revert when RemoveOrder and index-preindex are not contiguous", async() => {
      let prevIndex: BigNumber
      let isBuy = 0
      let index = 5 // not exist -> orderBUY  index(1)112 index(2)7 index(3)245 index(4)102 index(5)23
      

      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      prevIndex = prevIndex.add(1) // add to make revertedWith("index is not pre")
      await expect(pairorderbook.connect(owner).removeOrder(isBuy, index, prevIndex)).to.be.revertedWith("index is not pre") 
    })

    it('Should revert when RemoveOrder and not owner  position order', async () => {
      let prevIndex: BigNumber
      let isBuy = 0
      let index = 5 // not exist -> orderBUY  index(1)112 index(2)7 index(3)245 index(4)102 index(5)23

      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      await expect( pairorderbook.connect(addr1).removeOrder(isBuy, index, prevIndex)   ).to.be.revertedWith("you are not owner of this position order")
    })
    it('Should revert when RemoveOrder and empty linked list', async () => {
    
      let prevIndex: BigNumber
      let isBuy = 0
      let index :number // not exist -> orderBUY  index(1)112 index(2)7 index(3)245 index(4)102 index(5)23
                    // BUY  112 7 245 102 23  --order-->  245 112 102 23 7

      index = 1
      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      await pairorderbook.connect(owner).removeOrder(isBuy, index, prevIndex)

      index = 4
      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      await pairorderbook.connect(owner).removeOrder(isBuy, index, prevIndex)

      index = 3
      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      await pairorderbook.connect(owner).removeOrder(isBuy, index, prevIndex)

      index = 2
      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      await pairorderbook.connect(owner).removeOrder(isBuy, index, prevIndex)

      index = 5
      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      await pairorderbook.connect(owner).removeOrder(isBuy, index, prevIndex)

      // now empty linked list
      expect(orderToList(await pairorderbook.getOrderBook(isBuy))).to.deep.equal([])
      
      // try remove empty linked list
      await expect(pairorderbook.connect(owner).removeOrder(isBuy, index, 3)).to.be.revertedWith("index not exist")


    })

    it('Should pass when RemoveOrder and index-preindex are contiguous and exist', async () => {
    
      let prevIndex: BigNumber
      let balancesSpotToken1  : number
      let balancesTradeToken1 : number
      let balancesSpotToken0  : number
      let balancesTradeToken0 : number
      let index: number
      let isSell = 1  // orderSell  index(1)23 index(2)154 index(3)277 index(4)93 index(5)7
                      // SELL 23 154 277 93 7   --order-->  277 154 93 23 7

      let isBuy = 0  // orderBUY  index(1)112 index(2)7 index(3)245 index(4)102 index(5)23
                        // BUY  112 7 245 102 23  --order-->  245 112 102 23 7


      // remove  orderBUY 

      balancesSpotToken1 = (await pairorderbook.balancesSpot(owner.address,token1.address)).toNumber()
      balancesTradeToken1 = (await pairorderbook.balancesTrade(owner.address,token1.address)).toNumber()

      balancesSpotToken0 = (await pairorderbook.balancesSpot(owner.address,token0.address)).toNumber()
      balancesTradeToken0 = (await pairorderbook.balancesTrade(owner.address,token0.address)).toNumber()

      index = 4  // index(4) 102
      prevIndex = await pairorderbook._findPrevOrder(isBuy, index) // find index-preindex are contiguous
      await pairorderbook.connect(owner).removeOrder(isBuy, index, prevIndex)

                    // when remove  orderBUY   245 112 102 23 7 --remove(index4)-->   245 112 23 7

      expect(orderToList(await pairorderbook.getOrderBook(isBuy))).to.deep.equal([245,112,23,7])

       //cheack balancesSpot and balancesTrade
      expect(await pairorderbook.balancesSpot(owner.address,token1.address)).to.be.equal( balancesSpotToken1  + 102 )
      expect(await pairorderbook.balancesTrade(owner.address,token1.address)).to.be.equal(balancesTradeToken1 - 102)

      expect(await pairorderbook.balancesSpot(owner.address,token0.address)).to.be.equal(balancesSpotToken0)
      expect(await pairorderbook.balancesTrade(owner.address,token0.address)).to.be.equal(balancesTradeToken0)



       // remove  orderSELL

      balancesSpotToken1 = (await pairorderbook.balancesSpot(owner.address,token1.address)).toNumber()
      balancesTradeToken1 = (await pairorderbook.balancesTrade(owner.address,token1.address)).toNumber()

      balancesSpotToken0 = (await pairorderbook.balancesSpot(owner.address,token0.address)).toNumber()
      balancesTradeToken0 = (await pairorderbook.balancesTrade(owner.address,token0.address)).toNumber()

      index = 2 // index(2) 154
      prevIndex = await pairorderbook._findPrevOrder(isSell, index) // find index-preindex are contiguous
      await pairorderbook.connect(owner).removeOrder(isSell, index, prevIndex)

                    // when remove  orderSELL  277 154 93 23 7 --remove(index4)--> 277 93 23 7 

      expect(orderToList(await pairorderbook.getOrderBook(isSell))).to.deep.equal([277,93,23,7])

      //cheack balancesSpot and balancesTrade
      expect(await pairorderbook.balancesSpot(owner.address,token1.address)).to.be.equal( balancesSpotToken1)
      expect(await pairorderbook.balancesTrade(owner.address,token1.address)).to.be.equal(balancesTradeToken1)

      expect(await pairorderbook.balancesSpot(owner.address,token0.address)).to.be.equal(balancesSpotToken0 + 1)
      expect(await pairorderbook.balancesTrade(owner.address,token0.address)).to.be.equal(balancesTradeToken0 - 1)

     
    })
 
  })

describe('UpdateOrder',async () => {
    beforeEach(async () => {
      let price: number
      let amount = 1
      let prevNodeID: BigNumber
      let isBuy = 0
      let isSell = 1

      // order 1  -> price 112 buy
      price = 112
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder(isBuy,token0.address,amount,price,prevNodeID)

      // order 2  -> price 23 sell
      price = 23
      prevNodeID = await pairorderbook._findIndex(price, isSell)
      await pairorderbook.connect(owner).createLimitOrder (isSell,token0.address,amount,price,prevNodeID)
    

      // order 3  -> price 7 buy
      price = 7
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,amount,price,prevNodeID)

      // order 4  -> price 245 buy
      price = 245
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,amount,price,prevNodeID)

      // order 5  -> price 154 sell
      price = 154
      prevNodeID = await pairorderbook._findIndex(price, isSell)
      await pairorderbook.connect(owner).createLimitOrder (isSell,token0.address,amount,price,prevNodeID)

      // order 6  -> price 477 sell
      price = 277
      prevNodeID = await pairorderbook._findIndex(price, isSell)
      await pairorderbook.connect(owner).createLimitOrder (isSell,token0.address,amount,price,prevNodeID)

      // order 7  -> price 93 sell
      price = 93
      prevNodeID = await pairorderbook._findIndex(price, isSell)
      await pairorderbook.connect(owner).createLimitOrder (isSell,token0.address,amount,price,prevNodeID)

      // order 8  -> price 102 buy
      price = 102
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,amount,price,prevNodeID)

      // order 9  -> price 7 sell
      price = 7
      prevNodeID = await pairorderbook._findIndex(price, isSell)
      await pairorderbook.connect(owner).createLimitOrder (isSell,token0.address,amount,price,prevNodeID)

      // order 10  -> price 23 buy
      price = 23
      prevNodeID = await pairorderbook._findIndex(price, isBuy)
      await pairorderbook.connect(owner).createLimitOrder (isBuy,token0.address,amount,price,prevNodeID)

      // BUY  112 7 245 102 23  --order-->  245 112 102 23 7
      // SELL 23 154 277 93 7   --order-->  277 154 93 23 7


  })

    it("Should revert when UpdateOrder and index not exist", async() => {
      let isBuy = 0
      let newPrice = 912
      let newAmount = 1
      let index = 6 // not exist -> orderBUY  index(1)112 index(2)7 index(3)245 index(4)102 index(5)23
      let prevIndexAdd = BigNumber.from(7)
      let prevIndexRemove = BigNumber.from(8)

      await expect(pairorderbook._findPrevOrder(isBuy, index)).to.be.revertedWith("_findPrevOrder not exist")
      await expect(pairorderbook.connect(owner).updateOrder(isBuy, index, newPrice,newAmount,prevIndexAdd,prevIndexRemove)).to.be.revertedWith("you are not owner of this position order") // cause owner is address0
    })
    it("Should revert when UpdateOrder and index/prevIndexRemove/prevIndexAdd not exist", async() => {
      let isBuy = 0
      let newPrice = 912
      let newAmount = 1
      let index = 3 //  orderBUY  index(1)112 index(2)7 index(3)245 index(4)102 index(5)23
      let prevIndexAdd = BigNumber.from(9)
      let prevIndexRemove = BigNumber.from(12)

      await expect(pairorderbook._findPrevOrder(isBuy, 12)).to.be.revertedWith("_findPrevOrder not exist")
      await expect(pairorderbook.connect(owner).updateOrder(isBuy, index, newPrice,newAmount,prevIndexAdd,prevIndexRemove)).to.be.revertedWith("index not exist") 
    })
    it("Should revert when UpdateOrder and index-preindex are not contiguous", async() => {
     let isBuy = 0
      let newPrice = 912
      let newAmount = 1
      let index = 3 //  orderBUY  index(1)112 index(2)7 index(3)245 index(4)102 index(5)23
      let prevIndexAdd:BigNumber
      let prevIndexRemove: BigNumber

      // BUY  112 7 245 102 23  --order-->  245 112 102 23 7

      prevIndexAdd = BigNumber.from(5)
      prevIndexRemove = BigNumber.from(4)
      
      await expect(pairorderbook.connect(owner).updateOrder(isBuy, index, newPrice,newAmount,prevIndexAdd,prevIndexRemove)).to.be.revertedWith("index is not pre") 
    })

    it('Should revert when UpdateOrder and not owner  position order', async () => {
      let isBuy = 0
      let newPrice = 300
      let newAmount = 1
      let index = 2 //  orderBUY  index(1)112 index(2)7 index(3)245 index(4)102 index(5)23
      let prevIndexAdd:BigNumber
      let prevIndexRemove:BigNumber

      prevIndexAdd = await pairorderbook._findIndex(newPrice, isBuy)
      prevIndexRemove = await pairorderbook._findPrevOrder(isBuy, index)
      await expect(pairorderbook.connect(addr1).updateOrder(isBuy, index, newPrice,newAmount,prevIndexAdd,prevIndexRemove)).to.be.revertedWith("you are not owner of this position order") 
    })

    it('Should pass when UpdateOrder and index-preindex are contiguous and exist', async () => {
  
      
      let prevIndexAdd:BigNumber
      let prevIndexRemove:BigNumber
      let newPrice: number
      let newAmount: number
      let balancesSpotToken1  : number
      let balancesTradeToken1 : number
      let balancesSpotToken0  : number
      let balancesTradeToken0 : number

      let index: number
      let isSell = 1  // orderSell  index(1)23 index(2)154 index(3)277 index(4)93 index(5)7
                      // SELL 23 154 277 93 7   --order-->  277 154 93 23 7

      let isBuy = 0  // orderBUY  index(1)112 index(2)7 index(3)245 index(4)102 index(5)23
                        // BUY  112 7 245 102 23  --order-->  245 112 102 23 7

                        
      // update  orderBUY 

      balancesSpotToken1 = (await pairorderbook.balancesSpot(owner.address,token1.address)).toNumber()
      balancesTradeToken1 = (await pairorderbook.balancesTrade(owner.address,token1.address)).toNumber()

      balancesSpotToken0 = (await pairorderbook.balancesSpot(owner.address,token0.address)).toNumber()
      balancesTradeToken0 = (await pairorderbook.balancesTrade(owner.address,token0.address)).toNumber()

      index = 2  // index(2) 7
      newPrice = 130
      newAmount = 1
      prevIndexAdd = await pairorderbook._findIndex(newPrice, isBuy)
      prevIndexRemove = await pairorderbook._findPrevOrder(isBuy, index)
      await pairorderbook.connect(owner).updateOrder(isBuy, index, newPrice,newAmount,prevIndexAdd,prevIndexRemove)


                      // when update  BUY   245 112 102 23 7 --update(index2)-->    245 130 112 102 23 
       
      expect(orderToList(await pairorderbook.getOrderBook(isBuy))).to.deep.equal([245,130,112,102,23])


       //cheack balancesSpot and balancesTrade
      expect(await pairorderbook.balancesSpot(owner.address,token1.address)).to.be.equal(balancesSpotToken1  - (newPrice-7) )
      expect(await pairorderbook.balancesTrade(owner.address,token1.address)).to.be.equal(balancesTradeToken1 + (newPrice-7) )

      expect(await pairorderbook.balancesSpot(owner.address,token0.address)).to.be.equal(balancesSpotToken0)
      expect(await pairorderbook.balancesTrade(owner.address,token0.address)).to.be.equal(balancesTradeToken0)



       // remove  orderSELL

      balancesSpotToken1 = (await pairorderbook.balancesSpot(owner.address,token1.address)).toNumber()
      balancesTradeToken1 = (await pairorderbook.balancesTrade(owner.address,token1.address)).toNumber()

      balancesSpotToken0 = (await pairorderbook.balancesSpot(owner.address,token0.address)).toNumber()
      balancesTradeToken0 = (await pairorderbook.balancesTrade(owner.address,token0.address)).toNumber()

      index = 4  // index(4) 93
      newPrice = 3
      newAmount = 5
      prevIndexAdd = await pairorderbook._findIndex(newPrice, isSell)
      prevIndexRemove = await pairorderbook._findPrevOrder(isSell, index)
      await pairorderbook.connect(owner).updateOrder(isSell, index, newPrice,newAmount,prevIndexAdd,prevIndexRemove)

                      // when update  SELL   277 154 93 23 7 --update(index2)-->  277 154 23 7 3

      expect(orderToList(await pairorderbook.getOrderBook(isSell))).to.deep.equal([277,154,23,7,3])

       //cheack balancesSpot and balancesTrade
      expect(await pairorderbook.balancesSpot(owner.address,token1.address)).to.be.equal( balancesSpotToken1)
      expect(await pairorderbook.balancesTrade(owner.address,token1.address)).to.be.equal(balancesTradeToken1)

      expect(await pairorderbook.balancesSpot(owner.address,token0.address)).to.be.equal(balancesSpotToken0 - (newAmount - 1))
      expect(await pairorderbook.balancesTrade(owner.address,token0.address)).to.be.equal(balancesTradeToken0 + (newAmount - 1) )

    })
 
  })

})