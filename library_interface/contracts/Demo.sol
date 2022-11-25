// SPDX-License-Identifier: MIT

import "./Logger.sol";

pragma solidity ^0.8.0;

contract Demo {
    Logger logger;

    constructor(address _logger) {
        logger = Logger(_logger);
    }

    function payment(address _from, uint _number) public view returns(uint) {
        return logger.getEntry(_from, _number);
    }

    receive() external payable {
        logger.log(msg.sender, msg.value);
    }
}