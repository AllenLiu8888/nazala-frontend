// Step 1: Basic radar chart
import React from 'react';
import ReactApexChart from 'react-apexcharts';
import useGameStoreScreen from '../../../store/index_screen';

const RadarChart = () => {
    const radarData = useGameStoreScreen(s => s.world.radarData);
    const categories = useGameStoreScreen(s => s.world.categories);
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
                size: 200  // medium size
                }
            },
            grid: {
                padding: {
                left: 60,    // increase left padding
                right: 60    // increase right padding
                }
            },
            xaxis: {
                categories,
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
        data: Array.isArray(radarData) && radarData.length ? radarData : [0,0,0,0]
        }];
    
        return (
        <>
            <ReactApexChart 
            options={options} 
            series={series} 
            type="radar" 
            height={550}  // larger height
            width={800}   // larger width
            />
        </>
        );
    };
    
    export default RadarChart;