interface EventMarketOrder {
  Date: number
  Side: number
  amount: string
  price: string
}

interface EventAllOrder {
  Date: number
  Side: number
  amount: string
  price: string
  Type: String
}



interface Order {
  id: number
  addressTrader: string
  BuyOrSell: number
  createdDate: string
  addressToken: string
  amount: string
  price: string
  filled: string
}