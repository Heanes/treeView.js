$(function () {
    /*$('#lapHandle').on('click', function (event) {
     var $treeListWrap = $('.tree-list-wrap');
     var $lapParent = $(this).closest('.tree-list-lap');
     if($lapParent.hasClass('lapped')){
     $lapParent.removeClass('lapped');
     $treeListWrap.removeClass('lapped');
     }else{
     $lapParent.addClass('lapped');
     $treeListWrap.addClass('lapped');
     }
     });*/
    var treeView = true;
    if(treeView) {
        $('.tree-left').treeView({
            data: treeData, // treeData From treeData.js
            iconCollapse: 'triangle-right',         // 合上时的图标
            iconExpand: 'triangle-down',            // 展开时的图标
            enableLink: true,                       // 开启链接
            enableTopSwitch: true,                  // 开启顶部切换标识
            enableIndentLeft: true,                 // 允许向左缩进
            enableTreeSearch: true,                 // 开启树菜单搜索
            enableCollapseAll: true,                // 开启树一键折叠展开
            treeSearchPlaceholder: '搜索(名称及链接)',// 树菜单搜索的提示字符
            showTopNavIcon: false,                  // 顶部导航是否显示图标
            topSwitcherTarget: $('.tree-top'),      // 开启了顶部切换后，根节点展示在此处，根节点展示在此处(填写jQuery Dom)

            onNodeClick: function (event, node, $nodeDom) {
                if(node.target && node.target === '_blank'){
                    window.open(node.href);
                    return false;
                }
                console.log('节点被点击：');
                console.log(node);
            },
            onTopSwitch: function (event) {
                console.log('顶部被点击，左侧会切换');
            },
            onTreeIndentLeft: function (event) {
                console.log('左侧树缩进');
            },    // 树向左边缩进事件
        });

        /*$('#test2').treeView({
            data: treeDataSimple, // treeData From treeData.js
            iconCollapse: 'triangle-right',         // 合上时的图标
            iconExpand: 'triangle-down',            // 展开时的图标
            enableIndentLeft: true,                 // 允许向左缩进
            enableLink: true,                       // 开启链接
            enableTopSwitch: true,                  // 开启顶部切换标识
            showTopNavIcon: false,                  // 顶部导航是否显示图标
            topSwitcherTarget: $('#test1'),         // 开启了顶部切换后，根节点展示在此处(填写jQuery Dom)

            onNodeClick: function (event, node, $nodeDom) {
                if(node.target && node.target === '_blank'){
                    window.open(node.href);
                    return false;
                }
                console.log('节点被点击：');
                console.log(node);
            }
        });*/
    }

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
    //console.log('***********************');
    var treeDataSimple11 = [
        {
            "text": "父菜单111111",
            "nodes": []
        },
        {
            "text": "父菜单2",
            "nodes": [
                {
                    "text": "子菜单2.1",
                    "nodes": []
                },
                {
                    "text": "子菜单2.2",
                    "nodes": [
                        /*{
                         "text": "子菜单2.2.1",
                         "nodes": [
                         {
                         "text": "子菜单2.2.1.1",
                         "nodes": []
                         }
                         ]
                         }*/
                    ]
                }
            ]
        },
        {
            "text": "父菜单3",
            "nodes": [
                {
                    "text": "子菜单3.1",
                    "nodes": []
                },
                {
                    "text": "子菜单3.2",
                    "nodes": [
                        {
                            "text": "子菜单3.2.1",
                            "nodes": []
                        },
                        {
                            "text": "子菜单3.2.2",
                            "nodes": []
                        }
                    ]
                }
            ]
        }
    ];

});