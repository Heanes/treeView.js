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
        iconCollapse: '',               // 合上时的图标
        iconExpand: '',                 // 展开时的图标
        iconEmpty: '',                  // 空节点时图标
        colorOnHover: '',               // 鼠标浮上时的前景颜色
        backgroundColorOnHover: '',     // 鼠标浮上时的背景颜色
        showIcon: true,                 // 是否显示图标
        some: ''                        // 待用
    };
    var nodeConf = {
        id: '',                     // ID
        text: '',                   // 名称
        href: '',                   // 链接
        nodeIcon: '',               // 节点图标
        iconSelected: '',           // 选中后激活的图标
        color: '',                  // 前景颜色
        backgroundColor: '',        // 背景颜色
        colorOnHover: '',           // 鼠标浮上时的前景颜色
        backgroundColorOnHover: '', // 鼠标浮上时的背景颜色
        selectable: true,           // 指定列表树的节点是否可选择。设置为false将使节点展开，并且不能被选择
        state: {
            selected: false,        // 选中的
            expanded: false,        // 是否展开的
            disabled: false,        // 是否启用的
            checked: false          // 是否勾选的，指示一个节点是否处于checked状态，用一个checkbox图标表示
        },
        nodes: [],                  // 子节点
        some: ''                    // 待用
    };
    var TreeView = function (element, options) {
        this.$element = $(element);
        this.init(options);
        return {
            // Options (public access)
            options: this.options,

            // Initialize / destroy methods
            init:                   $.proxy(this.init, this),
            remove:                 $.proxy(this.remove, this),

            // Methods
            // Expand / collapse methods
            collapseAll:            $.proxy(this.collapseAll, this),
            collapseNode:           $.proxy(this.collapseNode, this),
            expandAll:              $.proxy(this.expandAll, this),
            expandNode:             $.proxy(this.expandNode, this),
            toggleExpandedState:    $.proxy(this.toggleExpandedState, this),

            // prepare use
            test:                   $.proxy(this.test, this)
        };
    };

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
        this.options = $.extend({}, _default.settings, options);

        this.subscribeEvents();
        this.setInitialStates({ nodes: this.tree }, 0);
        console.log(this.tree);
        this.render();
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

            // 状态相关
            node.state = node.state || {};

            _this.nodes.push(node);
            // 递归
            if (node.nodes) {
                _this.setInitialStates(node, level);
            }
        });

    };
    /**
     * @doc 各类事件绑定
     */
    TreeView.prototype.subscribeEvents = function () {
        // 点击折叠/展开
        this.$element.on('click', $.proxy(this.clickHandler, this));
    };

    /**
     * @doc 点击折叠事件绑定
     * @time 2016-11-30 21:06:56 周三
     */
    TreeView.prototype.clickHandler = function (event) {
        console.log(this.$element);
        var $target = $(event.target);
        var node = this.findNode($target);
        if (!node || node.state.disabled) return;

        var classList = $target.attr('class') ? $target.attr('class').split(' ') : [];
        // 节点折叠事件
        if(classList.indexOf('expand-icon') != -1){
            this.toggleExpandedState();
            this.render(node, _default.options);
        }
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
     * @doc 设置节点为展开状态
     * @param node
     * @param state
     * @param options
     */
    TreeView.prototype.setExpandedState = function (node, state, options) {
        if (state === node.state.expanded) return;

        if (state && node.nodes) {
            node.state.expanded = true;
        }
    };

    TreeView.prototype.findNode = function ($target) {
        var $closet = $target.closest('li.tree-group-node');
        var nodeId = $closet.attr('data-nodeId');
        var node = this.nodes[nodeId];

        if (!node) {
            console.log('Error: node does not exist');
        }
        return node;
    };

    /**
     * @doc 获取节点是否是展开状态
     * @param nodeData 节点数据
     * @returns {boolean}
     * @author Heanes
     * @time 2016-11-29 19:37:05 周二
     */
    TreeView.prototype.getIsExpanded = function (nodeData) {
        return nodeData.state != undefined ? (nodeData.state.expanded != undefined && nodeData.state.expanded) : false;
    };
    /**
     * @doc 渲染左侧菜单
     * @author Heanes
     * @time 2016-11-29 16:49:23 周二
     */
    TreeView.prototype.render = function () {
        if (!this.initialized) {

            this.$treeListWrap = $(this.template.treeListWrap);
            this.$wrapper = $(this.template.list);
            this.$lapHandle = $(this.template.lapHandle);
            this.initialized = true;
        }
        this.$element.empty()
            .append(this.$lapHandle)
            .append(this.$treeListWrap
                .append(this.$wrapper.empty())
            );
        this.buildTree(this.tree, 0);
    };

    /**
     * @doc 添加顶部折叠
     */
    TreeView.prototype.addLap = function () {
        this.$element.empty();
        var lapHandle = this.template.lapHandle;
    };

    /**
     * @doc 构建树
     * @param nodes
     * @param level
     */
    TreeView.prototype.buildTree = function (nodes, level) {
        if (!nodes) return;
        level += 1;
        var _this = this;

        $.each(nodes, function addNodes(id, node) {
            var $treeItem = $(_this.template.node);
            $treeItem.attr('data-nodeId', node.nodeId);

            // 按子菜单层级缩进
            for (var i = 0; i < (level - 1); i++) {
                $treeItem.append(_this.template.indent);
            }

            // 添加折叠及其他样式
            var addClassList = [];
            if (node.nodes && node.nodes.length > 0) {
                addClassList.push('node-collapse-expand-icon');
                if (node.state.expanded) {
                    addClassList.push(_this.options.iconCollapse);
                }
                else {
                    addClassList.push(_this.options.iconExpand);
                }
                $treeItem
                    .append($(_this.template.icon)
                        .addClass(addClassList.join(' '))
                    );
            } else {
                addClassList.push(_this.options.iconEmpty);
            }


            // 添加图标及样式
            // 添加图标icon
            if (_this.options.showIcon) {
                var addIconClassList = ['node-icon'];
                addIconClassList.push(node.nodeIcon || _this.options.nodeIcon);
                $treeItem
                    .append($(_this.template.icon)
                        .addClass(addIconClassList.join(' '))
                    );
            }
            // 添加文字及链接
            $treeItem.append($(_this.template.nodeText)
                .append(node.text)
            );

            // 添加到dom中
            _this.$wrapper.append($treeItem);
            // 递归
            if (node.nodes) {
                return _this.buildTree(node.nodes, level);
            }
            console.log($treeItem);
        })
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
     * @doc 模版
     */
    TreeView.prototype.template = {
        treeListWrap:           '<div class="tree-list-wrap"></div>',
        list:                   '<ul class="tree-group"></ul>',
        node:                   '<li class="tree-group-node"></li>',
        link:                   '<a href="#"></a>',
        nodeText:               '<span class="node-text"></span>',
        indent:                 '<span class="indent"></span>',
        icon:                   '<i class="icon"></i>',
        badge:                  '<span class="badge"></span>', // 标记该菜单下有多少子菜单
        lapHandle:              '<div class="tree-list-lap">'
                                    + '<a href="javascript:" class="lap-handle" id="lapHandle" title="收缩/展开">'
                                    + '<i class="fa fa-exchange" aria-hidden="true"></i>'
                                    + '</a>'
                                + '</div>' // 折叠功能
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
     * @doc 获取父节点
     * @param identifier
     * @returns {*}
     */
    TreeView.prototype.getParent = function (identifier) {
        ;
    };
    /**
     * @doc 获取菜单数据
     * @author Heanes
     * @time 2016-11-29 16:40:18 周二
     */
    TreeView.prototype.getNodeListData = function(url, method){
        var nodeDataJsonUrl = url || '';
        if(nodeDataJsonUrl == ''){
            return null;
        }
        switch (method){
            case 'json':
                $.getJSON(nodeDataJsonUrl, function(data){
                    return data;
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