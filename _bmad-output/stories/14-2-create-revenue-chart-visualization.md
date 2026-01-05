# Story 14.2: Create Revenue Chart Visualization

Status: ready-for-dev

## Story

As a vendor,
I want to see revenue trends over time,
So that I can identify patterns in my business.

## Acceptance Criteria

### AC 1: Revenue Chart Display
**Given** I am on the vendor analytics dashboard
**When** the revenue section loads
**Then** I see a line chart showing revenue over time

### AC 2: Chart Axes
**Given** the revenue chart is displayed
**When** I view the chart
**Then** I see:
- X-axis: time periods (days/weeks/months based on range)
- Y-axis: revenue in vendor's currency
- Line with data points

### AC 3: Interactive Chart
**Given** the chart is rendered
**When** I hover/tap on a data point
**Then** it shows exact value for each point

### AC 4: Chart Styling
**Given** the chart displays
**When** I view it
**Then** chart uses primary teal color
**And** "Total for Period" displayed above chart
**And** chart renders smoothly with animation on load

## Tasks / Subtasks

### Task 1: Choose Chart Library (AC: #1)
- [ ] Evaluate options: Victory Native, react-native-chart-kit, recharts
- [ ] Install chosen library (recommend Victory Native)
- [ ] Set up basic line chart component

### Task 2: Build Revenue Chart Component (AC: #1, #2, #4)
- [ ] Create RevenueChart component
- [ ] Configure X-axis with time labels
- [ ] Configure Y-axis with currency formatting
- [ ] Style with teal color (#0D7377)
- [ ] Add animation on mount
- [ ] Display "Total: $X,XXX" above chart

### Task 3: Prepare Chart Data (AC: #2)
- [ ] Aggregate revenue by time period (day/week/month)
- [ ] Format data for chart library
- [ ] Handle empty periods (show 0 revenue)
- [ ] Sort data chronologically

### Task 4: Add Interactivity (AC: #3)
- [ ] Implement tooltip on hover/press
- [ ] Show date and exact revenue value
- [ ] Add crosshair or highlight on active point
- [ ] Ensure smooth interactions

## Dev Notes

### Chart Data Format
```typescript
const chartData = [
  { x: '2024-01-01', y: 1250 },
  { x: '2024-01-02', y: 1800 },
  // ...
];
```

### Victory Native Example
```typescript
import { VictoryLine, VictoryChart, VictoryAxis } from 'victory-native';

<VictoryChart>
  <VictoryAxis dependentAxis />
  <VictoryAxis />
  <VictoryLine
    data={chartData}
    style={{ data: { stroke: '#0D7377', strokeWidth: 2 } }}
    animate={{ duration: 1000 }}
  />
</VictoryChart>
```

## References

- [Source: epics.md#Epic 14 - Story 14.2]
- [Related: Story 14.1]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
