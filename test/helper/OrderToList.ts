import {PairNewOrder} from '../../typechain-types'

export function orderToList(listOrder: PairNewOrder.OrderStructOutput[]) : number[] {
  
  let resultPrice = []
  listOrder.map((item) => {
    resultPrice.push(item.price.toNumber())
  }) 
  return resultPrice  
}


