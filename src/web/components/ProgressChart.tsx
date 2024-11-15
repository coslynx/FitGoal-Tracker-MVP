import React, { useEffect, useState } from 'react';
import { ProgressEntry } from '@api/models/progressInterface';
import { useProgress } from '@web/hooks/useProgress';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Label } from 'recharts';
import { CircularProgress, Typography } from '@material-ui/core';

interface ProgressChartProps {
  goalId: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ goalId }) => {
  const { progressEntries, getProgress, isLoading, error } = useProgress(goalId);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    getProgress();
  }, [goalId, getProgress]);

  useEffect(() => {
    const formattedData = progressEntries.map((entry) => ({
      date: entry.date.toLocaleDateString(),
      value: entry.progressValue,
    }));
    setChartData(formattedData);
  }, [progressEntries]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Typography color="error">Error fetching progress data: {error}</Typography>
    );
  }

  if (chartData.length === 0) {
    return <Typography>No progress data available.</Typography>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis>
          <Label angle={-90} position="left" style={{ textAnchor: 'middle' }}>
            Progress Value
          </Label>
        </YAxis>
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ProgressChart;
```