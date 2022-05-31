// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./RWD.sol";
import "./Tether.sol";

contract DecentralBank {
  string public name = "Decentral Bank";
  address public owner;
  Tether public tether;
  RWD public rwd;

  address[] public stakers;
  mapping(address => uint) public stakingBalance;
  mapping(address => bool) public hasStaked;
  mapping(address => bool) public isStaking;

  constructor(Tether _tether, RWD _rwd) public {
    tether = _tether;
    rwd = _rwd;
    owner = msg.sender;
  }

  //staking function
  function depositTokens(uint _amount) public {
    require(_amount > 0, "amount cannot be 0");
    //Transfer tether tokens to this address for staking
    tether.transferFrom(msg.sender, address(this), _amount);
    //Update staking balance
    stakingBalance[msg.sender] += _amount;

    if(!hasStaked[msg.sender]) {
      stakers.push(msg.sender);
    }
    //update staking balance
    hasStaked[msg.sender] = true;
    isStaking[msg.sender] = true;
  }

  //unstake tokens
  function unstakeTokens() public {
    uint balance =stakingBalance[msg.sender];
    //require amount to be greater than 0
    require(balance > 0, "staking balance cannot be less than zero");
    //Transfer the tokens to the contract address from our bank
    tether.transfer(msg.sender, balance);
    //Reset staking balance
    stakingBalance[msg.sender] = 0;
    //Update staking status
    isStaking[msg.sender] = false;
  }

  //issue rewards
  function issueTokens() public {
    //require only owner to be able to issue tokens
    require(msg.sender == owner, "only owner can call this function");
    //Issue rewards for staking
    for(uint i = 0; i < stakers.length; i++) {
      address recipient = stakers[i];
      // staking rewards is the amount staked divided by 9
      uint balance = stakingBalance[recipient] / 9;
      //Ensure stakers actually staked before issuing rewards
      if(balance > 0) {
        rwd.transfer(recipient, balance);
      }
    }
  }

}