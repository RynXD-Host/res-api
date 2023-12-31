(function($) {
    /* "use strict" */


 var dzChartlist = function(){
	//let draw = Chart.controllers.line.__super__.draw; //draw shadow
	var screenWidth = $(window).width();
	var chartBar = function(){
		var optionsArea = {
          series: [{
            name: "Running",
            data: [20, 40, 20, 80, 40, 40]
          }
        ],
          chart: {
          height: 400,
          type: 'area',
		  group: 'social',
		  toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [4],
		  colors:['#A02CFA'],
		  curve: 'smooth'
        },
        legend: {
			show:false,
          tooltipHoverFormatter: function(val, opts) {
            return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + ''
          },
		  markers: {
			fillColors:['#A02CFA'],
			width: 19,
			height: 19,
			strokeWidth: 0,
			radius: 19
		  }
        },
        markers: {
		  strokeWidth: [4],
		  strokeColors: ['#A02CFA'],
		  border:0,
		  colors:['#fff'],
          hover: {
            size: 6,
          }
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		  labels: {
		   style: {
			  colors: '#787878',
			  fontSize: '14px',
			   fontFamily: 'Poppins',
			  fontWeight: 100,
			  
			},
		  },
        },
		yaxis: {
			labels: {
			offsetX:-16,
		   style: {
			  colors: '#787878',
			  fontSize: '14px',
			   fontFamily: 'Poppins',
			  fontWeight: 100,
			  
			},
		  },
		},
		fill: {
			colors:['#A02CFA'],
			type:'solid',
			opacity: 0.7
		},
		colors:['#A02CFA'],
        grid: {
          borderColor: '#f1f1f1',
		  xaxis: {
            lines: {
              show: true
            }
          }
        },
		responsive: [{
			breakpoint: 575,
			options: {
				chart: {
					height: 250,
				}
			}
		 }]
        };
		var chartArea = new ApexCharts(document.querySelector("#chartBar"), optionsArea);
        chartArea.render();

	}
	var chartBar2 = function(){
		var optionsArea = {
          series: [{
            name: "Running",
            data: [40, 40, 30, 90, 10, 80]
          }
        ],
          chart: {
          height: 400,
          type: 'area',
		  group: 'social',
		  toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [4],
		  colors:['#FF3282'],
		  curve: 'smooth'
        },
        legend: {
			show:false,
          tooltipHoverFormatter: function(val, opts) {
            return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + ''
          },
		  markers: {
			fillColors:['#FF3282'],
			width: 19,
			height: 19,
			strokeWidth: 0,
			radius: 19
		  }
        },
        markers: {
		  strokeWidth: [4],
		  strokeColors: ['#FF3282'],
		  border:0,
		  colors:['#fff'],
          hover: {
            size: 6,
          }
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		  labels: {
		   style: {
			  colors: '#787878',
			  fontSize: '14px',
			   fontFamily: 'Poppins',
			  fontWeight: 100,
			  
			},
		  },
        },
		yaxis: {
			labels: {
			offsetX:-16,
		   style: {
			  colors: '#787878',
			  fontSize: '14px',
			   fontFamily: 'Poppins',
			  fontWeight: 100,
			  
			},
		  },
		},
		fill: {
			colors:['#FF3282'],
			type:'solid',
			opacity: 0.7
		},
		colors:['#FF3282'],
        grid: {
          borderColor: '#f1f1f1',
		  xaxis: {
            lines: {
              show: true
            }
          }
        },
		 responsive: [{
			breakpoint: 575,
			options: {
				chart: {
					height: 250,
				}
			}
		 }]
        };
		var chartArea = new ApexCharts(document.querySelector("#chartBar2"), optionsArea);
        chartArea.render();

	}
	var chartBar3 = function(){
		var optionsArea = {
          series: [{
            name: "Running",
            data: [20, 15, 50, 20, 50, 30]
          }
        ],
          chart: {
          height: 400,
          type: 'area',
		  group: 'social',
		  toolbar: {
            show: false
          },
          zoom: {
            enabled: false
          },
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [4],
		  colors:['#FFBC11'],
		  curve: 'smooth'
        },
        legend: {
			show:false,
          tooltipHoverFormatter: function(val, opts) {
            return val + ' - ' + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] + ''
          },
		  markers: {
			fillColors:['#FFBC11'],
			width: 19,
			height: 19,
			strokeWidth: 0,
			radius: 19
		  }
        },
        markers: {
		  strokeWidth: [4],
		  strokeColors: ['#FFBC11'],
		  border:0,
		  colors:['#fff'],
          hover: {
            size: 6,
          }
        },
        xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
		  labels: {
		   style: {
			  colors: '#787878',
			  fontSize: '14px',
			   fontFamily: 'Poppins',
			  fontWeight: 100,
			  
			},
		  },
        },
		yaxis: {
			labels: {
			offsetX:-16,
		   style: {
			  colors: '#787878',
			  fontSize: '14px',
			   fontFamily: 'Poppins',
			  fontWeight: 100,
			  
			},
		  },
		},
		fill: {
			colors:['#FFBC11'],
			type:'solid',
			opacity: 0.7
		},
		colors:['#FFBC11'],
        grid: {
          borderColor: '#f1f1f1',
		  xaxis: {
            lines: {
              show: true
            }
          }
        },
		 responsive: [{
			breakpoint: 575,
			options: {
				chart: {
					height: 250,
				}
			}
		 }] 
        };
		var chartArea = new ApexCharts(document.querySelector("#chartBar3"), optionsArea);
        chartArea.render();

	}
	
	var pieChart = function(){
		var options = {
          series: [20, 35, 45],
          chart: {
          type: 'donut',
		  height:200,
        },
		legend: {
			show:false,
		},
		fill:{
			colors:['#FF9900','#0B2A97','#A02CFA']
		},
		stroke:{
			width:0,
		},
		colors:['#FF9900','#0B2A97','#A02CFA'],
		dataLabels: {
          enabled: false
        }
        };

        var chart = new ApexCharts(document.querySelector("#pieChart"), options);
        chart.render();
	}
	var radialBar = function(){
		 var options = {
          series: [81],
          chart: {
          height: 280,
          type: 'radialBar',
          offsetY: -10
        },
        plotOptions: {
          radialBar: {
            startAngle: -135,
            endAngle: 135,
            dataLabels: {
              name: {
                fontSize: '16px',
                color: undefined,
                offsetY: 120
              },
              value: {
                offsetY: 0,
                fontSize: '34px',
                color: 'black',
                formatter: function (val) {
                  return val + "%";
                }
              }
            }
          }
        },
        fill: {
          type: 'gradient',
		  colors:'#0B2A97',
          gradient: {
              shade: 'dark',
              shadeIntensity: 0.15,
              inverseColors: false,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 50, 65, 91]
          },
        },
        stroke: {
			lineCap: 'round',
		  colors:'#0B2A97'
        },
        labels: [''],
        };

        var chart = new ApexCharts(document.querySelector("#radialBar"), options);
        chart.render();
	}
	var donutChart = function(){
		$("span.donut").peity("donut", {
			width: "90",
			height: "90"
		});
	}	
	/* Function ============ */
		return {
			init:function(){
			},
			
			
			load:function(){
				chartBar();
				chartBar2();
				chartBar3();
				pieChart();
				radialBar();
				donutChart();
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