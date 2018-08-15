


;(function () {
  
  'use strict';
  var $new_task_form = $('.newtask'),
      $task_detail = $('.task-detail'),
      $mask = $('.mask'),
      $task_detail_content = $task_detail.find('.content'),
      $task_detail_content_fix = $task_detail.find('[type = text]'),
      $alerter = $('.alerter'),
      $delete_task,
      $show_task, 
      $complete_task,
      cur_index, //当前被点击详情的任务的index
      task_list = []; //保存任务列表，每一项是一个对象
  
  init();

  // 给表单绑定事件，每次提交时将input中的内容添加到任务列表
  $new_task_form.on('submit',function(e){
    e.preventDefault();
    var new_task = {};       //每次提交时都产生一个新的new_task对象
    var $input = $(this).find('input');
    new_task.content = $input.val();
    if(!new_task.content) return;
    addTask(new_task);
    
    // 添加完成后将输入框清空
    $input.val('');
  });

  //点击mask时隐藏详情栏
  $mask.on('click',hideDetail);

  //信息栏的隐藏键点击后隐藏提示信息
  $('.msg-hider').on('click',function(){
    $('.msg').hide();
  })

  //点任务详情的标题时，显示Input,并隐藏标题
  $task_detail_content.on('click',function(){
    $task_detail_content.hide();
    $task_detail_content_fix.val($task_detail_content.html());
    $task_detail_content_fix.show();
  })

  //详情表单提交时，存储数据并更新页面
  $task_detail.on('submit',function(e){
    e.preventDefault();
    var $this = $(this);

    if($task_detail_content_fix.val()){
      task_list[cur_index].content = $task_detail_content_fix.val();
    }  
    task_list[cur_index].desc = $this.find('textarea').val();
    task_list[cur_index].remind_date = $this.find('[type = time]').val();
    task_list[cur_index].informed = false;
    store.set('task_list',task_list);

    hideDetail();
    renderTaskList();
  })

  // 为所有删除按钮（包括新增的）添加点击事件
  function addDeleteListener(){
    $delete_task.on('click',function(){
      var $this = $(this);
      var $item = $this.parent();       
      var index = $item.data('index');  //自定义数据
      var temp = confirm('确定删除？')
      if(temp){
        deleteTask(index);
      }
    })
  }

  // 为所有详情按钮（包括新增的）添加点击事件
  function addDetailListener(){
    $show_task.on('click',function(){
      var $this = $(this);
      var $item = $this.parent();      
      var index = $item.data('index');  
      cur_index = index; //当前编辑项的index
      showDetail(index);
    })
  }

  // 为所有打勾框（包括新增的）添加点击事件
  function addCompleteListener(){
    $complete_task.on('click',function(){
      var $this = $(this);
      var $item = $this.parent();      
      var index = $item.data('index');  
      var is_completed = $this.is(':checked'); 
      task_list[index].complete = is_completed;
      store.set('task_list',task_list);
      renderTaskList();
    })
  }


  // 初始化，读取数据
  function init(){
    task_list = store.get('task_list') || [];  
    if(task_list.length){
      renderTaskList();
    } 
    checkRemindTime();   
  }

  // 检查提示时间
  function checkRemindTime(){
    var cur_time;
    var itl = setInterval(function(){
      for(var i=0;i<task_list.length;i++){
        var item = task_list[i];
        if(!item || !item.remind_date || item.informed || item.complete){      
          continue;
        }
        cur_time = new Date();  
        if(cur_time.getHours() == item.remind_date.split(':')[0] && 
          cur_time.getMinutes() == item.remind_date.split(':')[1]){
          notify(item.content);
          item.informed = true; 
        }
      }
    },1000); 
  }

  //显示通知栏
  function notify(msg){
    $('.msg-content').html(msg);
    $('.msg').show();
    $alerter.get(0).play();  
  }

  // 存储新增项并更新
  function addTask(new_task){
    task_list.unshift(new_task); 
    store.set('task_list',task_list);
    renderTaskList();
  }

  function deleteTask(index){
    if(!task_list[index]) return;
    task_list.splice(index,1);
    store.set('task_list',task_list);
    renderTaskList();
  }


  function showDetail(index){
    $task_detail.show();
    $mask.show();
    renderTaskDetail(index);
  }

  function hideDetail(){
    //隐藏修改框
    $task_detail_content.show();
    $task_detail_content_fix.hide();

    $task_detail.hide();
    $mask.hide();
  }

  // 根据传入的对象生成HTML元素
  function makeListItem(data,index){
    if(!data || !task_list[index]) return;
    var list_item =  
      '<div class="task-item" data-index = '+ index + ' > ' +
      '<input type="checkbox" class="complete" ' +
      (data.complete?'checked':'') + 
      '>'+
      '<span class="task-content">' + data.content + '</span>'+
      '<span class="del">删除</span>'+
      '<span class="detail">详情</span>'+
      '</div>';
    return $(list_item);
  }

  // 渲染任务列表
  function renderTaskList(){
    var $task_list = $('.task-list');
    $task_list.html('');
    for(var i = 0;i<task_list.length;i++){
      var $item = makeListItem(task_list[i],i);
      //对于已完成的任务，新加样式
      if(task_list[i].complete){
        $item.addClass('completed');
      }
      $task_list.append($item);
    }

    $delete_task = $('.del');
    $show_task = $('.detail');
    $complete_task = $('.complete')

    addDeleteListener();
    addDetailListener();
    addCompleteListener();
  }

  // 渲染指定任务的详情，即把task_list中指定任务的属性取出并显示在表中
  function renderTaskDetail(index){
    $task_detail_content.html(task_list[index].content);
    $task_detail.find('textarea').val(task_list[index].desc);
    $task_detail.find('[type = time]').val(task_list[index].remind_date);
  }

})();