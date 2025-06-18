import { Clock } from 'lucide-react';

const CountdownTimer = ({ hours, minutes, seconds, t }: { hours: number; minutes: number; seconds: number; t: any }) => {
  return (
    <div className="flex items-center mb-6 p-3 bg-purple-50 rounded-md border border-purple-100 shadow">
      <Clock className="h-5 w-5 mr-2 text-purple-600" />
      <div>
        <div className="text-sm font-medium text-purple-600">{t('Limited Time Offer')}</div>
        <div className="text-lg font-bold">
          {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;