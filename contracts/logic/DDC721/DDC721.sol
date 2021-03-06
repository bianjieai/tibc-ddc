// SPDX-License-Identifier:BSN DDC

pragma solidity ^0.8.0;

import "../../interface/DDC721/IDDC721.sol";
import "../../interface/DDC721/IERC721Receiver.sol";
import "../../interface/Charge/ICharge.sol";
import "../../interface/Authority/IAuthority.sol";
import "../../utils/AddressUpgradeable.sol";
import "../../utils/OwnableUpgradeable.sol";
import "../../proxy/utils/UUPSUpgradeable.sol";
import "../ERC165Upgradeable.sol";

/**
 * @title DDC721
 * @author Aaron zhang
 * @dev DDC721 contract
 */
contract DDC721 is
    OwnableUpgradeable,
    UUPSUpgradeable,
    ERC165Upgradeable,
    IDDC721
{
    using AddressUpgradeable for address;

    // ddc name
    string private _name;
    // ddc symbol
    string private _symbol;

    // Mapping from ddc ID to owner address
    mapping(uint256 => address) private _owners;

    // Mapping owner address to ddc count
    mapping(address => uint256) private _balances;

    // Mapping from ddc ID to approved address
    mapping(uint256 => address) private _ddcApprovals;

    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Mapping from ddc id to uri
    mapping(uint256 => string) private _ddcURIs;

    // Mapping from ddc ID to blacklist status
    mapping(uint256 => bool) _blacklist;

    // Records the last ddcid
    // Note: no need to change when ddc was burned.
    uint256 private _lastDDCId;

    // Charge proxy contract
    ICharge private _chargeProxy;

    // Authority proxy contract
    IAuthority private _authorityProxy;

    constructor() initializer {}

    function initialize() public initializer {
        __ERC165_init();
        __Ownable_init();
        __UUPSUpgradeable_init();
    }

    /**
     * @dev Function that should revert when `msg.sender` is not authorized to upgrade the contract. Called by
     * {upgradeTo} and {upgradeToAndCall}.
     *
     * Normally, this function will use an xref:access.adoc[access control] modifier such as {Ownable-onlyOwner}.
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyOwner
    {}

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165Upgradeable, IERC165Upgradeable)
        returns (bool)
    {
        return
            interfaceId == type(IDDC721).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IDDC721-setNameAndSymbol}.
     */
    function setNameAndSymbol(string memory name_, string memory symbol_)
        public
        override
        onlyOwner
    {
        _name = name_;
        _symbol = symbol_;
        emit SetNameAndSymbol(_name, _symbol);
    }

    /**
     * @dev See {IDDC721-setChargeProxyAddress}.
     */
    function setChargeProxyAddress(address chargeProxyAddress)
        public
        override
        onlyOwner
    {
        _requireContract(chargeProxyAddress);
        _chargeProxy = ICharge(chargeProxyAddress);
    }

    /**
     * @dev See {IDDC721-setAuthorityProxyAddress}.
     */
    function setAuthorityProxyAddress(address authorityProxyAddress)
        public
        override
        onlyOwner
    {
        _requireContract(authorityProxyAddress);
        _authorityProxy = IAuthority(authorityProxyAddress);
    }

    /**
     * @dev See {IDDC721-mint}.
     */
    function mint(address to, string memory _ddcURI) public override {
        _mint(to, _ddcURI);
    }

    function _mint(address to, string memory _ddcURI)
        private
        returns (uint256 ddcId)
    {
        _requireSenderHasFuncPermission();
        _requireAvailableDDCAccount(to);
        _requireOnePlatform(_msgSender(), to);
        ddcId =  _lastDDCId + 1;
        _mintAndPay(to, ddcId, _ddcURI);
        emit Transfer(_msgSender(), address(0), to, ddcId);
    }

    /**
     * @dev See {IDDC721-mintBatch}.
     */
    function mintBatch(address to, string[] memory ddcURIs) public override {
        _mintBatch(to, ddcURIs);
    }

    function _mintBatch(address to, string[] memory ddcURIs)
        private
        returns (uint256[] memory ddcIds)
    {
        _requireSenderHasFuncPermission();
        _requireAvailableDDCAccount(to);
        _requireOnePlatform(_msgSender(), to);
        ddcIds = new uint256[](ddcURIs.length);
        for (uint256 i = 0; i < ddcURIs.length; i++) {
            uint256 ddcId = _lastDDCId + 1;
            ddcIds[i] = ddcId;
            _mintAndPay(to, ddcId, ddcURIs[i]);
        }
        emit TransferBatch(_msgSender(), address(0), to, ddcIds);
    }

    /**
     * @dev See {IDDC721-safeMint}.
     */
    function safeMint(
        address to,
        string memory _ddcURI,
        bytes memory _data
    ) public override {
        uint256 ddcId = _mint(to, _ddcURI);
        require(
            _checkOnERC721Received(address(0), to, ddcId, _data),
            "DDC721:transfer to non ERC721Receiver implementer"
        );
    }

    /**
     * @dev See {IDDC721-safeMintBatch}.
     */
    function safeMintBatch(
        address to,
        string[] memory ddcURIs,
        bytes memory data
    ) public override {
        uint256[] memory ddcIds = _mintBatch(to, ddcURIs);
        require(
            _checkOnERC721BatchReceived(address(0), to, ddcIds, data),
            "DDC721:transfer to non ERC721Receiver implementer"
        );
    }

    /**
     * @dev See {IDDC721-setURI}.
     */
    function setURI(uint256 ddcId, string memory ddcURI_) public override {
        _requireSenderHasFuncPermission();
        _requireAvailableDDC(ddcId);
        _requireApprovedOrOwner(_msgSender(), ddcId);
        require(bytes(ddcURI_).length != 0, "DDC721:Can not be empty");
        require(
            bytes(_ddcURIs[ddcId]).length == 0,
            "DDC721:already initialized"
        );

        _ddcURIs[ddcId] = ddcURI_;
        emit SetURI(_msgSender(), ddcId, ddcURI_);
    }

    /**
     * @dev See {IDDC721-approve}.
     */
    function approve(address to, uint256 ddcId) public override {
        _requireApprovalConstraints(to);
        address owner = _approve(to, ddcId);
        emit Approval(owner, to, ddcId);
    }

    function _approve(address to, uint256 ddcId)
        private
        returns (address owner)
    {
        _requireAvailableDDC(ddcId);
        owner = _ownerOf(ddcId); 
        require(to != owner, "DDC721:approval to current owner");
        require(
            _msgSender() == owner ||
                DDC721.isApprovedForAll(owner, _msgSender()),
            "DDC721:approve caller is not owner nor approved for all"
        );
        _ddcApprovals[ddcId] = to;
    }

    function _requireApprovalConstraints(address to) private {
        _requireSenderHasFuncPermission();
        _requireAvailableDDCAccount(to);
        _requireOnePlatform(_msgSender(), to);
    }

    /**
     * @dev See {IDDC721-approveBatch}.
     */
    function approveBatch(address to, uint256[] memory ddcIds) public override {
        _requireApprovalConstraints(to);
        address[] memory owners = new address[](ddcIds.length);
        for (uint256 i = 0; i < ddcIds.length; i++) {
            owners[i] = _approve(to, ddcIds[i]);
        }
        emit ApprovalBatch(owners, to, ddcIds);
    }

    /**
     * @dev See {IDDC721-getApproved}.
     */
    function getApproved(uint256 ddcId) public view override returns (address) {
        _requireExists(ddcId);
        return _ddcApprovals[ddcId];
    }

    /**
     * @dev See {IDDC721-setApprovalForAll}.
     */
    function setApprovalForAll(address operator, bool approved)
        public
        override
    {
        _requireApprovalConstraints(operator);

        require(operator != _msgSender(), "DDC721:approve to caller");
        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    /**
     * @dev See {IDDC721-isApprovedForAll}.
     */
    function isApprovedForAll(address owner, address operator)
        public
        view
        override
        returns (bool)
    {
        require(
            owner != address(0) && operator != address(0),
            "DDC721:zero address"
        );
        return _operatorApprovals[owner][operator];
    }

    /**
     * @dev See {IDDC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 ddcId,
        bytes memory data
    ) public override {
       
        _transferFrom(from, to, ddcId);
        require(
            _checkOnERC721Received(from, to, ddcId, data),
            "DDC721:transfer to non ERC721Receiver implementer"
        );
    }

    function _requireTransferConstraints_FistStep(address from, address to)
        private
    {
        _requireSenderHasFuncPermission();
        _requireAvailableDDCAccount(from);
        _requireAvailableDDCAccount(to);
        _requireOnePlatformOrCrossPlatformApproval(from, to);
    }

    function _requireTransferConstraints_SecondStep(
        uint256 ddcId
    ) private view {
        _requireAvailableDDC(ddcId);
        _requireApprovedOrOwner(_msgSender(), ddcId);
    }

    /**
     * @dev See {IDDC721-safeBatchTransferFrom}.
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ddcIds,
        bytes memory data
    ) public override {
        _batchTransferFrom(from, to, ddcIds);
        require(
            _checkOnERC721BatchReceived(from, to, ddcIds, data),
            "DDC721:transfer to non ERC721Receiver implementer"
        );
    }

    /**
     * @dev See {IDDC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 ddcId
    ) public override {
        _transferFrom(from, to, ddcId);
    }

    function _transferFrom(
        address from,
        address to,
        uint256 ddcId
    ) private {
        _requireTransferConstraints_FistStep(from, to);

        _requireTransferConstraints_SecondStep(ddcId);

        _transfer(from, to, ddcId);
        emit Transfer(_msgSender(), from, to, ddcId);
    }

    /**
     * @dev See {IDDC721-batchTransferFrom}.
     */
    function batchTransferFrom(
        address from,
        address to,
        uint256[] memory ddcIds
    ) public override {
        _batchTransferFrom(from, to, ddcIds);
    }

    function _batchTransferFrom(
        address from,
        address to,
        uint256[] memory ddcIds
    ) private {

        _requireTransferConstraints_FistStep(from, to);

        for (uint256 i = 0; i < ddcIds.length; i++) {
           
            _requireTransferConstraints_SecondStep(ddcIds[i]);

            _transfer(from, to, ddcIds[i]);
        }
        emit TransferBatch(_msgSender(), from, to, ddcIds);
    }

    /**
     * @dev See {IDDC721-freeze}.
     */
    function freeze(uint256 ddcId) public override {
        _freeze(ddcId, true);
        emit EnterBlacklist(_msgSender(), ddcId);
    }

    function _freeze(uint256 ddcId, bool isFreeze) private {
        _requireSenderHasFuncPermission();
        _requireOperator();
        _requireDisabledDDC(ddcId);
        _blacklist[ddcId] = isFreeze;
    }

    /**
     * @dev See {IDDC721-unFreeze}.
     */
    function unFreeze(uint256 ddcId) public override {
        _freeze(ddcId, false);
        emit ExitBlacklist(_msgSender(), ddcId);
    }

    /**
     * @dev See {IDDC721-burn}.
     */
    function burn(uint256 ddcId) public override {
        _requireSenderHasFuncPermission();
        _requireExistsAndApproved(ddcId);
        address owner = _ownerOf(ddcId); 
        _burnAndPay(owner, ddcId);
        emit Transfer(_msgSender(), owner, address(0), ddcId);
    }

    function _requireExistsAndApproved(uint256 ddcId) private view {
        _requireExists(ddcId);
        _requireApprovedOrOwner(_msgSender(), ddcId);
    }

    /**
     * @dev See {IDDC721-burnBatch}.
     */
    function burnBatch(address owner, uint256[] memory ddcIds) public override {
        _requireSenderHasFuncPermission();
        for (uint256 i = 0; i < ddcIds.length; i++) {
            _requireExistsAndApproved(ddcIds[i]);
            address realOwner = DDC721.ownerOf(ddcIds[i]);
            require(owner == realOwner, "DDC721: invalid owner");
            _burnAndPay(owner, ddcIds[i]);
        }
        emit TransferBatch(_msgSender(), owner, address(0), ddcIds);
    }

    /**
     * @dev check conditions & burn & pay
     */
    function _burnAndPay(address owner, uint256 ddcId) private {
        // Clear approvals
        _clearApprovals(ddcId);
        _balances[owner] -= 1;
        delete _owners[ddcId];
        _pay(ddcId);
    }

    /**
     * @dev See {IDDC721-balanceOf}.
     */
    function balanceOf(address owner) public view override returns (uint256) {
        require(
            owner != address(0),
            "DDC721:balance query for the zero address"
        );
        return _balances[owner];
    }

    /**
     * @dev See {IDDC721-balanceOfBatch}.
     */
    function balanceOfBatch(address[] memory owners)
        public
        view
        override
        returns (uint256[] memory)
    {
        uint256[] memory balances = new uint256[](owners.length);
        for (uint256 i = 0; i < owners.length; i++) {
            balances[i] = DDC721.balanceOf(owners[i]);
        }
        return balances;
    }

    /**
     * @dev See {IDDC721-ownerOf}.
     */
    function ownerOf(uint256 ddcId) public view override returns (address) {
        address owner = _ownerOf(ddcId);
        require(owner != address(0), "DDC721:owner query for nonexistent ddc");
        return owner;
    }

    function _ownerOf(uint256 ddcId) private view returns (address) {
        return _owners[ddcId];
    }

    /**
     * @dev See {IDDC721-ownerOfBatch}.
     */
    function ownerOfBatch(uint256[] memory ddcIds)
        public
        view
        override
        returns (address[] memory)
    {
        address[] memory owners = new address[](ddcIds.length);
        for (uint256 i = 0; i < ddcIds.length; i++) {
            owners[i] = DDC721.ownerOf(ddcIds[i]);
        }
        return owners;
    }

    /**
     * @dev See {IDDC721-name}.
     */
    function name() public view override returns (string memory) {
        return _name;
    }

    /**
     * @dev See {IDDC721-symbol}.
     */
    function symbol() public view override returns (string memory) {
        return _symbol;
    }

    /**
     * @dev See {IDDC721-ddcURI}.
     */
    function ddcURI(uint256 ddcId)
        public
        view
        override
        returns (string memory)
    {
        _requireExists(ddcId);
        return _ddcURIs[ddcId];
    }

    /**
     * @dev See {IDDC721-getLatestDDCId}.
     */
    function getLatestDDCId() public view override returns (uint256) {
        // _requireOperator();
        return _lastDDCId;
    }

    /**
     * @dev check conditions of mint & mint & pay
     */
    function _mintAndPay(
        address to,
        uint256 ddcId,
        string memory ddcURI_
    ) private {
        require(_owners[ddcId] == address(0), "DDC721:already minted");
        _balances[to] += 1;
        _owners[ddcId] = to;
        _ddcURIs[ddcId] = ddcURI_;
        _lastDDCId = ddcId;
        _pay(ddcId);
    }

    /**
     * @dev Transfers `ddcId` from `from` to `to`.
     *  As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     *
     * Requirements:
     * - `to` cannot be the zero address.
     * - `ddcId` ddc must be owned by `from`.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 ddcId
    ) private {
        require(
            DDC721.ownerOf(ddcId) == from,
            "DDC721:transfer of ddc that is not own"
        );
        // Clear approvals from the previous owner
        _clearApprovals(ddcId);
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[ddcId] = to;
        _pay(ddcId);
    }

    /**
     * @dev Clear approvals from the previous owner
     */
    function _clearApprovals(uint256 ddcId) private {
        _ddcApprovals[ddcId] = address(0);
    }

    /**
     * @dev pay business fee
     */
    function _pay(uint256 ddcId) private {
        _chargeProxy.pay(_msgSender(), msg.sig, ddcId);
    }

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given ddc ID
     * @param to target address that will receive the ddcs
     * @param ddcId uint256 ID of the ddc to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(
        address from,
        address to,
        uint256 ddcId,
        bytes memory _data
    ) private returns (bool) {
        if (to.isContract()) {
            try
                IERC721Receiver(to).onERC721Received(
                    _msgSender(),
                    from,
                    ddcId,
                    _data
                )
            returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("DDC721:transfer to non ERC721Receiver implementer");
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721BatchReceived} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * @param from address representing the previous owner of the given ddc ID
     * @param to target address that will receive the ddcs
     * @param ddcIds uint256 array IDs of each ddc to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721BatchReceived(
        address from,
        address to,
        uint256[] memory ddcIds,
        bytes memory _data
    ) private returns (bool) {
        if (to.isContract()) {
            try
                IERC721Receiver(to).onERC721BatchReceived(
                    _msgSender(),
                    from,
                    ddcIds,
                    _data
                )
            returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721BatchReceived.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert(
                        "DDC721:transfer to non onERC721BatchReceived implementer"
                    );
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    /**
     * @dev check whether the two belong to the same platform.
     */
    function _isOnePlatform(address from, address to)
        private
        view
        returns (bool)
    {
        return _authorityProxy.onePlatformCheck(from, to);
    }

    /**
     * @dev check whether the two meet cross-platform approval requirement.
     */
    function _isCrossPlatformApproval(address from, address to)
        private
        view
        returns (bool)
    {
        return _authorityProxy.crossPlatformCheck(from, to);
    }

    /**
     * @dev Requires contract address on chain.
     *
     * Requirements:
     * - `account` must not be zero address.
     * - `account` must be a contract.
     */
    function _requireContract(address account) private view {
        require(account != address(0), "DDC721:zero address");
        require(account.isContract(), "DDC721:not a contract");
    }

    /**
     * @dev Requires a operator role.
     *
     * Requirements:
     * - `sender` must be a available `ddc` account.
     * - `sender` must be a `Operator` role.
     */
    function _requireOperator() private view {
        require(
            _authorityProxy.checkAvailableAndRole(
                _msgSender(),
                IAuthority.Role.Operator
            ),
            "DDC721:not a operator role or disabled"
        );
    }

    /**
     * @dev Requires function permissions.
     *
     * Requirements:
     * - `sender` must be a available `ddc` account.
     * - `sender` must have function permission.
     */
    function _requireSenderHasFuncPermission() private {
        require(
            _authorityProxy.hasFunctionPermission(
                _msgSender(),
                address(this),
                msg.sig
            ),
            "DDC721:no permission"
        );
    }

    /**
     * @dev Requires a available account.
     *
     * Requirements:
     * - `sender` must be a available `ddc` account.
     */
    function _requireAvailableDDCAccount(address account) private view {
        require(account != address(0), "DDC721:zero address");
        require(
            _authorityProxy.accountAvailable(account),
            "DDC721:not a available account"
        );
    }

    /**
     * @dev Requires a available ddc.
     *
     * Requirements:
     * - ddc must be exist.
     * - ddc must not be in the blacklist.
     */
    function _requireAvailableDDC(uint256 ddcId) private view {
        _requireExists(ddcId);
        require(!_blacklist[ddcId], "DDC721:disabled ddc");
    }

    /**
     * @dev Requires a disabled ddc.
     *
     * Requirements:
     * - ddc must be exist.
     * - ddc must be in the blacklist.
     */
    function _requireDisabledDDC(uint256 ddcId) private view {
        _requireExists(ddcId);
        require(_blacklist[ddcId], "DDC721:non-disabled ddc");
    }

    /**
     * @dev Requires `from` and `to`  belong to the same platform.
     */
    function _requireOnePlatform(address from, address to) private view {
        require(_isOnePlatform(from, to), "DDC721:only on the same platform");
    }

    /**
     * @dev Requires `from` and `to` must belong to the same platform or meet cross-platform approval requirement.
     */
    function _requireOnePlatformOrCrossPlatformApproval(
        address from,
        address to
    ) private view {
        require(
            _isOnePlatform(from, to) || _isCrossPlatformApproval(from, to),
            "DDC721:Only one platform or cross-platform approval"
        );
    }

    /**
     * @dev Requires `ddcId` exists.
     */
    function _requireExists(uint256 ddcId) private view {
        require(_ownerOf(ddcId) != address(0), "DDC721:nonexistent ddc");
    }

    /**
     * @dev Requires `spender` is allowed to manage `ddcId`.
     *
     * Requirements:
     * - `ddcId` must exists.
     * - `spender` is owner or approved.
     */
    function _requireApprovedOrOwner(address spender, uint256 ddcId)
        private
        view
    {
        address owner = _ownerOf(ddcId); 
        require(
            spender == owner ||
                DDC721.getApproved(ddcId) == spender ||
                DDC721.isApprovedForAll(owner, spender),
            "DDC721:not owner nor approved"
        );
    }
}
