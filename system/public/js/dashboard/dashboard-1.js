(function($) {
    /* "use strict" */


 var dzChartlist = function(){
	//let draw = Chart.controllers.line.__super__.draw; //draw shadow
	var screenWidth = $(window).width();
	var btnAware = function (){
		
		$('.avtivity-card')
			.on('mouseenter', function(e) {
					var parentOffset = $(this).offset(),
					relX = e.pageX - parentOffset.left,
					relY = e.pageY - parentOffset.top;
					$(this).find('.effect').css({top:relY, left:relX})
			})
			.on('mouseout', function(e) {
					var parentOffset = $(this).offset(),
					relX = e.pageX - parentOffset.left,
					relY = e.pageY - parentOffset.top;
				$(this).find('.effect').css({top:relY, left:relX})
		});
	}
	var chartTimeline = function(){
		
		var optionsTimeline = {
			chart: {
				type: "bar",
				height: 320,
				stacked: true,
				toolbar: {
					show: false
				},
				sparkline: {
					
				},
				backgroundBarRadius: 5,
				offsetX: -10,
			},
			series: [
				 {
					name: "New Clients",
					data: [70, 20, 75, 20, 50, 40, 65, 15, 40, 55, 60, 20, 75, 40, 25, 70, 20, 40, 65, 50]
				},
				{
					name: "Retained Clients",
					data: [-60, -10, -50, -25, -30, -65, -22, -10, -50, -20, -70, -35, -60, -20, -30, -45, -70, -50, -45, -10]
				} 
			],
			
			plotOptions: {
				bar: {
					columnWidth: "20%",
					endingShape: "rounded",
					colors: {
						backgroundBarColors: ['rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)'],
						backgroundBarOpacity: 1,
						backgroundBarRadius: 5,
						opacity:0
					},

				},
				distributed: true
			},
			colors:['#0B2A97', '#FF9432'],
			
			grid: {
				show: true,
			},
			legend: {
				show: false
			},
			fill: {
				opacity: 1
			},
			dataLabels: {
				enabled: false,
				colors:['#0B2A97', '#FF9432'],
				dropShadow: {
					enabled: true,
					top: 1,
					left: 1,
					blur: 1,
					opacity: 1
				}
			},
			xaxis: {
				categories: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
				labels: {
					style: {
						colors: '#787878',
						fontSize: '13px',
						fontFamily: 'Poppins',
						fontWeight: 400
						
					},
				},
				axisTicks:{
					show:false,
					
				},
				crosshairs: {
					show: false,
				},
				axisBorder: {
					show: false,
				},
			},
			
			yaxis: {
				labels: {
					style: {
						colors: '#787878',
						fontSize: '13px',
						fontFamily: 'Poppins',
						fontWeight: 400
						
					},
				},
			},
			responsive: [{
				breakpoint: 575,
				
				options: {
					xaxis: {
						categories: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11']
					},
					
				},
			
			}],

			
			tooltip: {
				x: {
					show: true
				}
			}
    };
		var chartTimelineRender =  new ApexCharts(document.querySelector("#chartTimeline"), optionsTimeline);
		 chartTimelineRender.render();
	}
	
	var chartBar = function(){
		var optionsArea = {
          series: [{
            name: "Distance",
			type: 'line',
           
			data: [90, 120, 70, 130, 80, 140, 50]
          }
        ],
          chart: {
          height: 200,
          type: 'area',
		  group: 'social',
		  toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          },
		  dropShadow: {
				enabled: true,
				enabledOnSeries: undefined,
				top: 5,
				left: 0,
				blur: 3,
				color: '#000',
				opacity: 0.1
			},
        },
		
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [3],
		  colors:['#0b2a97'],
		  curve: 'smooth'
        },
        legend: {
			show:false,
          tooltipHoverFormatter: function(val, opts) {
            return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + ''
          },
		  
        },
        markers: {
		  strokeWidth: [3],
		  strokeColors: ['#0B2A97'],
		  border:0,
		  colors:['#fff'],
          hover: {
            size: 5,
          }
        },
        xaxis: {
          categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
		  axisTicks:false,
		  labels: {
		   style: {
			  colors: '#818995',
			  fontSize: '12px',
			   fontFamily: 'Poppins',
			  fontWeight: 50,
			  
			},
		  },
        },
		yaxis: {
			labels: {
			offsetX:-16,
		   style: {
			  colors: '#818995',
			  fontSize: '12px',
			   fontFamily: 'Poppins',
			  fontWeight: 50,
			  
			},
		  },
		},
		fill: {
			colors:['#0b2a97'],
			type:'solid',
			opacity: 1
		},
		colors:['#0B2A97'],
        grid: {
          borderColor: 'transparent',
		  xaxis: {
            lines: {
              show: true
            }
          }
        },
		 responsive: [
		 {
			breakpoint:1601,
			options:{
				chart: {
					height:400
				},
			},
		 }
			,{
			breakpoint: 768,
			options: {
				chart: {
					height:250
				},
				markers: {
				  strokeWidth: [4],
				  strokeColors: ['#0B2A97'],
				  border:0,
				  colors:['#fff'],
				  hover: {
					size: 6,
				  }
				},
				stroke: {
				  width: [6],
				  colors:['#0B2A97'],
				  curve: 'smooth'
				},
			}
		 }
		 ] 
        };
		var chartArea = new ApexCharts(document.querySelector("#chartBar"), optionsArea);
        chartArea.render();
		

	}	
	/* Function ============ */
		return {
			init:function(){
			},
			
			
			load:function(){
				btnAware();
				chartTimeline();
				chartBar();
			},
			
			resize:function(){
				
			}
		}
	
	}();

	jQuery(document).ready(function(){
	});
		
	jQuery(window).on('load',function(){
		setTimeout(function(){
			dzChartlist.load();
		}, 1000); 
		
	});

	jQuery(window).on('resize',function(){
		
		
	});     

})(jQuery);