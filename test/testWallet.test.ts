import {
  Wallet,
  Wallet__factory,
  TestToken,
  TestToken__factory,
} from '../typechain-types'
// @ts-ignore
import { ethers } from 'hardhat'
import { assert, expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { BigNumber } from 'ethers'
import { AddressZero } from '@ethersproject/constants'
describe('Wallet', async () => {
  let wallet: Wallet
  let token0: TestToken
  let token1: TestToken
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  const initialSupply = 1000 // initialSupply Token

  beforeEach(async () => {
    [owner, addr1] = await ethers.getSigners()

    const TOKEN0 = (await ethers.getContractFactory(
      'TestToken',
      owner
    )) as TestToken__factory
    token0 = await TOKEN0.deploy(initialSupply)

    const TOKEN1 = (await ethers.getContractFactory(
      'TestToken',
      owner
    )) as TestToken__factory
    token1 = await TOKEN1.deploy(initialSupply)

    const Wallet = (await ethers.getContractFactory(
      'Wallet',
      owner
    )) as Wallet__factory
    wallet = await Wallet.deploy(token0.address, token1.address)

    // approve
    await token0.connect(owner).approve(wallet.address, initialSupply)
    await token1.connect(owner).approve(wallet.address, initialSupply)

    // deposit token
    await wallet.connect(owner).deposit(initialSupply, token0.address)
    await wallet.connect(owner).deposit(initialSupply, token1.address)
  })

  describe('Deposit', async () => {
    it(' Should revert when deposit and  input amount = 0', async () => {

      // check  require amount > 0
      await expect(  wallet.connect(owner).deposit(0, token0.address) ).to.be.revertedWith("can't deposit 0")

    })
    it(' Should revert when deposit and not sufficient balance', async () => {

      // check  require balance msg.sender >= amount
      await expect(  wallet.connect(owner).deposit(1, token0.address) ).to.be.revertedWith('balance not sufficient')

    })
    it(' Should revert when deposit and invalid token address', async () => {

      // check  modifier validtoke
      await expect(  wallet.connect(owner).deposit(1, AddressZero) ).to.be.revertedWith('invalid token')

    })
    it(' Should pass when deposit and enough balance', async () => { 
        
        // check  mapping balancesSpot
        expect( await wallet.balancesSpot(owner.address, token0.address)  ).to.be.equal(1000)

        // check  token0 balanceOf
        expect (await token0.balanceOf(owner.address)).to.be.equal(0)
        expect (await token0.balanceOf(wallet.address)).to.be.equal(1000)

        // check  token1 balanceOf
        expect (await token1.balanceOf(owner.address)).to.be.equal(0)
        expect (await token1.balanceOf(wallet.address)).to.be.equal(1000)
    })
  })

  describe('Withdraw', async () => {
    it(' Should revert when withdraw and  input amount = 0', async () => {

      // check  require amount > 0
      await expect(  wallet.connect(owner).withdraw(0, token0.address) ).to.be.revertedWith("can't withdraw 0")

    })
    it(' Should revert when withdraw and not sufficient balancesSpot', async () => {

      // check  require balancesSpot msg.sender >= amount
      await expect(  wallet.connect(owner).withdraw(9999, token0.address) ).to.be.revertedWith('balance not sufficient')

    })
    it(' Should revert when withdraw and invalid token address', async () => {

      // check  modifier validtoke
      await expect(  wallet.connect(owner).withdraw(1, AddressZero) ).to.be.revertedWith('invalid token')

    })
    it(' Should pass when withdraw and sufficient balancesSpot', async () => { 

        // withdraw  
        await wallet.connect(owner).withdraw(500,token0.address)
        await wallet.connect(owner).withdraw(300,token1.address)

        // check  mapping balancesSpot
        expect( await wallet.balancesSpot(owner.address, token0.address)  ).to.be.equal(500)
        expect( await wallet.balancesSpot(owner.address, token1.address)  ).to.be.equal(700)

        // check  token0 balanceOf
        expect (await token0.balanceOf(owner.address)).to.be.equal(500)
        expect (await token0.balanceOf(wallet.address)).to.be.equal(500)

        // check  token1 balanceOf
        expect (await token1.balanceOf(owner.address)).to.be.equal(300)
        expect (await token1.balanceOf(wallet.address)).to.be.equal(700)
    })
  })
})
