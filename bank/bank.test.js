const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("Bank", function () {
  let owner
  let bank
  let user
 

  beforeEach(async function() {
    [owner, user] = await ethers.getSigners()

    const Bank = await ethers.getContractFactory("Bank", owner)
    bank = await Bank.deploy()
    await bank.deployed()
    })

    it("allows a user to deposit funds", async function() {
        const tx = await bank.connect(user).deposit({
          value: ethers.utils.parseEther("0.005")
          })
        await tx.wait()
        
        const balance = await bank.balanceOf(user.address)
        expect(balance).to.eq(ethers.utils.parseEther("0.005"))
    })

    it("correct withdraw funds", async function(){
      const tx = await bank.connect(user).deposit({
        value: ethers.utils.parseEther("0.005")
        })
      await tx.wait()

      await bank.connect(user).withdraw(ethers.utils.parseEther("0.004"))
      expect( await bank.balanceOf(user.address)).to.eq(ethers.utils.parseEther("0.001"))

      await expect(
        bank.connect(user).
        withdraw(ethers.utils.parseEther("0.002"))
        ).to.be.revertedWith("not enough founds")
    })
})
