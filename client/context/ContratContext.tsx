import React, {createContext, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import artifactPairNewOrder from '../../artifacts/contracts/PairOrder.sol/PairNewOrder.json'
import artifactToken from '../../artifacts/contracts/Token0.sol/Token0.json'
import {PairNewOrder,PairNewOrder__factory,Token0,Token0__factory,Token1,Token1__factory} from '../../typechain-types'
const ContractPairOrderAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'

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
  orderBookSell:Order[]
  orderBookBuy:Order[]
}

export const ContractContext = createContext<IContract>({
  loadingOrderSell: false,
  loadingOrderBuy: false,
  loadOrderBook: async () => {},
  orderBookSell: [],
  orderBookBuy: [],
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
const getTokenContract = (tokenAddress : string) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any)
  const signer = provider.getSigner()
  const tokenContract = new ethers.Contract(tokenAddress, artifactToken.abi, signer) as Token0

  return tokenContract
}

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



  // helper
  // const toString = (bytes32) => ethers.utils.parseBytes32String(bytes32)
  const toWei = (ether :string) => ethers.utils.parseEther(ether)
  const toEther = (wei : string) => ethers.utils.formatEther(wei)
  const toFixUnits = (amount : number, decimal :string) => ethers.utils.formatUnits(amount, decimal)

 
  
  useEffect(() => {
     if (!window.ethereum) return alert('Please install metamask')
     setInitialLoading(false)
     loadOrderBook()
   }, [])



  const loadOrderBook = async () => {
    setLoadingOrderBuy(true)
    setLoadingOrderSell(true)
    try {
      if (!window.ethereum) return console.log('Please install metamask')
    
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


      console.log('suscess load OrderSell', dataOrderSell)
      console.log('suscess load OrderBuy', dataOrderBuy)
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

 

 
  

  return (
    <ContractContext.Provider
      value={{
        loadingOrderSell,
        loadingOrderBuy,
        loadOrderBook,
        orderBookSell,
        orderBookBuy
      }}
    >
      {!initialLoading && children}
    </ContractContext.Provider>
  )
}
