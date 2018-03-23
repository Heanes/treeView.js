/**
 * @doc 树形浏览插件
 * @author Heanes
 * @time 2016-11-28 17:11:27 周一
 */
;(function ($, window, document, undefined) {
    "use strict";
    var pluginName = 'treeView';

    var _default = {};
    _default.settings = {
        data: '',                       // 列表树上显示的数据
        getDataUrl: '',                 // 菜单数据获取的URL
        nodeIcon: 'fa fa-list',         // 节点图标
        nodeIconType: '',               // todo 节点图标展示方式，icon-图标样式，img-传入图片
        iconCollapse: '',               // 合上时的图标
        iconExpand: '',                 // 展开时的图标
        iconEmpty: 'icon-empty',        // 空节点时图标
        showIcon: true,                 // 是否显示图标
        collapseOnIcon: false,          // todo true-点击折叠图标才折叠，false-点击整个节点折叠

        injectStyle: true,              // 是否注入样式
        classPrefix: 'heanes-tree-view',// 样式前缀，用于一个页面多个树展示时样式互不干扰
        style: {                        // 样式相关
            top:              {
                bgColor: '',            // 顶部切换背景色 top.bgColor
                color:   ''             // 顶部切换的字体色 top.color
            },
            topActive:        {
                bgColor: '#eee',        // 顶部切换的激活后背景色 topActive.bgColor
                color:   '#333'         // 顶部切换的激活后字体色 topActive.color
            },
            topClicked:       {
                bgColor: '#f7f6f6',     // 顶部点击后背景色 topClicked.bgColor
                color:   '#333'         // 顶部点击后字体色 topClicked.color
            },
            topHover:         {
                bgColor: '#eee',        // 侧边树的鼠标浮上背景色 topHover.bgColor
                color:   '#333'         // 侧边树的鼠标浮上字体色 topHover.color
            },
            left:             {
                bgColor: '',            // 侧边树的背景色 left.Bg.Color
                color:   ''             // 侧边树的字体色 left.color
            },
            leftSelected:     {
                bgColor: '#eee',        // 侧边树的选中后的背景色 leftSelected.bgColor
                color:   '#333'         // 侧边树的选中后的字体色 leftSelected.color
            },
            leftHover:        {
                bgColor: '#666',        // 侧边树的鼠标浮上背景色 leftHover.bgColor
                color:   '#fff'         // 侧边树的鼠标浮上字体色 leftHover.color
            },
            leftNodeExpanded: {
                bgColor: '#eee',        // 侧边树的节点展开时背景色 leftNodeExpanded.bgColor
                color:   ''             // 侧边树的节点展开时字体色 leftNodeExpanded.color
            }
        },
        nodeDefaultState: {
            selected: false,
            expanded: true,
            disabled: false,
            checked:  false
        },

        enableLink: false,              // 树是否允许超链接
        showSingleNodeIcon: true,       // 无子树节点是否显示图标

        enableTopSwitch: false,         // 开启顶部切换标识
        topSwitcherTarget: '',          // 开启了顶部切换后，根节点展示在此处，根节点展示在此处(填写jQuery Dom)
        showTopNavIcon: true,           // 开启了顶部切换后，顶部导航是否显示图标

        // 左侧树操作栏
        leftTreeHandler: {
            // 缩略
            contract: {
                enable: true,
                indentLeftDelay: 1000   // 向左缩进的动画延时毫秒数
            },
            // 一键折叠
            collapseAll: {
                enable: true
            },
            // 一键展开
            expandAll: {
                enable: true
            }
        },

        enableTreeSearch: false,        // 开启树菜单搜索
        treeSearchPlaceholder: 'search',// 树菜单搜索的提示字符

        multiSelect: false,

        // 事件处理
        onNodeClick:      undefined,    // 点击节点事件
        onNodeSelected:   undefined,    // 点击选择事件
        onNodeCollapsed:  undefined,    // 节点折叠事件
        onNodeExpanded:   undefined,    // 节点展开事件
        onTopSwitch:      undefined,    // 顶部切换事件
        onLeftTreeContract: undefined,    // 树向左边缩进事件

        some: ''                        // 待用
    };
    // 每个节点的默认值
    _default.node = {
        text: "",
        nodeIcon: "fa fa-list",
        href: "",
        iconSelected: "",
        selectable: true,
        state: {
            selected: false,
            expanded: true,
            disabled: false,
            checked: false
        },
        switchToShow: true,
        target: "",                     // 链接打开目标
        nodes: []
    };
    _default.options = {
        silent: false,
        ignoreChildren: false
    };

    var TreeView = function (element, options) {
        this.$element = $(element);
        this.elementId = element.id;
        this.styleId = this.elementId + '-style';

        this.init(options);

        return {
            // Options (public access)
            options: this.options,

            // Initialize / destroy methods
            init:                   $.proxy(this.init, this),
            remove:                 $.proxy(this.remove, this),

            // Data method
            getNode:                $.proxy(this.getNode, this),
            setNode:                $.proxy(this.setNode, this),
            addNode:                $.proxy(this.addNode, this),
            removeNode:             $.proxy(this.removeNode, this),

            // Methods
            // Expand / collapse methods
            collapseAll:            $.proxy(this.collapseAll, this),
            collapseNode:           $.proxy(this.collapseNode, this),
            expandAll:              $.proxy(this.expandAll, this),
            expandNode:             $.proxy(this.expandNode, this),
            toggleExpandedState:    $.proxy(this.toggleExpandedState, this),

            // 事件
            selectNode:             $.proxy(this.selectNode, this),
            clickNode:              $.proxy(this.clickNode, this),

            // prepare use
            test:                   $.proxy(this.test, this)
        };
    };

    /**
     * @doc 初始化
     * @param options
     */
    TreeView.prototype.init = function (options) {
        this.tree = [];
        this.nodes = [];

        if (options.data) {
            if (typeof options.data === 'string') {
                options.data = $.parseJSON(options.data);
            }
            this.tree = $.extend(true, [], options.data);
            delete options.data;
        }
        this.options = $.extend(true, {}, _default.settings, options);

        // 顶部根节点切换
        if(this.options.enableTopSwitch && this.options.topSwitcherTarget){
            this.$treeTopTarget = this.options.topSwitcherTarget;
            if(this.$treeTopTarget && this.$treeTopTarget.length > 0){
                this.enableTopSwitch = true;
            }
        }
        this.topExpandNode = undefined;
        this.convertToStandardTree(this.tree);
        this.setInitialStates({ nodes: this.tree }, 0);
        this.render();
        this.subscribeEvents();
    };

    /**
     * @doc 状态相关初始化
     * @param node
     * @param level
     */
    TreeView.prototype.setInitialStates = function (node, level) {
        if (!node.nodes) return;
        level += 1;

        var parent = node;
        var _this = this;
        $.each(node.nodes, function checkStates(index, node) {
            // 节点ID，每push一次将会增加一次长度，从而使nodeId变成唯一的一个自增索引值
            node.nodeId = _this.nodes.length;
            // 节点父ID
            node.parentId = parent.nodeId;
            // 节点图标
            node.nodeIcon = node.nodeIcon || _this.options.nodeIcon;

            // 状态相关
            node.state = node.state || {};
            // 顶级切换时记录节点展开状态
            if(level === 1 && node.state.expanded && _this.topExpandNode === undefined){
                _this.topExpandNode = index;
            }

            _this.nodes.push(node);
            // 递归
            if (node.nodes) {
                _this.setInitialStates(node, level);
            }
        });
    };

    /**
     * @doc tree做一次标准转化
     * @param tree
     * @author Heanes
     * @time 2017-11-09 11:45:01 周四
     */
    TreeView.prototype.convertToStandardTree = function (tree) {
        if(!tree) return;

        var _this = this;
        $.each(tree, function (index, node) {
            node.state = $.extend(true, {}, _default.node.state, _this.options.nodeDefaultState, node.state);
            tree[index] = $.extend(true, {}, _default.node, node); // @experience 此处发现循环内部若更改循环变量单体引用，将出现问题
            if(node.nodes && node.nodes.length > 0){
                tree[index].nodes = _this.convertToStandardTree(node.nodes);
            }
        });
        return tree;
    };

    /**
     * @doc 各类事件绑定
     */
    TreeView.prototype.subscribeEvents = function () {
        // 点击折叠/展开
        this.$element.on('click', $.proxy(this.clickHandler, this));
        // 向左缩进

        // 顶部根节点切换
        if(this.enableTopSwitch){
            this.$treeTopTarget.on('click', $.proxy(this.switchHandler, this));
        }

        // 用户定义的传入的事件
        if (typeof (this.options.onNodeClick) === 'function') {
            // 点击事件
            this.$element.on('nodeClick', this.options.onNodeClick);
        }
        if (typeof (this.options.onNodeSelected) === 'function') {
            // 选择事件，点击第一次选中，点击第二次取消选中
            this.$element.on('nodeSelected', this.options.onNodeSelected);
        }
        if (typeof (this.options.onTopSwitch) === 'function') {
            // 顶部切换
            this.$treeTopTarget.on('topSwitch', this.options.onTopSwitch);
        }
        if (typeof (this.options.onLeftTreeContract) === 'function') {
            // 左侧树缩进
            this.$element.on('leftTreeContract', this.options.onLeftTreeContract);
        }

    };

    /**
     * @doc 点击切换左侧树
     */
    TreeView.prototype.switchHandler = function (event) {
        event.preventDefault();

        var $target = $(event.target);
        var $nodeDom = this.findNodeDom($target);
        var node = this.findNode($nodeDom);
        if(!$nodeDom || $nodeDom.length === 0) return;

        $nodeDom.parent().children().removeClass('clicked');
        if(node.switchToShow){
            $nodeDom.parent().children().removeClass('active');
            $nodeDom.addClass('active');
            // 左侧数对应切换显示
            this.$treeListWrap.children().removeClass('active').eq($nodeDom.index()).addClass('active');
        }else{
            $nodeDom.addClass('clicked');
        }

        this.$treeTopTarget.trigger('topSwitch', [$.extend(true, {}, node), $nodeDom]);
        // console.log($target);
    };

    /**
     * @doc 点击事件绑定
     */
    TreeView.prototype.clickHandler = function (event) {
        // 如果允许链接，则阻止默认事件
        if (this.options.enableLink) event.preventDefault();

        var $target = $(event.target);

        // 左侧树缩略显示
        if(this.options.leftTreeHandler.contract.enable){
            var $treeListLap = $target.hasClass('handle-contract') ? $target : $target.closest('.handle-contract');
            if($treeListLap && $treeListLap.length > 0){
                var $handleContractLeftTree = this.findLapDom($target);
                if($handleContractLeftTree){
                    this.toggleContract($handleContractLeftTree, _default.options);
                }
                return this;
            }
        }

        // 节点点击
        var $treeNode = $target.hasClass('handle-contract') ? $target : $target.closest('.tree-node');
        if(!$treeNode || $treeNode.length <= 0){
            return this;
        }
        var $nodeDom = this.findNodeDom($target);
        var node = this.findNode($nodeDom);

        if (!node || node.state.disabled) return;

        var classList = [];
        var $iconList = $nodeDom.find('i.icon');
        $iconList.each(function getNodeIconClassList(i, item) {
            $(item).attr('class') ? classList = classList.concat($(item).attr('class').split(' ')) : null;
        });
        $.unique(classList);

        // 节点相关事件
        if(classList.indexOf('node-collapse-expand-icon') !== -1){
            this.toggleExpandedState(node, _default.options);
            this.toggleExpandedStyle(node, $nodeDom, _default.options, event);
        }else{
            // 节点点击
            this.nodeClick(node, $nodeDom, _default.options);
            if (node.selectable) {
                // 节点选择
                this.findNodeDomAll().find('.node-wrap').removeClass('selected');
                $nodeDom.find('.node-wrap').toggleClass('selected');
                this.toggleSelectedState(node, _default.options);
            } else {
                this.toggleExpandedState(node, _default.options);
            }
        }
        // todo 节点check选中事件
    };

    TreeView.prototype.bindCollapseAllHandle = function () {
        var $collapseAllBtn = this.$handleCollapseAll;
        var _this = this;
        $collapseAllBtn.on('click', function () {
            // console.log('collapse all');
            var $treeGroupListAll = _this.$treeListWrap.find('.tree-group.active');
            var $treeNodeListAll = $treeGroupListAll.find('.tree-node.expand,.tree-node.collapse');
            var $treeNodeIconList = $treeNodeListAll.find('.node-collapse-expand-icon');
            $treeNodeListAll.removeClass('expand').addClass('collapse');
            $treeNodeIconList.removeClass('triangle-bottom').addClass('triangle-right');
            return _this;
        });
    };

    TreeView.prototype.bindExpandAllHandle = function () {
        var $expandAllBtn = this.$handleExpandAll;
        var _this = this;
        $expandAllBtn.on('click', function () {
            // console.log('expand all');
            var $treeGroupListAll = _this.$treeListWrap.find('.tree-group.active');
            var $treeNodeListAll = $treeGroupListAll.find('.tree-node.expand,.tree-node.collapse');
            var $treeNodeIconList = $treeNodeListAll.find('.node-collapse-expand-icon');
            $treeNodeListAll.removeClass('collapse').addClass('expand');
            $treeNodeIconList.removeClass('triangle-right').addClass('triangle-bottom');
            return _this;
        });
    };

    /**
     * @doc 左侧树搜索
     * @author Heanes
     * @time 2017-10-12 18:49:23 周二
     */
    TreeView.prototype.searchTree = function () {
        var $searchInput = this.$treeSearch.find('input[type="text"]').eq(0);
        $searchInput.attr('placeholder', this.options.treeSearchPlaceholder);
        var $nodeListGroupAll = this.$treeListWrap.find('.tree-group');
        // 记录顶部切换激活的节点，支持顶部切换时搜索其他二级菜单
        var activeTreeGroupIndex = 0;
        $.each($nodeListGroupAll, function (i, item) {
            if($(item).hasClass('active')){
                activeTreeGroupIndex = i;
                return false;
            }
        });
        var $nodeWrapListAll = this.$treeListWrap.find('.node-wrap');
        $searchInput.on('input', function (e) {
            var inputVal = $searchInput.val();
            if(inputVal === ''){
                $nodeWrapListAll.show();
                $nodeListGroupAll.removeClass('active');
                $nodeListGroupAll.eq(activeTreeGroupIndex).addClass('active');
                return false;
            }
            $nodeWrapListAll.hide();
            $nodeListGroupAll.addClass('active');
            $.each($nodeWrapListAll, function (i, item) {
                var $nodeWrap = $(item);
                //var nodeText = $nodeWrap.find('.node-text').text();
                if(matchInputSearchFromNodeWrap(inputVal, $(item))){
                    setNodeWrapShow($nodeWrap);
                }
            });
        });
    };

    /**
     * @doc 匹配输入搜索的算法，后续可以考虑汉语拼音匹配
     * @param subStr 输入的搜索字符
     * @param $nodeWrap 树节点dom
     * @returns {boolean}
     * @author Heanes
     * @time 2017-10-20 17:30:22 周五
     */
    function matchInputSearchFromNodeWrap(subStr, $nodeWrap) {
        return matchInputSearch(subStr, $nodeWrap.find('.node-text').text()) || matchInputSearch(subStr, $nodeWrap.attr('href'));
        /**
         * @doc 匹配输入搜索的算法，后续可以考虑汉语拼音匹配
         * @param subStr 输入的搜索字符
         * @param str 要匹配的字符
         * @returns {boolean}
         * @author Heanes
         * @time 2017-10-20 17:30:22 周五
         */
        function matchInputSearch(subStr, str) {
            if(!str || !subStr) return false;
            // 忽略大小写的匹配
            return str.toLowerCase().indexOf(subStr.toLowerCase()) >= 0;
        }
    }

    /**
     * @doc 搜索后节点的显示和隐藏
     * @notice 有递归调用
     * @param $nodeWrap
     * @returns {boolean}
     * @author Heanes
     * @time 2017-10-20 15:31:04 周五
     */
    function setNodeWrapShow($nodeWrap) {
        $nodeWrap.show();
        var $nodeTreeGroup = $nodeWrap.closest('.tree-group');
        if(!$nodeTreeGroup || $nodeTreeGroup.length <= 0){
            return false;
        }
        var $nodeParent = $nodeTreeGroup.closest('.tree-node');
        if(!$nodeParent || $nodeParent.length <= 0){
            return false;
        }
        var $nodeWrapParentNode = $nodeParent.find('.node-wrap').eq(0);
        $nodeWrapParentNode.show();
        setNodeWrapShow($nodeWrapParentNode);
    }

    /**
     * @doc 交替缩进
     * @param $lapDom
     * @param options
     */
    TreeView.prototype.toggleContract = function ($lapDom, options) {
        if (!$lapDom || $lapDom.length === 0) return;
        // todo 向左缩进的延时动画
        this.$treeLeftWrap.toggleClass('contracted');
        this.$element.trigger('leftTreeContract');
    };

    /**
     * @doc 交替展开折叠状态
     * @param node
     * @param options
     */
    TreeView.prototype.toggleExpandedState = function (node, options) {
        if (!node) return;
        this.setExpandedState(node, !node.state.expanded, options);
    };
    /**
     * @doc 交替展开折叠状态
     * @param node
     * @param $nodeDom
     * @param options
     * @param event
     */
    TreeView.prototype.toggleExpandedStyle = function (node, $nodeDom, options, event) {
        if (!$nodeDom) return;
        this.setExpandedStyle(node, $nodeDom, !node.state.expanded, options, event);
    };

    /**
     * @doc 设置节点为展开状态
     * @param node
     * @param $nodeDom
     * @param state
     * @param options
     * @param event
     */
    TreeView.prototype.setExpandedStyle = function (node, $nodeDom, state, options, event) {
        if (state === node.state.expanded) return;
        var _this = this;
        //$nodeDom.toggleClass('collapse');
        if($nodeDom.hasClass('collapse')){
            $nodeDom.removeClass('collapse').addClass('expand');
        } else if($nodeDom.hasClass('expand')){
            $nodeDom.removeClass('expand').addClass('collapse');
        } else{
            $nodeDom.addClass('collapse');
        }
        var $clickDom = $(event.target);
        $nodeDom.children('.node-wrap').find('.node-collapse-expand-icon').toggleClass(function() {
            if ($(this).hasClass(_this.options.iconCollapse)) {
                $(this).removeClass(_this.options.iconCollapse);
                return _this.options.iconExpand;
            } else {
                $(this).removeClass(_this.options.iconExpand);
                return _this.options.iconCollapse;
            }
        });

    };

    /**
     * @doc 设置节点为展开状态
     * @param node
     * @param state
     * @param options
     */
    TreeView.prototype.setExpandedState = function (node, state, options) {
        if (state === node.state.expanded) return;

        if (state && node.nodes) {
            node.state.expanded = true;
        } else if (!state) {

            // Collapse a node
            node.state.expanded = false;
            if (!options.silent) {
                this.$element.trigger('nodeCollapsed', $.extend(true, {}, node));
            }

            // Collapse child nodes
            if (node.nodes && !options.ignoreChildren) {
                $.each(node.nodes, $.proxy(function (index, node) {
                    this.setExpandedState(node, false, options);
                }, this));
            }
        }
    };

    /**
     * @doc 查找节点
     * @param $target
     * @returns {*}
     */
    TreeView.prototype.findNode = function ($target) {
        var $nodeDom;
        if(!$target.attr('data-nodeId')){
            $nodeDom = this.findNodeDom($target);
        }else{
            $nodeDom = $target;
        }
        var nodeId = $nodeDom.attr('data-nodeId');
        var node = this.nodes[nodeId];

        if (!node) {
            node = _default.node;
            var $a = $target.find('a');
            node.href = $a.attr('href');
            node.text = $a.find('.node-text').text();
            node.icon = $a.find('.node-icon').attr('class');
            if(!node.href || !node.text || node.text === ''){
                console.log('Error: node does not exist');
                return undefined;
            }
        }
        return node;
    };

    /**
     * @doc 搜索多个节点
     * @param pattern
     * @param modifier
     * @param attribute
     * @returns {*}
     */
    TreeView.prototype.findNodes = function (pattern, modifier, attribute) {

        modifier = modifier || 'g';
        attribute = attribute || 'text';

        var _this = this;
        return $.grep(this.nodes, function (node) {
            var val = _this.getNodeValue(node, attribute);
            if (typeof val === 'string') {
                return val.match(new RegExp(pattern, modifier));
            }
        });
    };
    /**
     * @doc 查找节点dom
     * @param $target
     * @returns {*}
     */
    TreeView.prototype.findNodeDom = function ($target) {
        var $nodeDom = $target.hasClass('handle-contract') ? $target : $target.closest('.tree-node');

        if (!$nodeDom || $nodeDom.length === 0) {
            console.log('Error: nodeDom does not exist');
        }
        //console.log('findNodeDom:');
        //console.log($nodeDom);
        return $nodeDom;
    };

    /**
     * @doc 查找所有节点dom
     * @param type 类型，top-顶部，或者 left-侧边树
     * @returns {*}
     */
    TreeView.prototype.findNodeDomAll = function (type) {
        var $nodeDomAll = undefined;
        type = type || 'left';
        switch(type){
            case 'left':
                $nodeDomAll = this.$treeListWrap.find('li.tree-node');
                break;
            case 'top':
                $nodeDomAll = this.$treeTopWrap.find('li.tree-node');
                break;
        }
        if (!$nodeDomAll || $nodeDomAll.length === 0) {
            // console.log('Error: nodeDom does not exist');
        }
        return $nodeDomAll;
    };
    /**
     * @doc 获取节点值
     * @param obj
     * @param attr
     * @returns {*}
     */
    TreeView.prototype.getNodeValue = function (obj, attr) {
        var index = attr.indexOf('.');
        if (index > 0) {
            var _obj = obj[attr.substring(0, index)];
            var _attr = attr.substring(index + 1, attr.length);
            return this.getNodeValue(_obj, _attr);
        }
        else {
            if (obj.hasOwnProperty(attr)) {
                return obj[attr].toString();
            }
            else {
                return undefined;
            }
        }
    };

    /**
     * @doc 查找折叠按钮dom
     * @param $target
     */
    TreeView.prototype.findLapDom = function ($target) {
        var $lapDom = $target.hasClass('handle-contract') ? $target : $target.closest('.handle-contract');
        if (!$lapDom || $lapDom.length === 0) {
            console.log('Error: lapDom does not exist');
            return null;
        }
        return $lapDom;
    };

    /**
     * @doc 获取节点是否是展开状态
     * @param nodeData 节点数据
     * @returns {boolean}
     * @author Heanes
     * @time 2016-11-29 19:37:05 周二
     */
    TreeView.prototype.getIsExpanded = function (nodeData) {
        return nodeData.state !== undefined ? (nodeData.state.expanded !== undefined && nodeData.state.expanded) : false;
    };
    /**
     * @doc 渲染左侧菜单
     * @author Heanes
     * @time 2016-11-29 16:49:23 周二
     */
    TreeView.prototype.render = function () {
        if (!this.initialized) {

            this.injectStyle();
            // 左侧树操作栏
            this.$leftTreeHandle = $(this.template.leftTreeHandle);
            //
            // 左侧树缩略
            this.$handleContractLeftTree = '';
            if(this.options.leftTreeHandler.contract.enable){
                this.$handleContractLeftTree = $(this.template.handleContractLeftTree);
            }

            if(this.options.leftTreeHandler.collapseAll.enable){
                this.$handleCollapseAll = '';
                this.$handleCollapseAll = $(this.template.handleCollapseAll);
            }
            if(this.options.leftTreeHandler.expandAll.enable){
                this.$handleExpandAll = '';
                this.$handleExpandAll = $(this.template.handleExpandAll);
            }

            // 左侧树搜索
            if(this.options.enableTreeSearch){
                this.$treeSearch = $(this.template.treeSearch);
            }

            // 左侧树
            this.$treeLeftWrap = $(this.template.treeLeftWrap);
            this.$treeListWrap = $(this.template.treeListWrap);
            this.initialized = true;
        }

        // 顶部根节点切换
        if(this.enableTopSwitch){
            this.$treeTopWrap = $(this.template.treeTopWrap);
            this.$treeTop = $(this.template.treeTop);
            this.$treeTopTarget.empty()
                .append(this.$treeTopWrap.empty()
                    .append(this.$treeTop.empty())
                );
            this.$treeListWrap.addClass('switch');
        }

        // 左侧树及顶部切换
        this.$element.empty()
            .append(this.$treeLeftWrap
                .append(this.$leftTreeHandle
                    .append(this.$handleCollapseAll)
                    .append(this.$handleExpandAll)
                    .append(this.$handleContractLeftTree)
                )
                .append(this.$treeSearch)
                //.append(this.$collapseAllHandle)
                .append(this.$treeListWrap.empty())
            );
        //this.$treeListWrap.append(this.buildTree(this.tree));
        this.buildTree(this.tree);
        this.$treeListWrap.children().eq(this.topExpandNode).addClass('active');

        if(this.options.enableTreeSearch){
            this.searchTree();
        }

        if(this.options.leftTreeHandler.collapseAll.enable){
            this.bindCollapseAllHandle();
        }
        if(this.options.leftTreeHandler.expandAll.enable){
            this.bindExpandAllHandle();
        }
    };

    /**
     * @doc 构建树
     * @param nodes
     * @param level
     * @param toSwitch
     */
    TreeView.prototype.buildTree = function (nodes, level, toSwitch) {
        if (!nodes) return;
        level === undefined ? level = 1 : level++;
        //console.log(level);

        var _this = this;
        // 如果开启切换，则顶级当作0级
        if(_this.enableTopSwitch){
            level--;
        }
        toSwitch = toSwitch || false;
        if(toSwitch){
            level++;
            //console.log('%c ' + level + ' out loop', 'background:#222;color:#3c8dbc;font-size:14px;');
        }

        var $treeUl = level === 1 ? '' : $(_this.template.treeLeftGroup);
        if(toSwitch) $treeUl = $(_this.template.treeLeftGroup);

        $.each(nodes, function addNodes(index, node) {
            // console.log('%c ' + level + ' in loop', 'background:#222;color:#bada55');
            // 在顶部不切换的情况下第一级节点都用ul包住，顶部切换时第二级节点用ul包住
            level <= 1 && !toSwitch ? $treeUl = $(_this.template.treeLeftGroup) : null;

            var $treeNodeLi = $(_this.template.node).attr('data-nodeId', node.nodeId);
            var $treeNodeWrap = $(_this.template.nodeWrap);
            if (_this.options.enableLink){
                $treeNodeWrap = $(_this.template.nodeLink);
                $treeNodeWrap.attr('href', node.href);
                if(node.target !== undefined) $treeNodeWrap.attr('target', node.target);
            }

            // 顶部切换器
            if(0 === level){
                // 根节点放置在顶部切换
                // 添加图标icon
                if (_this.options.showIcon && _this.options.showTopNavIcon) {
                    var topIconClassList = ['node-icon'];
                    topIconClassList.push(node.nodeIcon || _this.options.nodeIcon);
                    $treeNodeWrap
                        .append($(_this.template.icon)
                            .addClass(topIconClassList.join(' '))
                        );
                }
                // 添加激活样式
                if(_this.topExpandNode === index){
                    $treeNodeLi.addClass('active');
                }

                // 添加文字及链接
                $treeNodeWrap
                    .append($(_this.template.nodeText)
                        .append(node.text)
                    );

                // 添加到顶部切换器dom中
                _this.$treeTop
                    .append($treeNodeLi
                        .append($treeNodeWrap)
                    );

                _this.$treeListWrap.append(_this.buildTree(node.nodes, level, true));
                /*if(node.nodes && node.nodes.length > 0){
                    // console.log(node.nodes);
                    // console.log('level 0 append');
                }*/
                // console.log($treeLi.html());
                //_this.$treeListWrap.append($treeUl.append($treeLi));
                //console.log('level 0 append');
            } else {
                // 左侧树
                // 按子菜单层级缩进
                //console.log('%c' + level, 'background:#222;color:#3c8dbc;font-size:14px;');
                for (var i = 0; i < (level - 1); i++) {
                    $treeNodeWrap.append(_this.template.indent);
                }

                // 有子树的添加折叠及其他样式
                var ceIconClassList = [];
                if (node.nodes && node.nodes.length > 0) {
                    ceIconClassList.push('node-collapse-expand-icon');
                    if(node.state.expanded){
                        // 添加展开样式
                        ceIconClassList.push('expand');
                        ceIconClassList.push(_this.options.iconExpand);
                        $treeNodeLi.addClass('expand');
                    }else{
                        ceIconClassList.push('collapse');
                        ceIconClassList.push(_this.options.iconCollapse);
                        $treeNodeLi.addClass('collapse');
                    }
                    $treeNodeWrap
                        .append($(_this.template.icon)
                            .addClass(ceIconClassList.join(' '))
                        );
                } else {
                    ceIconClassList.push(_this.options.iconEmpty);
                }

                // 添加图标icon
                if (_this.options.showIcon) {
                    // 只有左侧第一级节点 或者 该节点存在子树 或者该节点是叶子节点但是开启了“叶子节点也显示图标”时才显示节点图标
                    if(level === 1 || _this.options.showSingleNodeIcon || (node.nodes && node.nodes.length > 0)) {
                        var nodeIconClassList = ['node-icon'];
                        nodeIconClassList.push(node.nodeIcon || _this.options.nodeIcon);
                        $treeNodeWrap
                            .append($(_this.template.icon)
                                .addClass(nodeIconClassList.join(' '))
                            );
                    }
                }

                // 添加文字及链接
                $treeNodeWrap
                    .append($(_this.template.nodeText)
                        .append(node.text)
                    );

                // 添加到dom中
                $treeUl.append($treeNodeLi.append($treeNodeWrap));

                //console.log('buildTree: level: ' + level);
                //console.log($treeNodeLi.html());
                // 递归
                if (node.nodes && node.nodes.length > 0) {
                    $treeNodeLi.append(_this.buildTree(node.nodes, level, toSwitch));
                }

                if(level === 1 && !toSwitch){
                    console.log('append treeLeft');
                    _this.$treeListWrap.append($treeUl);
                }
            }
        });
        //console.log('return at last');
        //if($treeUl.children().length > 0)
        return $treeUl;
    };

    /**
     * @doc 折叠菜单
     * @param identifiers
     * @param options
     */
    TreeView.prototype.collapseNode = function (identifiers, options){
        ;
    };
    /**
     * @doc 打开菜单
     * @param identifiers
     * @param options
     */
    TreeView.prototype.expandNode = function (identifiers, options){
        ;
    };

    /**
     * @doc 交替选择状态(数据)
     * @param node node数据
     * @param $nodeDom 点击的本身的dom
     * @param options
     */
    TreeView.prototype.nodeClick = function (node, $nodeDom, options) {
        if (!node) return;
        //console.log('nodeClick');
        this.$element.trigger('nodeClick', [$.extend(true, {}, node), $nodeDom]);

    };

    /**
     * @doc 交替选择状态(数据)
     * @param node
     * @param options
     */
    TreeView.prototype.toggleSelectedState = function (node, options) {
        if (!node) return;
        this.setSelectedState(node, !node.state.selected, options);
    };

    /**
     * @doc 设置节点为选中状态(数据)
     * @param node
     * @param state
     * @param options
     */
    TreeView.prototype.setSelectedState = function (node, state, options) {
        if (state === node.state.selected) return;

        if (state) {

            // If multiSelect false, unselect previously selected
            if (!this.options.multiSelect) {
                $.each(this.findNodes('true', 'g', 'state.selected'), $.proxy(function (index, node) {
                    this.setSelectedState(node, false, options);
                }, this));
            }

            // Continue selecting node
            node.state.selected = true;
            if (!options.silent) {
                this.$element.trigger('nodeSelected', $.extend(true, {}, node));
            }
        }
        else {

            // Unselect node
            node.state.selected = false;
            if (!options.silent) {
                this.$element.trigger('nodeUnselected', $.extend(true, {}, node));
            }
        }
    };

    /**
     * @doc 交替节点选择(dom)
     * @param identifiers
     * @param options
     */
    TreeView.prototype.toggleNodeSelected = function (identifiers, options) {
        this.forEachIdentifier(identifiers, options, $.proxy(function (node, options) {
            this.toggleSelectedState(node, options);
        }, this));

        // this.render();
    };

    TreeView.prototype.forEachIdentifier = function (identifiers, options, callback) {

        options = $.extend({}, _default.options, options);

        if (!(identifiers instanceof Array)) {
            identifiers = [identifiers];
        }

        $.each(identifiers, $.proxy(function (index, identifier) {
            callback(this.identifyNode(identifier), options);
        }, this));
    };

    TreeView.prototype.identifyNode = function (identifier) {
        return ((typeof identifier) === 'number') ?
            this.nodes[identifier] :
            identifier;
    };

    /**
     * @doc 模版
     */
    TreeView.prototype.template = {
        treeTopWrap:            '<div class="tree-top-wrap"></div>',
        treeTop:                '<ul class="tree-top-list"></ul>',
        treeLeftWrap:           '<div class="tree-left-wrap"></div>',
        treeListWrap:           '<div class="tree-list-wrap"></div>',
        treeLeftGroupWrap:      '<div class="tree-group-wrap"></div>',
        treeLeftGroup:          '<ul class="tree-group"></ul>',
        nodeWrap:               '<span class="node-wrap"></span>',
        nodeLink:               '<a class="node-wrap"></a>',
        node:                   '<li class="tree-node"></li>',
        link:                   '<a href="javascript:;" class="node-wrap"></a>',
        nodeText:               '<span class="node-text"></span>',
        indent:                 '<span class="indent"></span>',
        icon:                   '<i class="icon"></i>',
        badge:                  '<span class="badge"></span>', // 标记该菜单下有多少子菜单
        leftTreeHandle:         '<div class="tree-left-handle"></div>', // 左侧树操作栏
        handleContractLeftTree: '<span class="left-tree-handle-btn handle-contract" title="收缩/展开"><i class="handle-icon fa fa-exchange"></i></span>', // 收缩左侧树功能
        handleCollapseAll:      '<span class="left-tree-handle-btn handle-collapse-all" title="一键折叠全部"><i class="handle-icon fa fa-compress"></i></span>', // 一键折叠全部功能
        handleExpandAll:        '<span class="left-tree-handle-btn handle-expand-all" title="一键展开全部"><i class="handle-icon fa fa-expand"></i></span>', // 一键展开全部功能
        treeSearch:             '<div class="tree-search"><input type="text" class="tree-search-input" placeholder="search" /></div>', // 动态搜索功能
        collapseAllHandle:      '<div class="collapse-all-handle">' +
                                '<span class="collapse-all-handle-btn collapsed" title="一键折叠/展开全部"><i class="handle-icon fa fa-compress"></i></span>' +
                                '</div>' // 一键折叠展开全部功能
    };
    // 定制样式
    TreeView.prototype.buildStyle = function () {
        var style = '';
        // 顶部切换背景色 top.bgColor
        if(this.options.style.top.bgColor){
            style += '.tree-top-wrap{background-color:' + this.options.style.top.bgColor + '}';
        }
        // 顶部切换的字体色 top.color
        if(this.options.style.top.color){
            style += '.tree-top-wrap{color:' + this.options.style.top.color + '}';
        }
        // 顶部切换的激活后背景色 topActive.bgColor
        if(this.options.style.topActive.bgColor){
            style += '.tree-top-wrap .tree-top-list .tree-node.active{background-color:' + this.options.style.topActive.bgColor + '}';
        }
        // 顶部切换的激活后字体色 topActive.color
        if(this.options.style.topActive.color){
            style += '.tree-top-wrap .tree-top-list .tree-node.active{color:' + this.options.style.topActive.color + '}';
        }
        // 顶部点击后背景色 topClicked.bgColor
        if(this.options.style.topClicked.bgColor){
            style += '.tree-top-wrap .tree-top-list .tree-node.clicked{background-color:' + this.options.style.topClicked.bgColor + '}';
        }
        // 顶部点击后、字体色 topClicked.color
        if(this.options.style.topClicked.color){
            style += '.tree-top-wrap .tree-top-list .tree-node.clicked{color:' + this.options.style.topClicked.color + '}';
        }
        // 顶部树的鼠标浮上背景色 topHover.bgColor
        if(this.options.style.topHover.bgColor){
            style += '.tree-top-wrap .tree-top-list .tree-node:hover{background-color:' + this.options.style.topHover.bgColor + '}';
        }
        // 顶部树的鼠标浮上字体色 topHover.color
        if(this.options.style.topHover.color){
            style += '.tree-top-wrap .tree-top-list .tree-node:hover{color:' + this.options.style.topHover.color + '}';
        }
        // 侧边树的背景色 left.bgColor
        if(this.options.style.left.bgColor){
            style += '.tree-list-wrap{background-color:' + this.options.style.left.bgColor + '}';
        }
        // 侧边树的字体色 left.color
        if(this.options.style.left.color){
            style += '.tree-list-wrap{color:' + this.options.style.left.color + '}';
        }
        // 侧边树的选中后的背景色 leftSelected.bgColor
        if(this.options.style.leftSelected.bgColor){
            style += '.tree-list-wrap .tree-node .node-wrap.selected{background-color:' + this.options.style.leftSelected.bgColor + '}';
        }
        // 侧边树的选中后的字体色 leftSelected.color
        if(this.options.style.leftSelected.color){
            style += '.tree-list-wrap .tree-node .node-wrap.selected{color:' + this.options.style.leftSelected.color + '}';
        }
        // 侧边树的鼠标浮上背景色 leftHover.bgColor
        if(this.options.style.leftHover.bgColor){
            style += '.tree-list-wrap .tree-node .node-wrap:hover{background-color:' + this.options.style.leftHover.bgColor + '}';
        }
        // 侧边树的鼠标浮上字体色 leftHover.color
        if(this.options.style.leftHover.color){
            style += '.tree-list-wrap .tree-node .node-wrap:hover{color:' + this.options.style.leftHover.color + '}';
        }
        // 侧边树的展开背景色 leftNodeExpanded.bgColor
        if(this.options.style.leftNodeExpanded.bgColor){
            style += '.tree-list-wrap .tree-group li.expand{background-color:' + this.options.style.leftNodeExpanded.bgColor + '}';
        }
        // 侧边树的展开字体色 leftNodeExpanded.color
        if(this.options.style.leftNodeExpanded.color){
            style += '.tree-list-wrap .tree-group li.expand{color:' + this.options.style.leftNodeExpanded.color + '}';
        }
        return style;
    };

    /**
     * @doc 注入样式
     */
    TreeView.prototype.injectStyle = function () {
        if (this.options.injectStyle && !document.getElementById(this.styleId)) {
            $('<style type="text/css" id="' + this.styleId + '"> ' + this.buildStyle() + ' </style>').appendTo('head');
        }
    };
    /**
     * @doc 获取节点
     * @param nodeId
     * @returns {*}
     */
    TreeView.prototype.getNode = function (nodeId) {
        return this.nodes[nodeId];
    };

    /**
     * @doc 设置节点
     * @param node
     * @returns {*}
     */
    TreeView.prototype.setNode = function (node) {
        this.nodes[node.id] = node;
    };

    /**
     * @doc 添加节点
     * @param node
     * @returns {*}
     */
    TreeView.prototype.addNode = function (node) {
        this.nodes[node.id] = node;
    };

    /**
     * @doc 移除节点
     * @param nodeId
     * @returns {*}
     */
    TreeView.prototype.removeNode = function (nodeId) {
        this.nodes[nodeId] = undefined;
    };

    /**
     * @doc 获取父节点
     * @param identifier
     * @returns {*}
     */
    TreeView.prototype.getParent = function (identifier) {
        var node = this.identifyNode(identifier);
        return this.nodes[node.parentId];
    };
    /**
     * @doc 获取菜单数据
     * @author Heanes
     * @time 2016-11-29 16:40:18 周二
     */
    TreeView.prototype.getNodeListData = function(url, method, option){
        var nodeDataJsonUrl = url || '';
        if(nodeDataJsonUrl === ''){
            return null;
        }
        var _this = this;
        switch (method){
            case 'json':
                $.getJSON(nodeDataJsonUrl, function(data){
                    _default.settings.data = data;
                    _this.init(_default, option);
                });
                break;
            case 'get':
                $.ajax();
                return null;
        }
    };

    /**
     * @doc 显示错误
     * @param message
     */
    var logError = function (message) {
        if (window.console) {
            window.console.error(message);
        }
    };
    /**
     * @doc jQuery写法
     * @param options
     * @param args
     * @returns {*}
     */
    $.fn[pluginName] = function (options, args) {
        var result;
        this.each(function () {
            var _this = $.data(this, pluginName);
            if (typeof options === 'string') {
                if (!_this) {
                    logError('Not initialized, can not call method : ' + options);
                }
                else if (!$.isFunction(_this[options]) || options.charAt(0) === '_') {
                    logError('No such method : ' + options);
                }
                else {
                    if (!(args instanceof Array)) {
                        args = [ args ];
                    }
                    result = _this[options].apply(_this, args);
                }
            }
            else if (typeof options === 'boolean') {
                result = _this;
            }
            else {
                $.data(this, pluginName, new TreeView(this, $.extend(true, {}, options)));
            }
        });
        return result || this;
    };
})(jQuery, window, document);