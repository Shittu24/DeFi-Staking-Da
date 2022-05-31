const { assert } = require("chai");

const Tether = artifacts.require("Tether");
const RWD = artifacts.require("RWD");
const DecentralBank = artifacts.require("DecentralBank");

require("chai")
.use(require("chai-as-promised"))
.should()

contract("DecentralBank", ([owner, customer]) => {
    let tether, rwd, decentralBank

    function tokens(number) {
        return web3.utils.toWei(number, "ether")
    }

    before(async () => {
        tether = await Tether.new()
        rwd = await RWD.new()
        decentralBank = await DecentralBank.new(rwd.address, tether.address)

        //Transfer all reward tokens to Decentral Bank
        await rwd.transfer(decentralBank.address, tokens("1000000"))

        //Transfer 100 mock tether tokens to customer
        await tether.transfer(customer, tokens("100"), {from: owner})
    })

    describe("Mock Tether Token Deployment", async () => {
        it("name matches successfully", async () => {
            const name = await tether.name()
            assert.equal = (name, "Mock Tether Token")
        })
    })

    describe("Reward Token Deployment", async () => {
        it("name matches successfully", async () => {
            const name = await rwd.name()
            assert.equal = (name, "Reward Token")
        })
    })

    describe("Decentral Bank Token Deployment", async () => {
        it("name matches successfully", async () => {
            const name = await decentralBank.name()
            assert.equal = (name, "Decentral Bank")
        })

        it("contract has tokens", async () => {
            const balance = await rwd.balanceOf(decentralBank.address)
            assert.equal = (balance, tokens("1000000"))
        })

        
    })

    describe("Yield Farming", async () => {
        it("reward tokens for staking", async () => {
            let result

            //  Check investor balance
            result = await tether.balanceOf(customer)
            assert.equal = (result.toString(), tokens("100"), "customer balance before staking")

            //Check staking for customers of 100 tokens
            await rwd.approve(decentralBank.address, tokens("100"), {from: customer})
            await decentralBank.depositTokens(tokens("1000000"), {from: customer})

            //check updated balance of customer
            result = await tether.balanceOf(customer)
            assert.equal = (result.toString(), tokens("0"), "customer balance after staking")

            //check updated balance of decentral bank
            result = await tether.balanceOf(decentralBank.address)
            assert.equal = (result.toString(), tokens("100"), "Decentral Bank balance after staking")

            //Is staking update
            result = await decentralBank.isStaking(customer)
            assert.equal = (result.toString(), "true", "customer staking status")

            //Issue tokens
            await decentralBank.issueTokens({from: owner})

            //Ensure only owner an issue tokens
            await decentralBank.issueTokens({from: customer}).should.be.rejected

            //Unstake tokens 
            // await decentralBank.unstakeTokens({from: owner})

            //check unstaking balances
            result = await tether.balanceOf(customer)
            assert.equal = (result.toString(), tokens("100"), "Customer balance after unstaking")

            //Check updated balance of Decentral Bank
            result = await tether.balanceOf(decentralBank.address)
            assert.equal = (result.toString(), tokens("0"), "Decentral Bank balance after unstaking")

            // Is Staking update
            result = await decentralBank.isStaking(customer)
            assert.equal = (result.toString(), "false", "customer staking status")
        })
    })
})