// 第1步：最基础的雷达图
import React from 'react';
import ReactApexChart from 'react-apexcharts';


const RadarChart = () => {
        const options = {
            chart: {
                type: 'radar',
                toolbar: { show: false }
            },
            colors: ['#ffffff'],
            fill: {
                type: 'gradient',
                gradient: {
                type: 'radial',
                opacityFrom: 0.3,
                opacityTo: 0.1
                }
            },
            plotOptions: {
                radar: {
                size: 200  // 适中大小
                }
            },
            grid: {
                padding: {
                left: 60,    // 关键：增加左边距
                right: 60    // 关键：增加右边距
                }
            },
            xaxis: {
                categories: ['Memory Fidelity', 'Technical Control', 'Pattern Cohesion', 'Autonomic Control'],
                labels: {
                    style: {
                        colors: '#00ffff',
                        fontSize: '14px'
                    }
                }
            },
            yaxis: { show: false },
            markers: { size: 8 }
        };
    
        const series = [{
        name: 'Score',
        data: [85, 90, 80, 75]
        }];
    
        return (
        <>
            <ReactApexChart 
            options={options} 
            series={series} 
            type="radar" 
            height={550}  // 更大的高度
            width={800}   // 更大的宽度
            />
        </>
        );
    };
    
    export default RadarChart;