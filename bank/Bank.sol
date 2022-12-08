//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
contract Bank {
    mapping (address => uint) public _balances;

    function deposit() external payable {
        _balances[msg.sender] += msg.value;
    }

    function withdraw(uint amount) public {
        require(balanceOf(msg.sender) >= amount, "not enough founds");

        _balances[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }

    function balanceOf(address account) public view returns(uint256) {
        return _balances[account];
    }
}