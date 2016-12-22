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
            enableIndentLeft: true,                 // 允许向左缩进
            enableLink: true,                       // 开启链接
            enableTopSwitch: true,                  // 开启顶部切换标识
            topSwitcherTarget: '.tree-top',     // 开启了顶部切换后，根节点展示在此处(填写jQuery选择器支持的字符)

            onNodeSelected: function (event, node) {
                console.log('节点被点击：');
                console.log(node);
            }
        });
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
    var treeDataSimple = [
        {
            "text": "父菜单1",
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
    var $target = $('<div class="wrap"></div>');
    var $groupWrap = $('<div class="group-wrap"></div>');
    function testRecursive(data, level) {
        level += 1;
        var $ul = level == 1 ? '' : $('<ul></ul>');
        $.each(data, function addNodes(i, item) {
            // 第一级节点都用ul包住
            level == 1 ? $ul = $('<ul></ul>') : null;

            var $li = $('<li></li>');
            $li.append(item.text);
            $ul.append($li);
            console.log('level:' + level);
            if(item.nodes && item.nodes.length > 0){
                $li.append(testRecursive(item.nodes, level));
            }
            if(level == 1){
                $target.append($ul);
            }
            /*console.log('target:' + $target.html());
             console.log('level-after:' + level);
             console.log('-----------------------------------');*/
        });
        console.log('level > 1 : ul:' + $ul.html());
        return $ul;
    }
    //$target.append(testRecursive(treeDataSimple, 0));
    $('body').append($target);
    //console.log($target.html());

});