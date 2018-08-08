$(function () {

    var url = '../static/data/tree.json';
    getTreeData(url);

    function getTreeData(url){
        $.ajax({
            url: url,
            dataType: 'json',
            success: function (data) {
                renderTreeView($('.tree-left'), {data: data});
                return data;
            }
        });
    }


    function renderTreeView($target, option){
        $('.tree-left').treeView({
            data: option.data, // treeData From treeData.js
            iconCollapse: 'triangle-right',         // 合上时的图标
            iconExpand: 'triangle-down',            // 展开时的图标
            enableLink: true,                       // 开启链接
            enableTopSwitch: true,                  // 开启顶部切换标识
            enableIndentLeft: true,                 // 允许向左缩进
            enableTreeSearch: true,                 // 开启树菜单搜索
            treeSearchPlaceholder: '搜索(名称及链接)',// 树菜单搜索的提示字符
            showTopNavIcon: true,                   // 顶部导航是否显示图标
            $topTreeContainer: $('.tree-top'),      // 开启了顶部切换后，根节点展示在此处，根节点展示在此处(填写jQuery Dom)
            /*style: {
                topActive: {
                    bgColor: '#254f7b', // 顶部切换的激活后背景色 topActive.bgColor
                    color: '#fff' // 顶部切换的激活后字体色 topActive.color
                },
                topHover: {
                    bgColor: '#254f7b', // 侧边树的鼠标浮上背景色 topHover.bgColor #E7E7E7
                    color: '#fff' // 侧边树的鼠标浮上字体色 topHover.color
                },
                left: {
                    bgColor: '#f2f2f2', // 侧边树的背景色 left.Bg.Color
                    color: '#353535' // 侧边树的字体色 left.color
                },
                leftSelected: {
                    bgColor: '#666', // 侧边树的选中后的背景色 leftSelected.bgColor
                    color: '#fff' // 侧边树的选中后的字体色 leftSelected.color
                },
                leftHover: {
                    bgColor: '#666', // 侧边树的鼠标浮上背景色 leftHover.bgColor
                    color: '#fff' // 侧边树的鼠标浮上字体色 leftHover.color
                },
                leftNodeExpanded: {
                    bgColor: '#eee', // 侧边树的节点展开时背景色 leftNodeExpanded.bgColor
                    color: '#353535' // 侧边树的节点展开时字体色 leftNodeExpanded.color
                }
            }, // 样式相关*/

            onNodeClick: function (event, node, $nodeDom) {
                if(node.target && node.target === '_blank'){
                    window.open(node.href);
                    return false;
                }
                alert('节点被点击\n' +  JSON.stringify(node, null, 4));
            },
            onTopSwitch: function (event, node, $nodeDom) {
                if(node.href){
                    window.open(node.href);
                    return false;
                }
                console.log('顶部被点击，左侧会切换');
            },
            onLeftTreeContract: function (event) {
                console.log('左侧树缩进');
            },    // 树向左边缩进事件
        });
    }

});