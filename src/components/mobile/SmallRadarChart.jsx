// Step 1: Basic radar chart
import React from 'react';
import ReactApexChart from 'react-apexcharts';


const SmallRadarChart = () => {
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
                size: 120  // Smaller radius for mobile
                }
            },
            grid: {
                padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
                }
            },
            xaxis: {
                categories: ['Memory Fidelity', 'Technical Control', 'Pattern Cohesion', 'Autonomic Control'],
                labels: {
                    style: {
                        colors: '#00ffff',
                        fontSize: '10px'
                    }
                }
            },
            yaxis: { show: false },
            markers: { size: 4 }
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
            height={220}
            width={320}
            />
        </>
        );
    };
    
    export default SmallRadarChart;