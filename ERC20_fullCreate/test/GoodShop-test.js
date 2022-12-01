const { expect } = require("chai")
const { ethers } = require("hardhat")
const tokenJSON = require("../artifacts/contracts/erc20/Erc.sol/GoodFoodToken.json")

describe("GoodShop", function () {
    let owner
    let buyer
    let shop
    let erc20

    beforeEach(async function() {
        [owner, buyer] = await ethers.getSigners()

        const GoodShop = await ethers.getContractFactory("GoodShop", owner)
        shop = await GoodShop.deploy()
        await shop.deployed()

        erc20 = new ethers.Contract(await shop.token(), tokenJSON.abi, owner)
    })

    it("should have an owner and a token", async function(){
        expect(await shop.owner()).to.eq(owner.address)

        expect(await shop.token()).to.be.properAddress
    })

    it("allows to buy", async function() {
        const tokenAmount = 3
        const txData = {
            value: tokenAmount,
            to: shop.address
        }
        const tx = await buyer.sendTransaction(txData)
        await tx.wait()
        expect(await erc20.balanceOf(buyer.address)).to.eq(tokenAmount)

        await expect(() => tx).
        to.changeEtherBalance(shop, tokenAmount)

        await expect(tx).
        to.emit(shop, "Bought")
        .withArgs(tokenAmount, buyer.address)

        await expect(
            buyer.
            sendTransaction( {value: 0, to: shop.address} )
            ).to.be.revertedWith("not enough funds!")

        await expect(
            buyer.
            sendTransaction( {value: 48, to: shop.address} )
            ).to.be.revertedWith("not enough tokens")

    })

    it("allows to sell", async function() {
        const tx = await buyer.sendTransaction({
            value: 8,
            to: shop.address
        })
        await tx.wait()

        const sellAmount = 5
        const notApprove = 2
        const amountToSell = 0
        const approval = await erc20.connect(buyer).approve(shop.address, sellAmount)
        await approval.wait()

        const sellTx = await shop.connect(buyer).sell(sellAmount)
        expect( await erc20.balanceOf(buyer.address)).to.eq(3)

        await expect(() => sellTx).
        to.changeEtherBalance(shop, -sellAmount)

        await expect(sellTx).
        to.emit(shop, "Sold")
        .withArgs(sellAmount, buyer.address)

        await expect(
            shop.connect(buyer).
            sell(notApprove)
            ).to.be.revertedWith("check allowance!")
        
        await expect(
            shop.connect(buyer).
            sell(amountToSell)
            ).to.be.revertedWith("incorrect amount!")
    })

    it("correct withdraw", async function() {
        const tx = await buyer.sendTransaction({
            value: 3,
            to: shop.address
        })
        await tx.wait()

        const withdraw = await shop.withdrawAll(owner.address)
        expect(withdraw).to.changeEtherBalance(owner, 2)

        await expect(
            shop.connect(buyer).
            withdrawAll(buyer.address)
            ).to.be.revertedWith("Not an owner")
    })

    it("correct name", async function() {
        const name = await erc20.name()
        expect(name).to.eq("GoodFood")
    })

    it("correct symbol", async function() {
        const symbol = await erc20.symbol()
        expect(symbol).to.eq("GOFO")
    })

    it("correct decimals", async function() {
        const dec = await erc20.decimals()
        expect(dec).to.eq("18")
    })

    it("correct supply", async function() {
        const supply = await erc20.totalSupply()
        expect(supply).to.eq("50")
    })

    it("allow to burn", async function() {
        const tokenAmount = 3
        const txData = {
            value: tokenAmount,
            to: shop.address,
            gasLimit: 2100000,
            gasPrice: 8000000000
        }
        const tx = await buyer.sendTransaction(txData)
        await tx.wait()
        expect(await erc20.balanceOf(buyer.address)).to.eq(tokenAmount)
        const approval = await erc20.connect(buyer).approve(buyer.address, tokenAmount)
        await approval.wait()

        const burn = await erc20.connect(owner).burn(buyer.address, tokenAmount)
        await burn.wait()
        expect( await erc20.balanceOf(buyer.address)).to.eq(0)
    })
})