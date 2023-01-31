import React, {createContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import artifactPairNewOrder from '../../artifacts/contracts/PairOrder.sol/PairNewOrder.json'
import artifactToken from '../../artifacts/contracts/Token0.sol/Token0.json'
import {PairNewOrder,PairNewOrder__factory,Token0,Token0__factory,Token1,Token1__factory} from '../../typechain-types'
const ContractPairOrderAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
const ContractToken0Address = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const ContractToken1Address = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'

interface Order {
  id: number
  addressTrader: string
  BuyOrSell: number
  addressToken: string
  amount: number
  price: number
  filled: number
}

interface IContract {
  loadingOrderSell: boolean
  loadingOrderBuy: boolean
  loadOrderBook: () => Promise<void>
  orderBookSell: Order[]
  orderBookBuy: Order[]
  priceToken: number
  sendTxMarketOrder: (side: number, amount: number | string) => Promise<void>
  balancesSpotToken0: number
  balancesTradeToken0: number
  balancesSpotToken1: number
  balancesTradeToken1: number
  sendTxLimitOrder : (side: number, amount: number | string, price: number | string) => Promise<void>
  isLoadingOrderBookByAddress:boolean,
  orderBookByAddress:Order[]
  loadOrderBookByAddress: (address: string) => Promise<void>
}

export const ContractContext = createContext<IContract>({
  loadingOrderSell: false,
  loadingOrderBuy: false,
  loadOrderBook: async () => {},
  orderBookSell: [],
  orderBookBuy: [],
  priceToken: 0,
  sendTxMarketOrder: async () => {},
  balancesSpotToken0: 0,
  balancesTradeToken0: 0,
  balancesSpotToken1: 0,
  balancesTradeToken1: 0,
  sendTxLimitOrder: async () => {},
  isLoadingOrderBookByAddress: false,
  orderBookByAddress: [],
  loadOrderBookByAddress: async () => {},
})








const getPairOrderContract = () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any )
  const signer = provider.getSigner()
  const pairordercontract = new ethers.Contract(
    ContractPairOrderAddress,
    artifactPairNewOrder.abi,
    signer
  ) as PairNewOrder

  return pairordercontract
}
// const getTokenContract = (tokenAddress : string) => {
//   const provider = new ethers.providers.Web3Provider(window.ethereum as any)
//   const signer = provider.getSigner()
//   const tokenContract = new ethers.Contract(tokenAddress, artifactToken.abi, signer) as Token0

//   return tokenContract
// }

interface ChildrenProps {
  children: React.ReactNode
}


