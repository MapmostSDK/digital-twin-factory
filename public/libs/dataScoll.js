 // 数字滚动
 function numInit() {
    $('.counter-value').each(function() {  
        var $this = $(this);  
        var target = parseInt($this.text(), 10); // 获取目标值并转换为整数  
        var start = 0;  
        var duration = 2500; // 动画持续时间  
        var interval = setInterval(function() {  
            if (start >= target) {  
                clearInterval(interval); // 达到目标值后清除定时器  
            } else {  
                var increment = Math.ceil((target - start) * (25 / duration)) // 计算每次增长的量  
                start += increment;  
                $this.text(start);  
            }  
        }, 2500); // 每25毫秒更新一次  
    });
 }
 numInit();