
import { Component, ElementRef, ViewChild, input, effect, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

@Component({
  selector: 'app-metrics-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full flex flex-col">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest">{{ title() }}</h4>
        <span class="text-xs font-mono" [style.color]="color()">
          {{ latestValue() | number }}
        </span>
      </div>
      <div #chartContainer class="flex-1 w-full relative overflow-hidden">
      </div>
    </div>
  `
})
export class MetricsChartComponent implements AfterViewInit, OnDestroy {
  data = input.required<any[]>();
  dataKey = input.required<string>();
  title = input.required<string>();
  color = input<string>('#60a5fa');
  type = input<'area' | 'bar'>('area');

  @ViewChild('chartContainer') private chartContainer!: ElementRef<HTMLDivElement>;
  
  private svg: any;
  private resizeObserver: ResizeObserver | null = null;
  private width = 0;
  private height = 0;

  latestValue = (() => {
    const data = this.data();
    if (!data.length) return 0;
    return data[data.length - 1][this.dataKey()];
  });

  constructor() {
    effect(() => {
      // Re-render when data changes
      const d = this.data();
      if (this.svg) {
        this.updateChart();
      }
    });
  }

  ngAfterViewInit() {
    this.initChart();
    
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private resize() {
    if (this.chartContainer) {
      d3.select(this.chartContainer.nativeElement).selectAll('*').remove();
      this.initChart();
    }
  }

  private initChart() {
    const element = this.chartContainer.nativeElement;
    this.width = element.clientWidth;
    this.height = element.clientHeight;
    
    // Margins
    const margin = { top: 5, right: 0, bottom: 5, left: 0 };
    const width = this.width - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    this.svg = d3.select(element)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    this.updateChart();
  }

  private updateChart() {
    if (!this.svg) return;
    
    const data = this.data();
    const width = this.width;
    const height = this.height;
    const color = this.color();
    const key = this.dataKey();

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, (d: any) => d.time) as [number, number])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d[key]) * 1.1 || 100])
      .range([height, 0]);

    // Clear previous
    this.svg.selectAll('*').remove();

    // Gradient
    const gradientId = `gradient-${key}-${Math.random().toString(36).substr(2, 9)}`;
    const defs = this.svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.3);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.0);

    if (this.type() === 'area') {
      // Area
      this.svg.append('path')
        .datum(data)
        .attr('fill', `url(#${gradientId})`)
        .attr('d', d3.area()
          .x((d: any) => x(d.time))
          .y0(height)
          .y1((d: any) => y(d[key]))
          .curve(d3.curveMonotoneX)
        );

      // Line
      this.svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', d3.line()
          .x((d: any) => x(d.time))
          .y((d: any) => y(d[key]))
          .curve(d3.curveMonotoneX)
        );

    } else if (this.type() === 'bar') {
      const barWidth = width / data.length * 0.8;
      
      this.svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d: any) => x(d.time) - barWidth / 2)
        .attr('y', (d: any) => y(d[key]))
        .attr('width', barWidth)
        .attr('height', (d: any) => height - y(d[key]))
        .attr('fill', color)
        .attr('rx', 2);
    }
  }
}
