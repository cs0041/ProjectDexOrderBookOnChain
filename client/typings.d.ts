interface EventMarketOrder {
  Date: number
  Side: number
  amount: number
  price: number
}

interface EventAllOrder {
  Date: number
  Side: number
  amount: number
  price: number
  Type: String
}



interface Order {
  id: number
  addressTrader: string
  BuyOrSell: number
  createdDate: string
  addressToken: string
  amount: number
  price: number
  filled: number
}