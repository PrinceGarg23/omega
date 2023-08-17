// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LoyaltyToken is ERC20 {
    address private owner;
    mapping(address => bool) private sellers;
    mapping(address => uint256) private lastActionTimestamp;
    mapping(address => uint256) private redeemableTokens;

    uint256 public tokenDecayPeriod = 1 weeks; // Decay period is set to 1 week

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    modifier onlySeller() {
        require(
            sellers[msg.sender],
            "Only authorized sellers can call this function"
        );
        _;
    }

    function addSeller(address seller) public onlyOwner {
        sellers[seller] = true;
    }

    function removeSeller(address seller) public onlyOwner {
        sellers[seller] = false;
    }

    function mintToPool(uint256 amount) public onlyOwner {
        _mint(address(this), amount);
    }

    function setTokenDecayPeriod(uint256 period) public onlyOwner {
        tokenDecayPeriod = period;
    }

    function issueTokens(address buyer, uint256 amount) public onlySeller {
        require(
            balanceOf(address(this)) >= amount,
            "Insufficient tokens in the pool"
        );
        _transfer(address(this), buyer, amount);
        lastActionTimestamp[buyer] = block.timestamp;
        redeemableTokens[buyer] += amount;
    }

    function updateTokens(address account) internal {
        uint256 elapsedTime = block.timestamp - lastActionTimestamp[account];
        uint256 decayedTokens = (balanceOf(account) * elapsedTime) /
            tokenDecayPeriod;
        redeemableTokens[account] =
            redeemableTokens[account] +
            balanceOf(account) -
            decayedTokens;
        lastActionTimestamp[account] = block.timestamp;
    }

    function getEarnedTokens(address buyer) public returns (uint256) {
        updateTokens(buyer); // Update tokens before calculation
        return redeemableTokens[buyer];
    }

    function getRedeemableTokens(address buyer) public view returns (uint256) {
        return redeemableTokens[buyer];
    }

    function redeemTokens(uint256 amount) public {
        require(
            redeemableTokens[msg.sender] >= amount,
            "Not enough redeemable tokens"
        );
        updateTokens(msg.sender); // Update tokens before redeeming
        redeemableTokens[msg.sender] -= amount;
        _burn(msg.sender, amount);
    }
}
