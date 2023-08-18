// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract ExpirableToken is ERC20, Ownable {
    struct BuyerInfo {
        uint256 lastUsageTimestamp;
    }

    mapping(address => bool) public whitelistedAddresses;
    mapping(address => bool) public buyerAddresses;
    mapping(address => BuyerInfo) public buyerInfo;

    uint256 public conversionRate = 1;
    address public sharedWallet;
    uint256 public burnedTokenCount;
    uint256 public constant MAX_SUPPLY = 1e10;

    uint256 public decayInterval = 30 days; // You can adjust the interval
    uint256 public decayRate = 10; // Percentage of balance to decay per interval

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    modifier onlyTransferAllowed() {
        require(
            whitelistedAddresses[msg.sender],
            "Sender is not allowed to transfer"
        );
        _;
    }

    modifier onlyOwnerOrWhitelist() {
        require(
            msg.sender == owner() || whitelistedAddresses[msg.sender],
            "Sender is not allowed"
        );
        _;
    }

    function setConversionRate(uint256 rate) public onlyOwner {
        conversionRate = rate;
    }

    function setSharedWallet(address wallet) public onlyOwner {
        sharedWallet = wallet;
    }

    function addToWhitelist(address account) public onlyOwner {
        whitelistedAddresses[account] = true;
    }

    function removeFromWhitelist(address account) public onlyOwner {
        whitelistedAddresses[account] = false;
    }

    function addToBuyerAddresses(address account) public onlyOwner {
        buyerAddresses[account] = true;
    }

    function removeFromBuyerAddresses(address account) public onlyOwner {
        buyerAddresses[account] = false;
    }

    function mintToSharedWallet(uint256 amount) public onlyOwnerOrWhitelist {
        require(sharedWallet != address(0), "Shared wallet not set");
        require(amount > 0, "Amount must be greater than zero");

        _mint(sharedWallet, amount);
    }

    function rewardBuyer(
        address recipient,
        uint256 amount
    ) public onlyOwnerOrWhitelist {
        require(recipient != address(0), "Invalid recipient address");

        _transfer(sharedWallet, recipient, amount);
        //buyerInfo[recipient].lastUsageTimestamp = block.timestamp;
    }

    function rewardBuyerWithPredefinedAmount(
        address recipient,
        uint256 amount
    ) public onlyOwner {
        require(amount > 0, "Amount must be greater than zero");

        _transfer(sharedWallet, recipient, amount);
        //buyerInfo[recipient].lastUsageTimestamp = block.timestamp;
    }

    // function redeemDiscount(uint256 tokensToRedeem) public {
    //     require(buyerAddresses[msg.sender], "Only whitelisted addresses can redeem discounts");
    //     require(tokensToRedeem > 0, "Invalid token amount");

    //     uint256 maxRedeemableTokens = balanceOf(sharedWallet);
    //     require(tokensToRedeem <= maxRedeemableTokens, "Exceeds available tokens for redemption");

    //     uint256 discountAmount = tokensToRedeem * conversionRate;
    //     _burn(sharedWallet, tokensToRedeem);

    //     // Update the last usage timestamp upon redeeming discount
    //     buyerInfo[msg.sender].lastUsageTimestamp = block.timestamp;
    // }

    function redeemDiscount(uint256 tokensToRedeem) public {
        require(
            buyerAddresses[msg.sender],
            "Only whitelisted addresses can redeem discounts"
        );
        require(tokensToRedeem > 0, "Invalid token amount");
        require(
            tokensToRedeem <= balanceOf(msg.sender),
            "Exceeds tokens available in sender's wallet"
        );

        // Compute discountAmount if needed for any other operations (e.g., logging, computation, etc.)
        uint256 discountAmount = tokensToRedeem * conversionRate;

        // Burn tokens directly from the buyer's address
        _burn(msg.sender, tokensToRedeem);

        // Update the last usage timestamp upon redeeming discount
        buyerInfo[msg.sender].lastUsageTimestamp = block.timestamp;
    }

    function burnExpiredTokens(address account) public onlyOwner {
        uint256 tokensToBurn = balanceOf(account);
        burnedTokenCount += tokensToBurn;
        _burn(account, tokensToBurn);
    }

    function transfer(
        address recipient,
        uint256 amount
    ) public override onlyTransferAllowed returns (bool) {
        decayTokens(msg.sender);
        decayTokens(recipient);
        return super.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override onlyTransferAllowed returns (bool) {
        decayTokens(sender);
        decayTokens(recipient);
        return super.transferFrom(sender, recipient, amount);
    }

    function decayTokens(address account) internal {
        if (
            buyerAddresses[account] && buyerInfo[account].lastUsageTimestamp > 0
        ) {
            uint256 elapsedIntervals = (block.timestamp -
                buyerInfo[account].lastUsageTimestamp) / decayInterval;
            uint256 decayedAmount = ((balanceOf(account) * decayRate) / 100) *
                elapsedIntervals;
            if (decayedAmount > 0) {
                _burn(account, decayedAmount);
            }
        }
    }

    function automateMinting() public onlyOwner {
        uint256 tokensToMint = burnedTokenCount;
        require(tokensToMint > 0, "No burned tokens to mint");

        if (totalSupply() + tokensToMint <= MAX_SUPPLY) {
            _mint(owner(), tokensToMint);
            burnedTokenCount = 0;
        }
    }
}