export const ContractProvider = ({ children }: ChildrenProps) => {


  const [initialLoading, setInitialLoading] = useState(false)

  // order sell
  const [orderBookSell, setOrderBookSell] = useState<Order[]>([])
  const [loadingOrderSell, setLoadingOrderSell] = useState(false)

  // order buy
  const [orderBookBuy, setOrderBookBuy] = useState <Order[]>([])
  const [loadingOrderBuy, setLoadingOrderBuy] = useState(false)

  // price 
  const [priceToken,setPriceToken] = useState<number>(0)

  // balances
  const [balancesSpotToken0, setBalancesSpotToken0] = useState<number>(0)
  const [balancesTradeToken0, setBalancesTradeToken0] = useState<number>(0)
  const [balancesSpotToken1, setBalancesSpotToken1] = useState<number>(0)
  const [balancesTradeToken1, setBalancesTradeToken1] = useState<number>(0)


  // order by address
  const [orderBookByAddress, setOrderBookByAddress] = useState<Order[]>([])
  const [isLoadingOrderBookByAddress,setIsLoadingOrderBookByAddress] = useState(false)

  // helper
  // const toString = (bytes32) => ethers.utils.parseBytes32String(bytes32)
  const toWei = (ether :string) => ethers.utils.parseEther(ether)
  const toEther = (wei : string) => ethers.utils.formatEther(wei)
  const toFixUnits = (amount : number, decimal :string) => ethers.utils.formatUnits(amount, decimal)

 
  
  useEffect(() => {
     if (!window.ethereum) return console.log('Please install metamask')
     setInitialLoading(false)
     loadOrderBook()
     loadPriceToken()
     loadBalances()
     loadOrderBookByAddress()

   }, [])

   const sendTxMarketOrder = async (side: number, amount: number | string) => {
     if (!window.ethereum) return console.log('Please install metamask')
     try {
       const contract = getPairOrderContract()

       const transactionHash = await contract.createMarketOrder(side, amount)
       console.log(transactionHash.hash)
       await transactionHash.wait()
     } catch (error) {
       console.log(error)
     }
     loadOrderBook()
     loadPriceToken()
     loadBalances()
   }

   const sendTxLimitOrder = async (side: number, amount: number | string, price: number | string) => {
    
     if (!window.ethereum) return console.log('Please install metamask')
     try {
       const contract = getPairOrderContract()
       const prevNodeID = await contract._findIndex(price,side)
       const transactionHash = await contract.createLimitOrder(side,amount,price,prevNodeID) 
       console.log(transactionHash.hash)
       await transactionHash.wait()
     } catch (error) {
       console.log(error)
     }
     loadOrderBook()
     loadPriceToken()
     loadBalances()
   }

   

  
  const loadPriceToken = async () => {
    if (!window.ethereum) return console.log('Please install metamask')
    try {

      const contract = getPairOrderContract()

      const dataPriceToken = await contract.price()

      setPriceToken(dataPriceToken.toNumber())
    } catch (error) {
       console.log(error)
    }
  }

  const loadBalances = async () => {
    if (!window.ethereum) return console.log('Please install metamask')
    try {
      const contract = getPairOrderContract()

      const accounts = await window.ethereum.request({ method: 'eth_accounts' })

      const dataBalancesSpotToken0 = await contract.balancesSpot(accounts[0],ContractToken0Address)
      const dataBalancesTradeToken0 = await contract.balancesTrade(accounts[0],ContractToken0Address)
      setBalancesSpotToken0(dataBalancesSpotToken0.toNumber())
      setBalancesTradeToken0(dataBalancesTradeToken0.toNumber())

      const dataBalancesSpotToken1 = await contract.balancesSpot(accounts[0],ContractToken1Address)
      const dataBalancesTradeToken1 = await contract.balancesTrade(accounts[0],ContractToken1Address)
      setBalancesSpotToken1(dataBalancesSpotToken1.toNumber())
      setBalancesTradeToken1(dataBalancesTradeToken1.toNumber())
      console.log(accounts[0])
      console.log('suscess load dataBalancesSpotToken0', dataBalancesSpotToken0.toNumber())
      console.log('suscess load dataBalancesTradeToken0', dataBalancesTradeToken0.toNumber())


    } catch (error) {
       console.log(error)
    }
  }



  const loadOrderBook = async () => {
    if (!window.ethereum) return console.log('Please install metamask')

    setLoadingOrderBuy(true)
    setLoadingOrderSell(true)
    try {
    
      setOrderBookBuy([])
      setOrderBookSell([])

      const contract = getPairOrderContract()

      const [
        dataOrderSell,
        dataOrderBuy,
         ] = await Promise.all([
        await contract.getOrderBook(1),
        await contract.getOrderBook(0),
      ])

      dataOrderBuy.map((order)=>{
        const structOrder: Order = {
          id: order.id.toNumber(),
          addressTrader: order.trader.toString(),
          BuyOrSell: order.side,
          addressToken: order.token.toString(),
          amount: order.amount.toNumber(),
          price: order.price.toNumber(),
          filled: order.filled.toNumber(),
        } 
        setOrderBookBuy((prev) => [...prev, structOrder])
      })

      dataOrderSell.map((order)=>{
        const structOrder: Order = {
          id: order.id.toNumber(),
          addressTrader: order.trader.toString(),
          BuyOrSell: order.side,
          addressToken: order.token.toString(),
          amount: order.amount.toNumber(),
          price: order.price.toNumber(),
          filled: order.filled.toNumber(),
        } 
        setOrderBookSell((prev) => [...prev, structOrder])
      })


      setLoadingOrderBuy(false)
      setLoadingOrderSell(false)

    } catch (error) {
       setLoadingOrderBuy(false)
       setLoadingOrderSell(false)
       setOrderBookBuy([])
       setOrderBookSell([])
       console.log(error)
    }

  }

  const loadOrderBookByAddress = async (address? : string) => {
    if (!window.ethereum) return console.log('Please install metamask')

    setIsLoadingOrderBookByAddress(true)
    try {
    
      setOrderBookByAddress([])

      const contract = getPairOrderContract()

      if(address==undefined){
        address = (await window.ethereum.request({ method: 'eth_accounts' }))[0]
      }
      const dataOrderBookByAddress = await contract.getOrderBookByAddress(address)
       

      dataOrderBookByAddress.map((order) => {
        console.log(order)
        const structOrder: Order = {
          id: order.id.toNumber(),
          addressTrader: order.trader.toString(),
          BuyOrSell: order.side,
          addressToken: order.token.toString(),
          amount: order.amount.toNumber(),
          price: order.price.toNumber(),
          filled: order.filled.toNumber(),
        }
        setOrderBookByAddress((prev) => [...prev, structOrder])
      })
      console.log(orderBookByAddress)

      setIsLoadingOrderBookByAddress(false)

    } catch (error) {
       setIsLoadingOrderBookByAddress(false)
       setOrderBookByAddress([])
       console.log(error)
    }

  }

 

 
  

  return (
    <ContractContext.Provider
      value={{
        loadingOrderSell,
        loadingOrderBuy,
        loadOrderBook,
        orderBookSell,
        orderBookBuy,
        priceToken,
        sendTxMarketOrder,
        balancesSpotToken0,
        balancesTradeToken0,
        balancesSpotToken1,
        balancesTradeToken1,
        sendTxLimitOrder,
        isLoadingOrderBookByAddress,
        orderBookByAddress,
        loadOrderBookByAddress
      }}
    >
      {!initialLoading && children}
    </ContractContext.Provider>
  )
}
